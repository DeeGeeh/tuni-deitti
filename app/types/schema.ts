import { Timestamp } from "firebase/firestore";

// TODO:
// UPDATE THIS WHEN FIRESTORE DB SETUP IS FINISHED

interface User {
  uid: string;
  displayName: string | null;
  birthDate: Timestamp;
  gender: string;
  guild: string;
  interests: string[];
  photos: { url: string; order: number }[];
  bio: string;
  lastActive: Timestamp;
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

export type { User, UserPreferences, Swipe, Conversation, Message };
