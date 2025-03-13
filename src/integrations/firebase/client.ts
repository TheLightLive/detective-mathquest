
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4HEVwItV6ZRnDlLHaKZ-9rI3_YemHgNk",
  authDomain: "mathdetecti.firebaseapp.com",
  projectId: "mathdetecti",
  storageBucket: "mathdetecti.firebasestorage.app",
  messagingSenderId: "455254755561",
  appId: "1:455254755561:web:1a3250791f362286fb0878",
  measurementId: "G-G0XFRCV0SD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics may not work in development
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics failed to initialize", error);
}
export { analytics };
