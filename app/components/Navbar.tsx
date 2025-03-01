"use client";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname(); // Get current path
  const router = useRouter();

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
              onClick={() => router.push("/login")}
              className="px-6 py-2 text-tuni-blue border-2 border-tuni-blue rounded-full hover:bg-tuni-blue hover:text-white transition-colors"
            >
              Kirjaudu sisään
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
