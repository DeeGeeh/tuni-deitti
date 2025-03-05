import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const adminApp =
  getApps().length > 0
    ? getApp()
    : process.env.NODE_ENV == "development"
    ? initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID })
    : initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
        }),
      });

export const adminAuth = getAuth(adminApp);
export const adminDB = getFirestore(adminApp);
