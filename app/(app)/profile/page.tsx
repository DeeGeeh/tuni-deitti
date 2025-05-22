"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/contexts/AuthContext";

interface ProfileData {
  displayName: string;
  age: string;
  guild: string;
  interestedEvents: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    displayName: "",
    age: "",
    guild: "",
    interestedEvents: "",
  });
  const [originalData, setOriginalData] = useState<ProfileData>(formData);

  const [status, setStatus] = useState<
    "loading" | "idle" | "saving" | "success"
  >("loading");

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setStatus("loading");
        const userDoc = await getDoc(doc(db, "Profiles", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          const profileData: ProfileData = {
            displayName: userData.displayName || "",
            age: userData.age || "",
            guild: userData.guild || "",
            interestedEvents: userData.interestedEvents || "",
          };

          // Store original data for comparison
          setOriginalData(profileData);
          setFormData(profileData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setStatus("idle");
      }
    };

    fetchUserData();
  }, [user]);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !hasChanges) return;

    try {
      setStatus("saving");

      // Update user profile in Firestore
      await updateDoc(doc(db, "Profiles", user.uid), {
        ...formData,
        updatedAt: new Date(),
      });

      // Update original data to match new values
      setOriginalData(formData);
      setStatus("success");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatus("idle");
    }
  };

  const handleChange =
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-xl">Ladataan profiilia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl p-16 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tuni-blue">PROFIILI</h1>
        </div>

        {status === "success" && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              Profiili tallennettu onnistuneesti!
            </span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Nimi
            </label>
            <input
              id="nimi"
              name="nimi"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="Teemu Teekkari"
              value={formData.displayName}
              onChange={handleChange("displayName")}
            />
          </div>
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-foreground"
            >
              Ikä
            </label>
            <input
              id="ikä"
              name="ikä"
              type="number"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="ikäsi"
              value={formData.age}
              onChange={handleChange("age")}
            />
          </div>
          <div>
            <label
              htmlFor="guild"
              className="block text-sm font-medium text-foreground"
            >
              Kilta tai Ainejärjestö
            </label>
            <input
              id="kilta"
              name="kilta"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="esim. Indecs"
              value={formData.guild}
              onChange={handleChange("guild")}
            />
          </div>
          <div>
            <label
              htmlFor="interestedEvents"
              className="block text-sm font-medium text-foreground"
            >
              Tapahtumat
            </label>
            <input
              id="tapahtumat"
              name="tapahtumat"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="Listaa tapahtumat joihin menet"
              value={formData.interestedEvents}
              onChange={handleChange("interestedEvents")}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={!hasChanges || status === "saving"}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-tuni-blue hover:bg-tuni-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tuni-blue disabled:opacity-50"
            >
              {status === "saving" ? "Tallennetaan..." : "Tallenna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
