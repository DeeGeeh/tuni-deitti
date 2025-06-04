"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLoginClick = () => {
    if (!loading && user) {
      // If the user is already logged in, redirect to the swipe page
      router.push("/swipe");
    } else {
      // Otherwise, redirect to the login page
      router.push("/login");
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-tuni-blue">
            TuniDeitti
          </Link>
          {/* Show Log in button only on the landing page */}
          {pathname === "/" && (
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 text-tuni-blue border-2 border-tuni-blue rounded-full hover:bg-tuni-blue hover:text-white transition-colors"
            >
              {loading ? "Ladataan..." : user ? "Jatka" : "Kirjaudu sisään"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
