/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { logger } from "firebase-functions/logger";
// import { onRequest } from "firebase-functions/v2/https";
// import { onDocumentCreated } from "firebase-functions/v2/firestore";

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";

// Initialize the Firebase app
initializeApp();

// Interface for user profile data
interface ProfileData {
  userId: string;
  email: string | null;
  displayName: string;
  userName: string;
  photoURL: string | null;
  interestedEvents?: any; // TODO: Fix type
  bio?: string;
}
