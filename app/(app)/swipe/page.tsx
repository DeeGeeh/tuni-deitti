// MAIN SWIPING APP
import SwipeableCard from "@/app/components/Profilecard";
import { Auth } from "firebase/auth";

export default function SwipePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <SwipeableCard />
    </div>
  );
}
