import { initializeApp, deleteApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

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
export const fdb = getFirestore(app); // Cloud Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Exchange a social OAuth code (LinkedIn/Instagram) on the server for the real connected
// account. Returns { provider, name, email/username, ... } — no secrets ever touch the browser.
export async function connectSocialAccount({ provider, code, redirectUri }) {
  const call = httpsCallable(functions, "connectSocial");
  const res = await call({ provider, code, redirectUri });
  return res.data;
}

// Owner/Admin sets a team member's password directly (server-side via the Admin SDK, since
// the browser can't change another user's password). The member can then sign in with it.
export async function setMemberPassword({ uid, password }) {
  const call = httpsCallable(functions, "adminSetPassword");
  const res = await call({ uid, password });
  return res.data;
}

// Upload a file to Firebase Storage and return its public download URL.
// Images live in the cloud; only the small URL is stored in the document —
// so large photos never blow the browser's localStorage quota.
// `folder` groups a property's files together, e.g. uploads/<property>/<file>, so the Storage
// console shows one folder per property instead of everything dumped in a single uploads/ folder.
export async function uploadToStorage(file, folder = "") {
  const safe = (file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const dir = String(folder || "")
    .replace(/[^a-zA-Z0-9._ -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const base = dir ? `uploads/${dir}` : "uploads";
  const path = `${base}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const r = storageRef(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

// Create a member's auth account WITHOUT signing the current admin out, by
// using a throwaway secondary Firebase app instance. Returns the new user's uid.
export async function createMemberAccount({ email, password, name }) {
  const secondary = initializeApp(firebaseConfig, "secondary-" + Date.now());
  const secAuth = getAuth(secondary);
  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    if (name) { try { await updateProfile(cred.user, { displayName: name }); } catch { /* non-fatal */ } }
    const uid = cred.user.uid;
    await signOut(secAuth);
    return uid;
  } finally {
    try { await deleteApp(secondary); } catch { /* ignore */ }
  }
}