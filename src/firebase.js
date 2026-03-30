// src/firebase.js
// ─────────────────────────────────────────────────────────────
// Firebase initialisation.
//
// HOW TO USE:
//   1. Go to https://console.firebase.google.com
//   2. Create / open your project → Project settings → Your apps
//   3. Add a Web app and copy the firebaseConfig object values.
//   4. Replace the placeholder strings below with your real values.
//      (Never commit real secrets to a public repo – use environment
//       variables in a production deployment instead.)
// ─────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredVars = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(requiredVars)
  .filter(([, v]) => !v)
  .map(([k]) => `VITE_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missing.length > 0) {
  console.warn(
    '[Firebase] Missing environment variables:\n' +
    missing.join('\n') +
    '\nCopy .env.example to .env.local and fill in your Firebase project values.'
  );
}

const app  = initializeApp(requiredVars);
export const auth = getAuth(app);
export default app;
