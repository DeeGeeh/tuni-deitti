import { Timestamp } from "firebase/firestore";

// TODO:
// UPDATE THIS WHEN FIRESTORE DB SETUP IS FINISHED

interface User {
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

interface UserPreferences {
  interestedIn: string[];
  ageRange: { min: number; max: number };
  distanceMax: number;
  hideProfile: boolean;
}

interface Swipe {
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

interface Conversation {
  matchId: string;
  participants: string[];
  lastMessageTime: Timestamp;
  lastMessagePreview: string;
}

interface Message {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
  read: boolean;
}

interface Photo {
  id: string;
  storageUrl: string;
  downloadUrl: string;
  order: number;
  uploadedAt: Timestamp;
  isProfilePhoto: boolean;
}

type PhotoInput = Omit<
  Photo,
  "id" | "storageUrl" | "downloadUrl" | "uploadedAt"
>;

export type {
  User,
  UserPreferences,
  Swipe,
  Conversation,
  Message,
  Photo,
  PhotoInput,
};
