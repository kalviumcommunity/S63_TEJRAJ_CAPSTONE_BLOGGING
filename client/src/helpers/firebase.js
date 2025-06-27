import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from "firebase/app";
import { getEnv } from "./getEnv";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API'),
  authDomain: "blogging-web-97bed.firebaseapp.com",
  projectId: "blogging-web-97bed",
  storageBucket: "blogging-web-97bed.firebasestorage.app",
  messagingSenderId: "160077575768",
  appId: "1:160077575768:web:a416afefbb5599b9dfbc2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()
           
export {auth, provider}

//////