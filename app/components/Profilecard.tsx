"use client";

import React, { useState } from "react";
import { Heart, X } from "lucide-react";

const test_questions = ["Olen huono", "Tarjoan ekat jos"];

interface Profile {
  id: number;
  name: string;
  age: number;
  organization: string;
  image: string;
  questions?: string[];
}

const mockProfiles: Profile[] = [
  {
    id: 1,
    name: "Kädet Heiluu",
    age: 23,
    organization: "Luuppi",
    image: "test.png",
    questions: test_questions,
  },
  {
    id: 2,
    name: "Teemu Teekkari",
    age: 22,
    organization: "TiTe",
    image: "test.png",
    questions: test_questions,
  },
];

const SwipeableCard = () => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [profiles] = useState(mockProfiles);

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

  const handleSwipe = (direction: string) => {
    if (currentProfileIndex < profiles.length - 1) {
      // Add match logic here for right swipes
      if (direction === "right") {
        console.log(`Matched with ${profiles[currentProfileIndex].name}!`);
      }
      setCurrentProfileIndex((prev) => prev + 1);
    } else {
      // No more profiles
      console.log("No more profiles to show");
    }
  };

  // Handle button clicks
  const handleButtonClick = (direction: "left" | "right") => {
    setOffsetX(direction === "left" ? -101 : 101);
    setTimeout(() => {
      handleSwipe(direction);
      setOffsetX(0);
    }, 200);
  };

  // No more profiles
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

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="w-full max-w-sm mx-auto h-screen flex flex-col items-center justify-center">
      <div
        className="relative w-72 h-96 rounded-xl shadow-lg overflow-hidden cursor-grab bg-white"
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
          src={currentProfile.image}
          alt={currentProfile.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h3 className="text-xl font-bold">
            {currentProfile.name}, {currentProfile.age}
          </h3>
          <p className="text-sm">{currentProfile.organization}</p>
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
