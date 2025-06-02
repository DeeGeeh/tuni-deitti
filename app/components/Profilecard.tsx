"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, X } from "lucide-react";
import { storeSwipe } from "@/app/lib/swipeapp";
import { User } from "../types/schema";

interface SwipeableCardProps {
  profiles: User[];
  userProfile: User | null;
}

const SwipeableCard = ({ profiles, userProfile }: SwipeableCardProps) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // THIS SHOULD NEVER HAPPEN
  if (!userProfile) {
    return <div>Loading profile...</div>;
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

  // This is kinda misleading, refers to the current swipeable user(card).
  // Not the logged in user.
  const currentProfile: User = profiles[currentProfileIndex];

  const handleSwipe = async (direction: string) => {
    if (currentProfileIndex < profiles.length - 1) {
      if (direction === "right") {
        console.log("Swiping right on", profiles[currentProfileIndex].uid);
        const { isMatch, matchedUserName } = await storeSwipe(
          userProfile.uid,
          profiles[currentProfileIndex].uid,
          "like"
        );
        if (isMatch) {
          console.log(`Matched with ${matchedUserName}!`);
          // TODO: Show match notification/UI with the matched user's name
          alert(`You matched with ${matchedUserName}!`); // Replace this with a proper UI notification
        }
      } else {
        // Store dislike swipe
        await storeSwipe(
          userProfile.uid,
          profiles[currentProfileIndex].uid,
          "dislike"
        );
      }
      setCurrentProfileIndex((prev) => prev + 1);
    } else {
      // No more profiles, store the last swipe and refresh
      if (direction === "right") {
        const { isMatch, matchedUserName } = await storeSwipe(
          userProfile.uid,
          profiles[currentProfileIndex].uid,
          "like"
        );
        if (isMatch) {
          alert(`You matched with ${matchedUserName}!`); // Replace this with a proper UI notification
        }
      } else {
        await storeSwipe(
          userProfile.uid,
          profiles[currentProfileIndex].uid,
          "dislike"
        );
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

  if (userProfile && userProfile.isActive === false) {
    return (
      <div className="w-full max-w-sm mx-auto h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-foreground">
            Laita tilisi näkyväksi muille päästäksesti swaippaamaan!
          </h3>
        </div>
      </div>
    );
  }

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
  <>
    {/* Prefetch next two profile images */}
    {profiles
      .slice(currentProfileIndex + 1, currentProfileIndex + 3)
      .map((profile, idx) => {
        const url = profile.photos?.[0]?.downloadUrl;
        return (
          url && (
            <link key={`preload-${idx}`} rel="preload" as="image" href={url} />
          )
        );
      })}
  </>;
  return (
    <div className="w-full max-w-sm mx-auto h-screen flex flex-col items-center justify-center">
      <div
        className="relative w-102 h-170 min-w-80 min-h-96 rounded-xl shadow-lg overflow-hidden cursor-grab bg-white"
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
        {currentProfile.photos && currentProfile.photos.length > 0 ? (
          <Image
            src={currentProfile.photos[0].downloadUrl}
            alt={`${currentProfile.displayName}'s profile picture`}
            fill
            className="object-cover"
            sizes="(max-width: 384px) 100vw, 384px"
            priority={currentProfileIndex === 0}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,..."
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-white text-lg">No Image</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h3 className="text-xl font-bold">{currentProfile.displayName}</h3>
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
