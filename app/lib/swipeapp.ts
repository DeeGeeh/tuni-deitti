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

    // Optionally, add userId1 to userId2's matchedUsers array
    const user2ProfileRef = doc(db, "Profiles", userId2);
    await updateDoc(user2ProfileRef, {
      matchedUsers: arrayUnion(userId1),
    });

    return { matchId, isNew: true };
  }

  return { matchId, isNew: false };
}

export async function checkForMatch(
  currentUserId: string,
  targetUserId: string
) {
  // First check if the target user has already swiped right on current user
  const swipeRef = doc(db, "swipes", targetUserId, "swiped", currentUserId);
  const swipeDoc = await getDoc(swipeRef);

  if (swipeDoc.exists() && swipeDoc.data().direction === "like") {
    // It's a match! Create match document
    const { matchId, isNew } = await createMatch(currentUserId, targetUserId);

    if (isNew) {
      // TODO:
      // Potentially send notification, update UI, etc.
    }
    return true;
  }

  return false;
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
