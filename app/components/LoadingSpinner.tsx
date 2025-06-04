import React from "react";
import Image from "next/image";

interface LoadingSpinnerProps {
  /** Main loading text */
  title?: string;
  /** Subtitle/description text */
  subtitle?: string;
  /** Size of the spinner - affects the overall scale */
  size?: "sm" | "md" | "lg";
  /** Whether to show the full-screen background */
  fullScreen?: boolean;
  /** Custom CSS classes for the container */
  className?: string;
}

export default function LoadingSpinner({
  title = "Ladataan...",
  subtitle = "Odota hetki",
  size = "md",
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: {
      spinner: "w-12 h-12",
      innerDot: "w-4 h-4",
      title: "text-lg",
      subtitle: "text-xs",
      dots: "w-1.5 h-1.5",
    },
    md: {
      spinner: "w-16 h-16",
      innerDot: "w-6 h-6",
      title: "text-xl",
      subtitle: "text-sm",
      dots: "w-2 h-2",
    },
    lg: {
      spinner: "w-20 h-20",
      innerDot: "w-8 h-8",
      title: "text-2xl",
      subtitle: "text-base",
      dots: "w-2.5 h-2.5",
    },
  };

  const currentSize = sizeClasses[size];

  const containerClasses = fullScreen
    ? "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
    : "flex items-center justify-center p-4";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center space-y-6">
        {/* Animated Spinner */}
        <div className="relative">
          <div className={`${currentSize.spinner} mx-auto mb-4 relative`}>
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-tuni-blue rounded-full animate-spin"></div>

            {/* Inner pulsing heart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`${currentSize.innerDot} relative animate-pulse opacity-80`}
              >
                <Image
                  src="/tuni-naama.png"
                  alt="TUNI logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 24px, 32px"
                  priority={fullScreen}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className={`${currentSize.title} font-semibold text-gray-800`}>
            {title}
          </h2>
          <p
            className={`text-gray-600 ${currentSize.subtitle} max-w-xs mx-auto`}
          >
            {subtitle}
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div
            className={`${currentSize.dots} bg-tuni-blue rounded-full animate-bounce`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`${currentSize.dots} bg-tuni-blue rounded-full animate-bounce`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`${currentSize.dots} bg-tuni-blue rounded-full animate-bounce`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
