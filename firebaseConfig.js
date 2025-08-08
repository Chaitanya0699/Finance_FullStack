// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBXsR3lQludrXUZAtgnSB4JmBtyVfPLfU",
  authDomain: "my-finance---trail.firebaseapp.com",
  projectId: "my-finance---trail",
  storageBucket: "my-finance---trail.firebasestorage.app",
  messagingSenderId: "151740749193",
  appId: "1:151740749193:web:16f0740d30dffa8f29fd58",
  measurementId: "G-2PS4YQ8MKW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
