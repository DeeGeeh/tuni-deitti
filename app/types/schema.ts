import { Timestamp } from "firebase/firestore";

// TODO:
// UPDATE THIS WHEN FIRESTORE DB SETUP IS FINISHED

export interface User {
  uid: string;
  displayName: string;
  email: string;
  birthDate: Date;
  age?: number | null;
  gender: string;
  guild: string;
  interests: string[];
  questions?: string[];
  photos: Photo[];
  bio: string;
  lastActive: Timestamp;
  isActive: boolean; // this decides if profile is shown to others
}

export interface SignUpForm {
  step: number;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthdate: Date | "";
  age: number;
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

export interface Match {
  id: string;
  name: string;
  avatar: Photo;
  lastActive: string;
  unread: boolean;
  lastMessage: string;
}

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
