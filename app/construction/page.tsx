"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConstructionPage() {
  const [formData, setFormData] = useState({ email: "", adminPassword: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "email-sent">(
    "idle"
  );
  const [showAdmin, setShowAdmin] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/notify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setStatus("email-sent");
      } else {
        alert("Virhe sähköpostin tallentamisessa. Yritä uudelleen.");
      }
    } catch (error) {
      console.error("Error submitting email:", error);
      alert("Verkkovirhe. Yritä uudelleen.");
    } finally {
      setStatus("idle");
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.adminPassword) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/construction-admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.adminPassword }),
      });

      if (response.ok) {
        const isProd = process.env.NODE_ENV === "production";
        document.cookie = `admin-authenticated=true; path=/; max-age=${
          60 * 60 * 24
        }; SameSite=Strict${isProd ? "; Secure" : ""}`;

        router.push("/");
        router.refresh();
      } else {
        alert("Väärä salasana");
        setFormData((prev) => ({ ...prev, adminPassword: "" }));
      }
    } catch (error) {
      console.error("Error authenticating admin:", error);
      alert("Verkkovirhe. Yritä uudelleen.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">🚧🚧🚧</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Tyämaa</h2>
          <p className="text-gray-600">Sivua rakennetaan vielä!</p>
        </div>

        {status !== "email-sent" ? (
          <form onSubmit={handleEmailSubmit} className="mb-8">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Saat ilmoituksen kun sivusto aukeaa (Tää ei muuten toimi :D)
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Syötä sähköpostiosoitteesi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
                required
                disabled={status === "loading"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Lähetetään..." : "Ilmoita minulle"}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 font-medium">
              ✅ Kiitos! Ilmoitamme sinulle kun sivusto aukeaa.
            </p>
          </div>
        )}

        <div className="border-t pt-6">
          {!showAdmin ? (
            <button
              onClick={() => setShowAdmin(true)}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition duration-200"
            >
              Admin
            </button>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adminPassword: e.target.value,
                    }))
                  }
                  placeholder="Ylläpitäjän salasana"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition duration-200"
                  required
                  disabled={status === "loading"}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 bg-gray-700 text-white py-2 px-3 text-sm rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50"
                >
                  {status === "loading" ? "Tarkistetaan..." : "Kirjaudu"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdmin(false);
                    setFormData((prev) => ({ ...prev, adminPassword: "" }));
                  }}
                  disabled={status === "loading"}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 text-sm rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Peruuta
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
