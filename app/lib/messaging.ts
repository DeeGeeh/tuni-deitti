import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  getDocs,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp?: any;
}

interface Chat {
  participants: [string, string];
  lastMessage?: string;
  updatedAt?: any;
}

/**
 * Get consistent chat ID between two users
 */
export const getChatId = (userA: string, userB: string) => {
  return [userA, userB].sort().join("_");
};

/**
 * Send a message to another user
 */
export const sendMessage = async ({ senderId, receiverId, text }: Message) => {
  const chatId = getChatId(senderId, receiverId);
  const chatRef = doc(db, "Chats", chatId);
  const messagesRef = collection(chatRef, "Messages");

  // Update or create chat document
  const chatData: Chat = {
    participants: [senderId, receiverId],
    lastMessage: text,
    updatedAt: serverTimestamp(),
  };

  await setDoc(chatRef, chatData, { merge: true });

  // Add message to Messages subcollection
  const messageData: Message = {
    senderId,
    receiverId,
    text,
    timestamp: serverTimestamp(),
  };

  await addDoc(messagesRef, messageData);
};

/**
 * Listen to new messages in real-time for a specific chat
 */
export const listenToMessages = (
  chatId: string,
  callback: (messages: DocumentData[]) => void
) => {
  const messagesRef = collection(db, "Chats", chatId, "Messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

/**
 * Get list of chats for the current user
 */
export const getUserChats = async (userId: string) => {
  const chatsRef = collection(db, "Chats");
  const q = query(chatsRef, where("participants", "array-contains", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
