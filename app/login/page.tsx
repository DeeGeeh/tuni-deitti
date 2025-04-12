// app/login/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import Link from "next/link";
import { setSessionCookie } from "../lib/firebaseUtils";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Ole hyvä ja täytä kaikki kentät");
      return;
    }

    try {
      setIsLoading(true);

      // Set Firebase Authentication persistence based on "Remember Me"
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setSessionCookie(userCredential);

      // Redirect to the desired page (or default to /swipe)
      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") || "/swipe";
      router.push(redirectTo);
    } catch (err: any) {
      setError("Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tuni-blue">KIRJAUDU SISÄÄN</h1>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Sähköposti
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="email@tuni.fi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Salasana
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-tuni-blue focus:ring-tuni-blue"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-foreground"
              >
                Muista minut
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="text-tuni-blue hover:text-tuni-blue/80"
              >
                Unohditko salasanan?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-tuni-blue hover:bg-tuni-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tuni-blue disabled:opacity-50"
            >
              {isLoading ? "Kirjaudutaan..." : "Kirjaudu"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-foreground/70">
            Eikö sinulla ole tiliä?{" "}
            <Link
              href="/signup"
              className="text-tuni-blue hover:text-tuni-blue/80 font-medium"
            >
              Rekisteröidy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
