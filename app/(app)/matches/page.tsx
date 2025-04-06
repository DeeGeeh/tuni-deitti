"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MoreHorizontal, Send } from "lucide-react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/app/lib/firebase";
import { Message } from "@/app/types/schema";
import { getUserMatches, checkForMatch } from "@/app/lib/swipeapp";

interface Match {
  id: string;
  name: string;
  avatar: string;
  lastActive: string;
  unread: boolean;
  lastMessage: string;
}

interface TransformedMatch {
  id: string;
  name: string;
  avatar: string;
  lastActive: string;
  unread: boolean;
  lastMessage: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load current user and fetch matches
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "Profiles", user.uid));

        if (userDoc.exists()) {
          setCurrentUser({
            ...user,
            ...userDoc.data(),
          });
        }
        await fetchMatches(user.uid);  
      } else {
        setCurrentUser(null);
        setMatches([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch all matches for the current user
  const fetchMatches = async (userId: string) => {
    try {
      setLoading(true);
      const userMatches = await getUserMatches(userId);
      
      // Transform matches to the format expected by the UI
      const transformedMatches = await Promise.all(
        userMatches.map(async (match) => {
          // Get the other user's ID from the match
          const otherUserId = match.users.find(id => id !== userId);
          if (!otherUserId) return null;

          // Fetch the other user's profile
          const userDoc = await getDoc(doc(db, "Profiles", otherUserId));
          const userData = userDoc.data();

          if (!userData) return null;

          const transformedMatch: TransformedMatch = {
            id: match.matchId,
            name: userData.displayName || "Unknown User",
            avatar: userData.photoURL || "/default-avatar.png",
            lastActive: formatLastActive(userData.lastActive),
            unread: false, // TODO: Implement unread status
            lastMessage: "", // TODO: Implement last message
          };

          return transformedMatch;
        })
      );

      // Filter out any null matches and set the state
      const validMatches = transformedMatches.filter((match): match is TransformedMatch => match !== null);
      setMatches(validMatches);

      if (validMatches.length > 0 && !selectedMatch) {
        setSelectedMatch(validMatches[0]);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for messages when a match is selected
  useEffect(() => {
    if (!selectedMatch || !currentUser) return;

    const chatId = selectedMatch.id;
    const messagesQuery = query(
      collection(db, "messages", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(messagesList);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedMatch, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatLastActive = (timestamp: any) => {
    if (!timestamp) return "Offline";

    const now = new Date();
    const lastActive = timestamp.toDate();
    const diffMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "Juuri nyt";
    if (diffMinutes < 60) return `${diffMinutes} min sitten`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h sitten`;

    return lastActive.toLocaleDateString();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedMatch || !currentUser) return;

    try {
      const chatId = selectedMatch.id;

      await addDoc(collection(db, "messages", chatId, "messages"), {
        content: messageInput.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false,
      });

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSwipe = async (
    targetUserId: string,
    direction: "like" | "dislike"
  ) => {
    if (!currentUser) return;

    try {
      const isMatch = await checkForMatch(currentUser.uid, targetUserId);
      if (isMatch) {
        console.log("It's a match!");
        await fetchMatches(currentUser.uid);
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Matches */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Matchit</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {matches.slice(0, 6).map((match) => (
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

      {/* Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full max-w-xs border-r border-gray-200 flex flex-col bg-white">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <p>Loading matches...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {matches.map((match) => (
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
                      <p className="font-medium text-foreground">
                        {match.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {match.lastActive}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {match.lastMessage || "Aloita keskustelu!"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Ei vielä matcheja.
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {selectedMatch ? (
            <>
              {/* Chat Header */}
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

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isSelf = message.senderId === currentUser?.uid;
                    return (
                      <div
                        key={message.senderId}
                        className={`flex ${
                          isSelf ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                            isSelf
                              ? "bg-tuni-blue text-white rounded-br-none"
                              : "bg-white text-foreground rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span
                            className={`text-xs ${
                              isSelf ? "text-blue-100" : "text-gray-500"
                            } block mt-1`}
                          >
                            {formatMessageTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    Ei vielä viestejä. Aloita keskustelu!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="min-width-0 p-3 border-t border-gray-200 bg-white">
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
              <p className="text-gray-500 max-w-md">
                Valitse henkilö listalta aloittaaksesi keskustelun
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
