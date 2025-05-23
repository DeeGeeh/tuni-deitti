"use client";

import React, { useState } from "react";
import { Heart, X } from "lucide-react";
import { createMatch, storeSwipe } from "@/app/lib/swipeapp";
import { useAuth } from "@/app/contexts/AuthContext";

interface Profile {
  id: string;
  name: string;
  age: number;
  guild: string;
  pictures: string;
  questions?: string[];
}

const SwipeableCard = ({ profiles }: { profiles: Profile[] }) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  const currentUserID = useAuth().user?.uid;


  // THIS SHOULD NEVER HAPPEN
  if (!currentUserID) {
    throw new Error("No current user found");
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setOffsetX(diff);
  };

  const handleInteractionEnd = () => {
    setIsDragging(false);
    if (Math.abs(offsetX) > 100) {
      const direction = offsetX > 0 ? "right" : "left";
      handleSwipe(direction);
    }
    setOffsetX(0);
  };

  const currentProfile = profiles[currentProfileIndex];

  const handleSwipe = async (direction: string) => {
    if (currentProfileIndex < profiles.length - 1) {
      if (direction === "right") {
        console.log("Swiping right on", profiles[currentProfileIndex].id);
        const { isMatch, matchedUserName } = await storeSwipe(currentUserID, profiles[currentProfileIndex].id, "like");
        if (isMatch) {
          console.log(`Matched with ${matchedUserName}!`);
          // TODO: Show match notification/UI with the matched user's name
          alert(`You matched with ${matchedUserName}!`); // Replace this with a proper UI notification
        }
      } else {
        // Store dislike swipe
        await storeSwipe(currentUserID, profiles[currentProfileIndex].id, "dislike");
      }
      setCurrentProfileIndex((prev) => prev + 1);
    } else {
      // No more profiles, store the last swipe and refresh
      if (direction === "right") {
        const { isMatch, matchedUserName } = await storeSwipe(currentUserID, profiles[currentProfileIndex].id, "like");
        if (isMatch) {
          alert(`You matched with ${matchedUserName}!`); // Replace this with a proper UI notification
        }
      } else {
        await storeSwipe(currentUserID, profiles[currentProfileIndex].id, "dislike");
      }
      // Refresh the page to get new profiles
      window.location.reload();
    }
  };

  const handleButtonClick = (direction: "left" | "right") => {
    setOffsetX(direction === "left" ? -101 : 101);
    setTimeout(() => {
      handleSwipe(direction);
      setOffsetX(0);
    }, 200);
  };

  if (currentProfileIndex >= profiles.length) {
    return (
      <div className="w-full max-w-sm mx-auto h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Ei enempää profiileja
          </h3>
          <p className="text-gray-600">
            Tule takaisin myöhemmin nähdäksesi lisää frendejä!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-screen flex flex-col items-center justify-center">
      <div
        className="relative w-102 h-170 rounded-xl shadow-lg overflow-hidden cursor-grab bg-white"
        style={{
          transform: `translateX(${offsetX}px) rotate(${offsetX * 0.1}deg)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleInteractionEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
      >
        <img
          src={currentProfile.pictures}
          alt={currentProfile.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h3 className="text-xl font-bold">
            {currentProfile.name}, {currentProfile.age}
          </h3>
          <p className="text-sm">{currentProfile.guild}</p>
        </div>

        {/* Swipe Text Effects */}
        <div
          className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full transform -rotate-12 transition-opacity"
          style={{
            opacity: offsetX < -20 ? Math.min(Math.abs(offsetX) / 100, 1) : 0,
          }}
        >
          NOPE
        </div>
        <div
          className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full transform rotate-12 transition-opacity"
          style={{ opacity: offsetX > 20 ? Math.min(offsetX / 100, 1) : 0 }}
        >
          LIKE
        </div>

        {/* Profile Questions */}
        <div className="text-sm space-y-2 text-black ">
          {currentProfile.questions?.map((question, index) => (
            <p key={index} className="text-sm bg-gray-100 p-2 rounded-md">
              {question}
            </p>
          ))}
        </div>
      </div>

      {/* CARD BUTTONS */}
      <div className="w-full flex justify-center space-x-8 mt-4">
        <button
          className="bg-white p-3 rounded-full shadow-lg hover:bg-red-100 transition-colors"
          onClick={() => handleButtonClick("left")}
        >
          <X className="w-6 h-6 text-red-500" />
        </button>
        <button
          className="bg-white p-3 rounded-full shadow-lg hover:bg-green-100 transition-colors"
          onClick={() => handleButtonClick("right")}
        >
          <Heart className="w-6 h-6 text-green-500" />
        </button>
      </div>
    </div>
  );
};

export default SwipeableCard;
