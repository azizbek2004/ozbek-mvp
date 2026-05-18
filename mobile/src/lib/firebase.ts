import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { env, isFirebaseConfigured } from "./env";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getFirebaseConfig() {
  return {
    apiKey: env.firebase.apiKey,
    authDomain: env.firebase.authDomain,
    projectId: env.firebase.projectId,
    storageBucket: env.firebase.storageBucket,
    messagingSenderId: env.firebase.messagingSenderId,
    appId: env.firebase.appId,
    ...(env.firebase.measurementId
      ? { measurementId: env.firebase.measurementId }
      : {}),
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "[Odat] Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* in .env.",
    );
  }
  if (!app) {
    app = initializeApp(getFirebaseConfig());
  }
  return app;
}

export function getFirestoreDB(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
