import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS0csFzUTn1sR84B2Z0oaWADzazztQeKE",
  authDomain: "blogii-d055c.firebaseapp.com",
  projectId: "blogii-d055c",
  storageBucket: "blogii-d055c.firebasestorage.app",
  messagingSenderId: "292600101057",
  appId: "1:292600101057:web:45208d3a45ba525fcc3c40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Apply custom settings to provider
googleProvider.setCustomParameters({
  prompt: "select_account"
});
