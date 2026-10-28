import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from '../config/firebaseAdmin.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aura_decor_jwt_secret_dev_key_2026_xyz', {
    expiresIn: '7d'
  });
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const phoneLookupPattern = (digits) => new RegExp(
  `^\\+?${digits.split('').join('[\\s().-]*')}$`
);

const verifyPhoneIdToken = async (idToken) => {
  let firebaseAuth;
  try {
    firebaseAuth = getFirebaseAdminAuth();
  } catch {
    return { error: { status: 503, message: 'Phone OTP service is misconfigured on the server.' } };
  }
  if (!firebaseAuth) {
    return { error: { status: 503, message: 'Phone OTP is not configured on the server yet.' } };
  }

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken, true);
    if (!decodedToken.phone_number) {
      return { error: { status: 401, message: 'The verified Firebase account has no phone number.' } };
    }
    return { phone: decodedToken.phone_number };
  } catch {
    return { error: { status: 401, message: 'The phone verification code is invalid or expired. Request a new code.' } };
  }
};

const issueSession = (res, user, status = 200) => {
  const token = generateToken(user._id);
  return res.status(status).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses
    }
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, phoneIdToken } = req.body;

    if (!name || !email || !phone || !password || !phoneIdToken) {
      return res.status(422).json({ message: 'Name, email, phone number, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(422).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
      return res.status(422).json({ message: 'Enter a valid phone number with 7 to 15 digits.' });
    }
    if (!isFirebaseAdminConfigured()) {
      return res.status(503).json({ message: 'Phone OTP is not configured on the server yet.' });
    }

    const phoneVerification = await verifyPhoneIdToken(phoneIdToken);
    if (phoneVerification.error) {
      return res.status(phoneVerification.error.status).json({ message: phoneVerification.error.message });
    }
    if (normalizePhone(phoneVerification.phone) !== normalizedPhone) {
      return res.status(403).json({ message: 'Verify the same phone number entered for this account.' });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: { $regex: phoneLookupPattern(normalizedPhone) } }
      ]
    });
    if (existingUser) {
      const duplicateField = existingUser.email === normalizedEmail ? 'email address' : 'phone number';
      return res.status(409).json({ message: `An account with this ${duplicateField} already exists.` });
    }

    // Set first registered user or specific email as admin for management convenience
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role
    });

    return issueSession(res, user, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginIdentifier = String(identifier || email || phone || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(422).json({ message: 'Email or phone number and password are required.' });
    }

    const isEmail = loginIdentifier.includes('@');
    let userQuery;
    if (isEmail) {
      userQuery = { email: loginIdentifier.toLowerCase() };
    } else {
      const normalizedPhone = normalizePhone(loginIdentifier);
      if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
        return res.status(422).json({ message: 'Enter a valid email address or phone number.' });
      }
      userQuery = { phone: { $regex: phoneLookupPattern(normalizedPhone) } };
    }

    const user = await User.findOne(userQuery);
    if (!user) {
      return res.status(401).json({ message: 'The provided credentials do not match our records.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'The provided credentials do not match our records.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginWithPhoneOtp = async (req, res, next) => {
  try {
    const { phoneIdToken } = req.body;
    if (!phoneIdToken) {
      return res.status(422).json({ message: 'Complete phone verification first.' });
    }
    if (!isFirebaseAdminConfigured()) {
      return res.status(503).json({ message: 'Phone OTP is not configured on the server yet.' });
    }

    const phoneVerification = await verifyPhoneIdToken(phoneIdToken);
    if (phoneVerification.error) {
      return res.status(phoneVerification.error.status).json({ message: phoneVerification.error.message });
    }

    const normalizedPhone = normalizePhone(phoneVerification.phone);
    const user = await User.findOne({ phone: { $regex: phoneLookupPattern(normalizedPhone) } });
    if (!user) {
      return res.status(404).json({ message: 'No account is registered with this phone number. Sign up first.' });
    }

    return issueSession(res, user);
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) {
      const normalizedPhone = normalizePhone(req.body.phone);
      if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
        return res.status(422).json({ message: 'Enter a valid phone number with 7 to 15 digits.' });
      }

      if (normalizedPhone !== normalizePhone(user.phone)) {
        const phoneVerification = await verifyPhoneIdToken(req.body.phoneIdToken);
        if (phoneVerification.error) {
          return res.status(phoneVerification.error.status).json({ message: phoneVerification.error.message });
        }
        if (normalizePhone(phoneVerification.phone) !== normalizedPhone) {
          return res.status(403).json({ message: 'Verify the same phone number entered for your profile.' });
        }

        const existingUser = await User.findOne({
          _id: { $ne: user._id },
          phone: { $regex: phoneLookupPattern(normalizedPhone) }
        }).select('_id');
        if (existingUser) {
          return res.status(409).json({ message: 'An account with this phone number already exists.' });
        }
      }
      user.phone = normalizedPhone;
    }
    if (req.body.addresses) user.addresses = req.body.addresses;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};
