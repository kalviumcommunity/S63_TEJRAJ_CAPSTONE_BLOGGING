// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3a9dnbDF7ZbIbwjDZLwIZNIKxPR4fy5c",
  authDomain: "blogging-e000f.firebaseapp.com",
  projectId: "blogging-e000f",
  storageBucket: "blogging-e000f.firebasestorage.app",
  messagingSenderId: "446094632018",
  appId: "1:446094632018:web:c04d2234a623506179eb8b",
  measurementId: "G-RFT9CYFM2W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
