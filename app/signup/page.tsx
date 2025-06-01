"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateRegistrationForm } from "@/app/lib/auth/validation";
import { registerUser } from "@/app/lib/firebaseUtils";
import StepIndicator from "../components/StepIndicator";
import { Status } from "../types/schema";

interface SignUpForm {
  step: number;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthdate: Date | null;
}

export default function SignUpPage() {
  const [form, setForm] = useState<SignUpForm>({
    step: 1,
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    birthdate: null,
  });

  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<Status>(Status.Idle);
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "date" && name === "birthdate") {
      const dateValue = value ? new Date(value) : null;
      setForm((prev) => ({
        ...prev,
        birthdate: dateValue,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStepOne = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validation = validateRegistrationForm({
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });

    if (validation.isValid) {
      setForm((prev) => ({
        ...prev,
        step: prev.step + 1,
      }));
    } else {
      setError(validation.errorMessage || "Validointi epäonnistui");
    }
  };

  const handleStepTwo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    setStatus(Status.Loading);

    try {
      await registerUser(
        form.email,
        form.password,
        form.firstName,
        form.lastName
      );

      setStatus(Status.Success);

      setTimeout(() => {
        const redirectTo =
          new URLSearchParams(window.location.search).get("redirect") ||
          "/profile";
        router.push(redirectTo);
      }, 2000);
    } catch (error: any) {
      const errorCode = error.code || "unknown";
      const errorMessage = error.message || "An unexpected error occurred";
      setError(`Virhe ${errorCode}: ${errorMessage}`);
    }

    setStatus(Status.Idle);
  };

  const handlePrevStep = () => {
    setForm((prev) => ({
      ...prev,
      step: prev.step - 1,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tuni-blue pb-5">
            REKISTERÖIDY
          </h1>
          <StepIndicator currentStep={form.step} />
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* STEP 1: Credentials */}
        {form.step === 1 && (
          <form className="space-y-6" onSubmit={handleStepOne}>
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
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
                value={form.email}
                onChange={handleInputChange}
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
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
                value={form.password}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Salasana (uudelleen)
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
                value={form.confirmPassword}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-tuni-blue text-white rounded-md shadow-sm hover:bg-tuni-blue/90"
              >
                Seuraava
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Personal Info */}
        {form.step === 2 && status !== Status.Success && (
          <form className="space-y-6" onSubmit={handleStepTwo}>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-foreground"
              >
                Etunimi
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
                value={form.firstName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-foreground"
              >
                Sukunimi
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
                value={form.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="birthdate"
                className="block text-sm font-medium text-foreground"
              >
                Syntymäaika
              </label>
              <input
                id="birthdate"
                type="date"
                name="birthdate"
                required
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-tuni-blue focus:ring focus:ring-tuni-blue/20"
                value={
                  form.birthdate
                    ? form.birthdate.toISOString().split("T")[0]
                    : ""
                }
                onChange={handleInputChange}
                lang="fi"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handlePrevStep}
              >
                Takaisin
              </button>

              <button
                type="submit"
                disabled={status === Status.Loading}
                className="px-4 py-2 bg-tuni-blue text-white rounded-md shadow-sm hover:bg-tuni-blue/90 disabled:opacity-50"
              >
                {status === Status.Loading
                  ? "Rekisteröidytään..."
                  : "Rekisteröidy"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success */}
        {status === Status.Success && (
          <div className="text-center p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Rekisteröityminen onnistui! Uudelleenohjataan...
          </div>
        )}

        {/* Already have account */}
        <div className="text-center mt-4">
          <p className="text-sm text-foreground/70">
            Onko sinulla jo tili?{" "}
            <Link
              href="/login"
              className="text-tuni-blue hover:text-tuni-blue/80 font-medium"
            >
              Kirjaudu sisään
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
