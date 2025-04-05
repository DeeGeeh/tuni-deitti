// MAIN SWIPING APP
import SwipeableCard from "@/app/components/Profilecard";

export default function SwipePage() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-100"
      style={{ height: "calc(100vh - 124px)" }}
    >
      {/* Subtract the footer height (64px) */}
      <SwipeableCard />
    </div>
  );
}
