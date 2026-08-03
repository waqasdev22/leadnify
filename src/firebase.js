import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCM6FECzAa6maN6UF6O0JaSPAsqaO__ePc",
  authDomain: "cre-dashboard-ba596.firebaseapp.com",
  projectId: "cre-dashboard-ba596",
  storageBucket: "cre-dashboard-ba596.firebasestorage.app",
  messagingSenderId: "61869941233",
  appId: "1:61869941233:web:2916ca3f3c74c3f181e450",
  measurementId: "G-6MTLZBM1EF"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();