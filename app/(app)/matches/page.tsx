// app/(app)/matches/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Send } from "lucide-react";

// Mock data for matches
const mockMatches = [
  {
    id: 1,
    name: "Emma",
    avatar: "/test.png",
    lastActive: "2 min sitten",
    unread: true,
  },
  {
    id: 2,
    name: "Mikael",
    avatar: "/test.png",
    lastActive: "5 min sitten",
    unread: false,
  },
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: 1,
    sender: "Emma",
    content: "Omg moi",
    time: "12:32",
    isSelf: false,
  },
  {
    id: 2,
    sender: "Sinä",
    content: "ä",
    time: "13:34",
    isSelf: true,
  },
];

export default function MatchesPage() {
  const [selectedMatch, setSelectedMatch] = useState(mockMatches[0]);
  const [messageInput, setMessageInput] = useState("");

  // Handler for sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Recent matches at the top of the entire page */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Matchit</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {mockMatches.slice(0, 6).map((match) => (
            <div key={match.id} className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative cursor-pointer border-2 border-tuni-blue"
                onClick={() => setSelectedMatch(match)}
              >
                <Image
                  src={match.avatar}
                  alt={match.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <p className="text-xs text-center mt-1 text-foreground">
                {match.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with match list */}
        <div className="w-full max-w-xs border-r border-gray-200 flex flex-1 flex-col bg-white">
          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            {mockMatches.map((match) => (
              <div
                key={match.id}
                className={`p-3 flex items-center cursor-pointer ${
                  selectedMatch?.id === match.id
                    ? "bg-tuni-blue/10"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src={match.avatar}
                      alt={match.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  {match.unread && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-tuni-blue"></span>
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground">{match.name}</p>
                    <span className="text-xs text-gray-500">
                      {match.lastActive}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {match.unread ? "Uusi viesti!" : "// GET MESSAGE"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Message area */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {selectedMatch ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                    <Image
                      src={selectedMatch.avatar}
                      alt={selectedMatch.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-medium text-foreground">
                      {selectedMatch.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedMatch.lastActive}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isSelf ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                        message.isSelf
                          ? "bg-tuni-blue text-white rounded-br-none"
                          : "bg-white text-foreground rounded-bl-none border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span
                        className={`text-xs ${
                          message.isSelf ? "text-blue-100" : "text-gray-500"
                        } block mt-1`}
                      >
                        {message.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className="min-width-0 p-3 border-t border-gray-200 bg-white ">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    placeholder="Kirjoita viesti..."
                    className="flex-1 min-w-0 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-tuni-blue focus:border-transparent"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-tuni-blue text-white p-3 rounded-r-md hover:bg-tuni-blue/90"
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col p-6 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Valitse keskustelu
              </h3>
              <p className="text-gray-500 max-w-md">wompwomp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
