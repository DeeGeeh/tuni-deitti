"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { getUserName } from "../lib/swipeapp";

export default function AppNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const router = useRouter();

  // Fetch user name when component mounts or user changes
  useEffect(() => {
    const fetchUserName = async () => {
      if (currentUser?.uid) {
        const name = await getUserName(currentUser.uid);
        setUserName(name);
      }
    };
    
    fetchUserName();
  }, [currentUser]);

  // Sign out the user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex">
            <div className="flex-shrink-0">
              <Link href="/swipe" className="text-2xl font-bold text-tuni-blue">
                TuniDeitti
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="items-center lg:hidden">
            <button
              type="button"
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>

          {/* User Dropdown & Notifications */}
          <div className="hidden lg:flex lg:items-center lg:justify-end lg:space-x-5">
            <button
              type="button"
              className="rounded-full p-1 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Avaa ilmoitukset</span>
              <Bell className="h-6 w-6" />
            </button>

            <div className="relative ml-3">
              <button
                type="button"
                className="flex rounded-full text-sm focus:ring-2 focus:ring-tuni-blue focus:ring-offset-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
              >
                <span className="sr-only">Valikko</span>
                <div className="h-8 w-8 rounded-full bg-tuni-blue/20 flex items-center justify-center text-tuni-blue">
                  <User className="h-5 w-5" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-5 w-5 inline-block mr-2" />
                      Asetukset
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-5 w-5 inline-block mr-2" />
                      Kirjaudu ulos
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="px-4">
                <div className="text-base font-medium text-gray-800">
                  {userName || "Käyttäjä"}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {auth.currentUser?.email || " "}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  <Settings className="h-5 w-5 inline-block mr-2" />
                  Asetukset
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  <LogOut className="h-5 w-5 inline-block mr-2" />
                  Kirjaudu ulos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
