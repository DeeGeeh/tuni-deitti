"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/contexts/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [guild, setGuild] = useState<string>("");
  const [interestedEvents, setInterestedEvents] = useState<string>("");
  const [changedField, setChangedField] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "Profiles", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Store original data for comparison
          setOriginalData(userData);
          
          // Set form values
          setName(userData.displayName || "");
          setAge(userData.age || "");
          setGuild(userData.guild || "");
          setInterestedEvents(userData.interestedEvents || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Check if any field has changed from original data
  useEffect(() => {
    if (Object.keys(originalData).length === 0) return;
    
    // Only check for changes if we have both original data and current form values
    const hasChanges = 
      (originalData.displayName !== undefined && name !== originalData.displayName) ||
      (originalData.age !== undefined && age !== originalData.age) ||
      (originalData.guild !== undefined && guild !== originalData.guild) ||
      (originalData.interestedEvents !== undefined && interestedEvents !== originalData.interestedEvents);
    
    setChangedField(hasChanges);
  }, [name, age, guild, interestedEvents, originalData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update user profile in Firestore
      await updateDoc(doc(db, "Profiles", user.uid), {
        displayName: name,
        age: age,
        guild: guild,
        interestedEvents: interestedEvents,
        updatedAt: new Date()
      });
      
      // Update original data to match new values
      setOriginalData({
        ...originalData,
        displayName: name,
        age: age,
        guild: guild,
        interestedEvents: interestedEvents
      });
      
      setChangedField(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  if (loading) {
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
        
        {saveSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Profiili tallennettu onnistuneesti!</span>
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
              value={name}
              onChange={handleChange(setName)}
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
              value={age}
              onChange={handleChange(setAge)}
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
              value={guild}
              onChange={handleChange(setGuild)}
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
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="Listaa tapahtumat joihin menet"
              value={interestedEvents}
              onChange={handleChange(setInterestedEvents)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={!changedField || saving}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-tuni-blue hover:bg-tuni-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tuni-blue disabled:opacity-50"
            >
              {saving ? "Tallennetaan..." : "Tallenna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
