// MAIN SWIPING APP
"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import SwipeableCard from "@/app/components/Profilecard";
import { getUsersToSwipe } from "@/app/lib/firebaseUtils";

export default function SwipePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsersToSwipe();
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
