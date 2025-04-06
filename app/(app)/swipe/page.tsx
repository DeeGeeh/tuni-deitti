// MAIN SWIPING APP
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { getAuth } from "firebase/auth";
import SwipeableCard from "@/app/components/Profilecard";

export default function SwipePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No user logged in");
          return;
        }

        // First, get the current user's profile to check their matches
        const currentUserProfile = await getDoc(doc(db, "Profiles", currentUser.uid));
        const matchedUsers = currentUserProfile.data()?.matchedUsers || [];

        // Get all users that have swiped right on the current user
        const swipedUsers = await getDocs(collection(db, "swipes", currentUser.uid, "swiped"));
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

        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No more profiles available. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 h-screen">
      <SwipeableCard profiles={users} />
    </div>
  );
}
