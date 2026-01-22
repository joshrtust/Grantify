// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Template Firebase configuration - copy to FirebaseConfig.ts and add your real values
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.FIREBASE_APP_ID || "1:000000000000:web:placeholder"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
