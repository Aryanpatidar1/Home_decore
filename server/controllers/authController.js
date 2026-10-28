import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'aura_decor_jwt_secret_dev_key_2026_xyz', {
    expiresIn: '7d'
  });
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const phoneLookupPattern = (digits) => new RegExp(
  `^\\+?${digits.split('').join('[\\s().-]*')}$`
);

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
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

    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
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
      if (!String(req.body.phone).trim()) {
        user.phone = undefined;
      } else {
        const normalizedPhone = normalizePhone(req.body.phone);
        if (normalizedPhone.length < 7 || normalizedPhone.length > 15) {
          return res.status(422).json({ message: 'Enter a valid phone number with 7 to 15 digits.' });
        }
        const existingUser = await User.findOne({
          _id: { $ne: user._id },
          phone: { $regex: phoneLookupPattern(normalizedPhone) }
        }).select('_id');
        if (existingUser) {
          return res.status(409).json({ message: 'An account with this phone number already exists.' });
        }
        user.phone = normalizedPhone;
      }
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
