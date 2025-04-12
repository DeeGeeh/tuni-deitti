// app/(app)/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AppNavbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Top navigation bar */}
        <AppNavbar />

        {/* Main content */}
        <main className="pt-16">{children}</main>

        <AppFooter />
      </div>
    </ProtectedRoute>
  );
}
