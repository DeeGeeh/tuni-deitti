import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { Timestamp } from "firebase/firestore";
//import { Match } from "@/app/types/schema";

interface Match {
  matchId: string;
  users: string[]; // Array of two user IDs!!! Ex: id1__id2
  timestamp: Timestamp;
  active: boolean;
}

// Store a swipe action
export async function storeSwipe(
  currentUserId: string,
  targetUserId: string,
  direction: "like" | "dislike"
): Promise<{ isMatch: boolean; matchedUserName: string | null }> {
  try {
    // Store the swipe in Firestore
    const swipeRef = doc(db, "swipes", currentUserId, "swiped", targetUserId);
    await setDoc(swipeRef, {
      direction,
      timestamp: new Date(),
      targetUserId // Add this to help with security rules
    });

    // If it's a like, check for a match
    if (direction === "like") {
      return checkForMatch(currentUserId, targetUserId);
    }

    return { isMatch: false, matchedUserName: null };
  } catch (error) {
    console.error("Error storing swipe:", error);
    return { isMatch: false, matchedUserName: null };
  }
}

// Helper function for consistent match IDs
function createMatchId(userId1: string, userId2: string) {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}__${sortedIds[1]}`;
}

// Function to create a new match
export async function createMatch(userId1: string, userId2: string) {
  const matchId = createMatchId(userId1, userId2);

  // Check if this match already exists
  const matchRef = doc(db, "matches", matchId);
  const matchDoc = await getDoc(matchRef);

  if (!matchDoc.exists()) {
    // Create new match document
    await setDoc(matchRef, {
      users: [userId1, userId2],
      timestamp: new Date(),
      active: true,
      lastInteraction: new Date(),
    });

    console.log("New match created:", matchId);

    // Add userId2 to userId1's matchedUsers array in Profiles collection
    const user1ProfileRef = doc(db, "Profiles", userId1);
    await updateDoc(user1ProfileRef, {
      matchedUsers: arrayUnion(userId2),
    });

    // Add userId1 to userId2's matchedUsers array
    const user2ProfileRef = doc(db, "Profiles", userId2);
    await updateDoc(user2ProfileRef, {
      matchedUsers: arrayUnion(userId1),
    });

    return { matchId, isNew: true };
  }

  return { matchId, isNew: false };
}

// Check if there's a mutual match
export async function checkForMatch(currentUserId: string, targetUserId: string) {
  try {
    // Check if the target user has already swiped right on current user
    const swipeRef = doc(db, "swipes", targetUserId, "swiped", currentUserId);
    const swipeDoc = await getDoc(swipeRef);

    if (swipeDoc.exists() && swipeDoc.data().direction === "like") {
      // Get target user's name for the notification
      const targetUserName = await getUserName(targetUserId);
      
      // It's a match! Create match document
      const { matchId, isNew } = await createMatch(currentUserId, targetUserId);

      if (isNew) {
        return { isMatch: true, matchedUserName: targetUserName };
      }
      return { isMatch: true, matchedUserName: targetUserName };
    }

    return { isMatch: false, matchedUserName: null };
  } catch (error) {
    console.error("Error checking for match:", error);
    return { isMatch: false, matchedUserName: null };
  }
}

export async function getUserMatches(userId: string) {
  // Check that user has matches
  const userProfileRef = doc(db, "Profiles", userId);
  const userProfileDoc = await getDoc(userProfileRef);

  if (!userProfileDoc.exists() || userProfileDoc.data()?.matchedUsers.length === 0) {
    return [];
  }

  // Query all matches
  const matchesQuery = query(
    collection(db, "matches"),
    where("active", "==", true) // Only fetch active matches
  );

  const matchesSnapshot = await getDocs(matchesQuery);
  const matches: Match[] = [];

  matchesSnapshot.forEach((doc) => {
    const matchId = doc.id;

    // Check if the userId is part of the matchId
    if (matchId.includes(userId)) {
      const matchData = doc.data() as Match;

      matches.push({
        ...matchData, // Spread the match data
        matchId, // Explicitly add the matchId
      });
    }
  });

  return matches;
}

export async function getUserName(userId: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(db, "Profiles", userId));
    if (userDoc.exists()) {
      return userDoc.data().displayName || "Unknown User";
    }
    return "Unknown User";
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown User";
  }
}
