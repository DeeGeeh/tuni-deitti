import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

// User Profile Operations
export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "Profiles", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    await updateDoc(doc(db, "Profiles", userId), data);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Swipe Operations
export const getUsersToSwipe = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    // Get the current user's profile to check their matches
    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUsers = currentUserProfile.data()?.matchedUsers || [];

    // Get all users that have swiped right on the current user
    const swipedUsers = await getDocs(
      collection(db, "swipes", currentUser.uid, "swiped")
    );
    const swipedUserIds = swipedUsers.docs.map((doc) => doc.id);

    // Get all profiles
    const querySnapshot = await getDocs(collection(db, "Profiles"));
    const userData = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((user) => {
        return (
          user.id !== currentUser.uid && // Exclude current user
          !matchedUsers.includes(user.id) && // Exclude matched users
          !swipedUserIds.includes(user.id) // Exclude users that have swiped right on
        );
      });

    return userData;
  } catch (error) {
    console.error("Error fetching users to swipe:", error);
    throw error;
  }
};

export const recordSwipe = async (
  swipedUserId: string,
  isRightSwipe: boolean
) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    // Get current user profile for matched users array
    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUsers = currentUserProfile.data()?.matchedUsers || [];

    // Record the swipe
    await setDoc(doc(db, "swipes", currentUser.uid, "swiped", swipedUserId), {
      timestamp: serverTimestamp(),
      isRightSwipe,
    });

    // If it's a right swipe, check if the other user has also swiped right
    if (isRightSwipe) {
      const otherUserSwipe = await getDoc(
        doc(db, "swipes", swipedUserId, "swiped", currentUser.uid)
      );

      if (otherUserSwipe.exists() && otherUserSwipe.data().isRightSwipe) {
        // It's a match! Update both users' matchedUsers arrays
        await updateDoc(doc(db, "Profiles", currentUser.uid), {
          matchedUsers: [...matchedUsers, swipedUserId],
        });

        const otherUserProfile = await getDoc(
          doc(db, "Profiles", swipedUserId)
        );
        const otherUserMatchedUsers =
          otherUserProfile.data()?.matchedUsers || [];
        await updateDoc(doc(db, "Profiles", swipedUserId), {
          matchedUsers: [...otherUserMatchedUsers, currentUser.uid],
        });

        return true; // It's a match
      }
    }

    return false; // Not a match
  } catch (error) {
    console.error("Error recording swipe:", error);
    throw error;
  }
};

// Match Operations
export const getMatches = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUserIds = currentUserProfile.data()?.matchedUsers || [];

    if (matchedUserIds.length === 0) {
      return [];
    }

    const matchesData = await Promise.all(
      matchedUserIds.map(async (userId: string) => {
        const userDoc = await getDoc(doc(db, "Profiles", userId));
        return { id: userDoc.id, ...userDoc.data() };
      })
    );

    return matchesData;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

// Message Operations
export const sendMessage = async (recipientId: string, message: string) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const chatId = [currentUser.uid, recipientId].sort().join("_");

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: currentUser.uid,
      recipientId,
      message,
      timestamp: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getMessages = async (recipientId: string) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const chatId = [currentUser.uid, recipientId].sort().join("_");

    const messagesSnapshot = await getDocs(
      collection(db, `chats/${chatId}/messages`)
    );
    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Chat Operations
export const getChats = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const currentUserProfile = await getDoc(
      doc(db, "Profiles", currentUser.uid)
    );
    const matchedUserIds = currentUserProfile.data()?.matchedUsers || [];

    if (matchedUserIds.length === 0) {
      return [];
    }

    const chatsData = await Promise.all(
      matchedUserIds.map(async (userId: string) => {
        const userDoc = await getDoc(doc(db, "Profiles", userId));
        const chatId = [currentUser.uid, userId].sort().join("_");

        // Get the last message
        const messagesSnapshot = await getDocs(
          collection(db, `chats/${chatId}/messages`)
        );
        const messages = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lastMessage =
          messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          user: { id: userDoc.id, ...userDoc.data() },
          lastMessage,
          unreadCount: messages.filter(
            (m: any) => m.recipientId === currentUser.uid && !m.read
          ).length,
        };
      })
    );

    return chatsData;
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};
