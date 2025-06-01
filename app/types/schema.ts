import { Timestamp } from "firebase/firestore";

// TODO:
// UPDATE THIS WHEN FIRESTORE DB SETUP IS FINISHED

export interface User {
  uid: string;
  displayName: string | null;
  email: string;
  birthDate: Timestamp;
  gender: string;
  guild: string;
  interests: string[];
  questions?: string[];
  photos: Photo[];
  bio: string;
  lastActive: Timestamp;
  isActive: boolean; // this decides if profile is shown to others
}

export interface UserPreferences {
  interestedIn: string[];
  ageRange: { min: number; max: number };
  distanceMax: number;
  hideProfile: boolean;
}

export interface Swipe {
  direction: "like" | "dislike";
  timestamp: Timestamp;
}

/* TODO GOTTA FIGURE THIS SHIT OUT  
interface Match {
  matchId: string;
  users: string[]; // Array of two user IDs!!! Ex: id1__id2
  timestamp: Timestamp;
  active: boolean;
}
*/

export interface Conversation {
  matchId: string;
  participants: string[];
  lastMessageTime: Timestamp;
  lastMessagePreview: string;
}

export interface Message {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface Photo {
  id: string;
  storageUrl: string;
  downloadUrl: string;
  order: number;
  uploadedAt: Date;
  isProfilePhoto: boolean;
}

export type PhotoInput = Omit<
  Photo,
  "id" | "storageUrl" | "downloadUrl" | "uploadedAt"
>;

export enum Status {
  Loading = "loading",
  Idle = "idle",
  Saving = "saving",
  Success = "success",
}
