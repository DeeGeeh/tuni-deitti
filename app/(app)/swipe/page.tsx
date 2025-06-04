// MAIN SWIPING APP
"use client";

import { useEffect, useState } from "react";
import SwipeableCard from "@/app/components/Profilecard";
import { getUserProfile, getUsersToSwipe } from "@/app/lib/firebaseUtils";
import { User } from "@/app/types/schema";
import { useAuth } from "@/app/contexts/AuthContext";

export default function SwipePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentProfile, setCurrentProfile] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both users to swipe and current user profile
        const [userData, currentUserProfile] = await Promise.all([
          getUsersToSwipe(),
          user ? getUserProfile(user.uid) : Promise.resolve(null),
        ]);

        setUsers(userData);
        setCurrentProfile(currentUserProfile);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return <SwipeableCard profiles={users} userProfile={currentProfile} />;
}
