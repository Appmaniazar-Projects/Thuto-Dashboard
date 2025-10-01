// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
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

// Configure Auth to use local persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// Initialize Firestore with persistence and disable WebSockets
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalAutoDetectLongPolling: true,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics only if measurementId is provided and not in demo mode
let analytics = null;
const initAnalytics = async () => {
  try {
    if (firebaseConfig.measurementId && firebaseConfig.measurementId !== "G-XXXXXXXXXX") {
      const isSupportedAnalytics = await isSupported();
      if (isSupportedAnalytics) {
        analytics = getAnalytics(app);
        // Disable analytics auto collection if not needed
        if (analytics.isSupported()) {
          analytics.setAnalyticsCollectionEnabled(true);
        }
      }
    }
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
  }
};

initAnalytics();

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
