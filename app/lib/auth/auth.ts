import { createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { app } from "@/app/lib/firebase";

interface RegistrationData {
  email: string;
  password: string;
}

interface AuthResponse {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
  error?: string;
}

/**
 * Registers a new user with Firebase Authentication.
 * @param email User's email
 * @param password User's password
 * @returns User credentials or an error
 */
export const registerUser = async ({ email, password }: RegistrationData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      getAuth(app),
      email,
      password
    );
    return { user: userCredential.user };
  } catch (error: any) {
    console.error("Firebase registration error:", error.code, error.message);

    let errorMessage = "Rekisteröityminen epäonnistui. Yritä uudelleen.";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Sähköpostiosoite on jo käytössä";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Sähköpostiosoite on virheellinen";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Salasana on liian heikko";
    }

    return { error: errorMessage };
  }
};

export async function verifyUserToken(token: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  return response.json();
}
