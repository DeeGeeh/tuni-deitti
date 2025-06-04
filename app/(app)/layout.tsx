// app/(app)/layout.tsx
import React from "react";
import AppNavbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
