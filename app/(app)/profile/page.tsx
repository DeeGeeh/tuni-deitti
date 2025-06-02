"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "@/app/contexts/AuthContext";
import ImageManager from "@/app/components/ImageManager";
import { Status, Photo, User } from "@/app/types/schema";
import { getUserProfile } from "@/app/lib/firebaseUtils";
import { calculateAge } from "@/app/lib/dateUtils";

interface ProfileData
  extends Pick<
    User,
    | "displayName"
    | "age"
    | "guild"
    | "interests"
    | "photos"
    | "isActive"
    | "bio"
  > {}

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    displayName: "",
    age: 0,
    guild: "",
    interests: [],
    photos: [],
    bio: "",
    isActive: false,
  });
  const [originalData, setOriginalData] = useState<ProfileData>(formData);
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [images, setImages] = useState<Photo[]>([]);

  const isProfileComplete = () => {
    return (
      formData.displayName.trim() !== "" &&
      formData.age !== 0 &&
      formData.guild.trim() !== "" &&
      formData.photos.length > 0 // Require at least one photo
    );
  };

  // Auto-disable isActive when profile becomes incomplete
  useEffect(() => {
    if (!isProfileComplete() && formData.isActive) {
      setFormData((prev) => ({
        ...prev,
        isActive: false,
      }));
    }
  }, [formData.displayName, formData.age, formData.guild, formData.photos]);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setStatus(Status.Loading);
        const userDoc = await getDoc(doc(db, "Profiles", user.uid));
        const userData = await getUserProfile(userDoc.id);
        if (userDoc.exists() && userData !== null) {
          const profileData: ProfileData = {
            displayName: userData.displayName || "",
            age: userData.age,
            guild: userData.guild || "",
            interests: userData.interests,
            photos: userData.photos || [],
            bio: userData.bio || "",
            isActive: userData.isActive || false,
          };

          // calc age from bday
          if (
            profileData.age === null ||
            profileData.age === 0 ||
            profileData.age === undefined
          ) {
            profileData.age = calculateAge(userData.birthDate);
          }
          console.log(userData);

          // Store original data for comparison
          setOriginalData(profileData);
          setFormData(profileData);
          setImages(profileData.photos);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setStatus(Status.Idle);
      }
    };

    fetchUserData();
  }, []);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !hasChanges) return;

    try {
      setStatus(Status.Saving);
      // Update user profile in Firestore
      await updateDoc(doc(db, "Profiles", user.uid), {
        ...formData,
        updatedAt: new Date(),
      });
      // Update original data to match new values
      setOriginalData(formData);
      setStatus(Status.Success);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setStatus(Status.Idle);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatus(Status.Idle);
    }
  };

  const handleChange =
    (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // Handle image changes from ImageManager
  const handleImagesChange = (updatedImages: Photo[]) => {
    setFormData((prev) => ({
      ...prev,
      photos: updatedImages,
    }));
    setImages(updatedImages);
  };

  if (status === Status.Loading) {
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

        {status === Status.Success && (
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
          {/* Image Upload Section */}
          <ImageManager
            images={images}
            onImagesChange={handleImagesChange}
            userId={user?.uid || ""}
          />

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Nimi
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="on"
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
              id="age"
              name="age"
              type="number"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              value={formData.age ?? ""}
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
              id="guild"
              name="quild"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder=""
              value={formData.guild}
              onChange={handleChange("guild")}
            />
          </div>
          <div>
            <label
              htmlFor="bio"
              className="block test-sm font-medium text-foreground"
            >
              Bio
            </label>
            <input
              type="text"
              id="bio"
              name="bio"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              value={formData.bio}
              onChange={handleChange("bio")}
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
              id="interestedEvents"
              name="interestedEvents"
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="Listaa tapahtumat joihin menet"
              value={formData.interests}
              onChange={handleChange("interests")}
            />
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-foreground">
              Profiili näkyvissä muille
            </span>
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.isActive}
              disabled={!isProfileComplete()}
              onChange={(e) => {
                if (isProfileComplete()) {
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }));
                }
              }}
            />
            <div
              className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600 ${
                !isProfileComplete() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            ></div>
          </label>

          {/* helper text */}
          {!isProfileComplete() && (
            <p className="text-sm text-red-600 mt-1">
              Täydennä kaikki pakolliset kentät ja lisää vähintään yksi kuva
              aktivoidaksesi profiilin.
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={!hasChanges || status === Status.Saving}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-tuni-blue hover:bg-tuni-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tuni-blue disabled:opacity-50"
            >
              {status === Status.Saving ? "Tallennetaan..." : "Tallenna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
