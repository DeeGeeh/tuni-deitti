// MAIN SWIPING APP
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase"; // Import Firestore instance
import SwipeableCard from "@/app/components/Profilecard";

export default function SwipePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Query the "users" collection from Firestore
        const querySnapshot = await getDocs(collection(db, "Profiles"));
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userData);
        console.log("Fetched users:", userData);
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
        <p>No profiles available. Please check back later!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 h-screen">
      <SwipeableCard profiles={users} />
    </div>
  );
}
