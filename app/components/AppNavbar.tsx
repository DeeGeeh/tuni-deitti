// APP TOP BAR

"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, User, LogOut, Settings } from "lucide-react";
import App from "next/app";

interface AppNavbarProps {
  user: any;
}

export default function AppNavbar({ user }: AppNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              >
                <span className="sr-only">Valikko</span>
                <div className="h-8 w-8 rounded-full bg-tuni-blue/20 flex items-center justify-center text-tuni-blue">
                  <User className="h-5 w-5" />
                </div>
              </button>
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
                  user.name
                </div>
                <div className="text-sm font-medium text-gray-500">
                  user.email
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
                <Link
                  href="/api/auth/signout"
                  className="block px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  <LogOut className="h-5 w-5 inline-block mr-2" />
                  Kirjaudu ulos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
