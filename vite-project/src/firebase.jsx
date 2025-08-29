// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsgyFSIkW__hYHgjL9QgQyxd2IL74ubVY",
  authDomain: "website-a1db3.firebaseapp.com",
  projectId: "website-a1db3",
  storageBucket: "website-a1db3.firebasestorage.app",
  messagingSenderId: "309944314904",
  appId: "1:309944314904:web:fb3fa5da4675e59989e76d",
  measurementId: "G-3NF7FXSB3T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider(); // ✅ Add Google provider

// ✅ Export all
export { auth, db, provider };
