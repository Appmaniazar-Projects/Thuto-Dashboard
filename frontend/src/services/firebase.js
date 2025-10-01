// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if measurementId is provided and not in demo mode
let analytics = null;
try {
  if (firebaseConfig.measurementId && firebaseConfig.measurementId !== "G-XXXXXXXXXX") {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Firebase Analytics initialization failed:', error);
}

const auth = getAuth(app);

// Initialize Firestore with persistence and disable network
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true, // Force long polling instead of WebSockets
  experimentalAutoDetectLongPolling: true,
});

const storage = getStorage(app);

// Export auth and other Firebase services
export {
  auth,
  db,
  storage,
  analytics,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
};

export default app;
