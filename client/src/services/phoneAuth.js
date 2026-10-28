let authPromise;
let recaptchaVerifier;

const getConfiguredAuth = async () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  const missing = Object.entries(config).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Phone OTP is not configured. Missing Firebase settings: ${missing.join(', ')}.`);
  }

  if (!authPromise) {
    authPromise = Promise.all([import('@firebase/app'), import('@firebase/auth')]).then(
      async ([firebaseApp, firebaseAuth]) => {
        const app = firebaseApp.getApps().length ? firebaseApp.getApp() : firebaseApp.initializeApp(config);
        const auth = firebaseAuth.getAuth(app);
        await firebaseAuth.setPersistence(auth, firebaseAuth.inMemoryPersistence);
        return { auth, firebaseAuth };
      }
    );
  }
  return authPromise;
};

const normalizeE164Phone = (phone) => {
  const normalized = String(phone || '').replace(/[\s().-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    throw new Error('Enter your phone number with country code, for example +919876543210.');
  }
  return normalized;
};

export const sendPhoneOtp = async (phone) => {
  const { auth, firebaseAuth } = await getConfiguredAuth();
  const phoneNumber = normalizeE164Phone(phone);
  const container = document.getElementById('recaptcha-container');
  if (!container) {
    throw new Error('Phone verification is unavailable. Refresh the page and try again.');
  }

  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  recaptchaVerifier = new firebaseAuth.RecaptchaVerifier(auth, container, { size: 'invisible' });

  try {
    return await firebaseAuth.signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  } catch (error) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
    throw error;
  }
};

export const verifyPhoneOtp = async (confirmationResult, code) => {
  if (!confirmationResult) {
    throw new Error('Request a verification code first.');
  }
  if (!/^\d{6}$/.test(String(code || '').trim())) {
    throw new Error('Enter the 6-digit code sent to your phone.');
  }

  const credential = await confirmationResult.confirm(String(code).trim());
  const idToken = await credential.user.getIdToken();
  const { auth } = await getConfiguredAuth();
  await auth.signOut();
  return idToken;
};
