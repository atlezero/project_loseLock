import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import {
    getAuth,
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDFVzZi24otU5dHurnxVGUBvoOcS2DY0ss",
    authDomain: "lose-and-found-efcb4.firebaseapp.com",
    databaseURL: "https://lose-and-found-efcb4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "lose-and-found-efcb4",
    storageBucket: "lose-and-found-efcb4.firebasestorage.app",
    messagingSenderId: "1065495367262",
    appId: "1:1065495367262:web:1ae8ef06af04ff2b8f2ecf",
    measurementId: "G-CLGRBE1SMP"
};

// Initialize Firebase only on client-side
let app: FirebaseApp | undefined;
let db: Database | undefined;  // Realtime Database for chat only
let firestore: Firestore | undefined;  // Firestore for users, lockers, deposits
let auth: Auth | undefined;

if (typeof window !== 'undefined') {
    // Client-side only
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    firestore = getFirestore(app);
    auth = getAuth(app);
}

export {
    db,
    firestore,
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    // Firestore helpers
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot
};
export type { FirebaseUser };
