"use client";
import Link from "next/link";
import { Home, User, Heart, Settings } from "lucide-react"; // Example icons

// Define navigation items for the mobile footer
const navItems = [
  { name: "Koti", path: "/swipe", icon: <Home className="h-6 w-6" /> },
  { name: "Matchit", path: "/matches", icon: <Heart className="h-6 w-6" /> },
  { name: "Profiili", path: "/profile", icon: <User className="h-6 w-6" /> },
  {
    name: "Asetukset",
    path: "/settings",
    icon: <Settings className="h-6 w-6" />,
  },
];

export default function AppFooter() {
  return (
    <>
      {/* Footer with navigation icons */}
      <footer className="fixed bottom-0 left-0 z-10 w-full bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={`${item.path}`}
              className="flex flex-col items-center justify-center text-tuni-blue rounded-sm hover:bg-tuni-blue/10 transition-transform"
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </footer>

      {/* Padding at the bottom to avoid content being hidden behind footer */}
      <div className="h-16 lg:hidden"></div>
    </>
  );
}
