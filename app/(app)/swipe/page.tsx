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
  const [loading, setLoading] = useState<boolean>(true);

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
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <SwipeableCard profiles={users} userProfile={currentProfile} />;
}
