import { Timestamp } from "firebase/firestore";

/**
 * Formats a Firebase timestamp into 24-hour time format (HH:mm)
 * @param timestamp Firebase Timestamp
 * @returns Formatted time string in Finnish locale (24h format)
 */
export const formatMessageTime = (timestamp: Timestamp): string => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Formats a timestamp into a relative time string or date
 * @param timestamp Firebase Timestamp or any timestamp that can be converted to Date
 * @returns Formatted string (e.g., "Juuri nyt", "5 min sitten", "2 h sitten", or date)
 */
export const formatLastActive = (timestamp: Timestamp | any): string => {
  if (!timestamp) return "Offline";

  const now = new Date();
  const lastActive = timestamp.toDate();
  const diffMinutes = Math.floor(
    (now.getTime() - lastActive.getTime()) / (1000 * 60)
  );

  if (diffMinutes < 1) return "Juuri nyt";
  if (diffMinutes < 60) return `${diffMinutes} min sitten`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h sitten`;

  return lastActive.toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Calculates the age in years based on the given birthdate.
 * @param birthdate - The user's birthdate as a Date object or a value convertible to Date.
 * @returns The calculated age as a number.
 *
 * @example
 * calculateAge(new Date("2000-05-15")); // returns 24 (if current year is 2024 and date is after May 15)
 */
const calculateAge = (birthdate: Date): number => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};
