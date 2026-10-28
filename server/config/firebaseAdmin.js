import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAuth;

export const isFirebaseAdminConfigured = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

export const getFirebaseAdminAuth = () => {
  if (firebaseAuth) return firebaseAuth;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) return null;

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.');
  }

  const app = getApps().find((item) => item.name === '[DEFAULT]') || initializeApp({
    credential: cert(serviceAccount)
  });
  firebaseAuth = getAuth(app);
  return firebaseAuth;
};
