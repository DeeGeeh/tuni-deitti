"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ["Tunnus", "Tiedot", "Valmis"];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-xs mx-auto mb-6">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div
            key={label}
            className="flex-1 flex flex-col items-center relative"
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border z-10 ${
                isActive
                  ? "bg-tuni-blue text-white border-tuni-blue"
                  : isCompleted
                  ? "bg-tuni-blue/70 text-white border-tuni-blue/70"
                  : "bg-white text-gray-400 border-gray-300"
              }`}
            >
              {stepNumber}
            </div>
            <span className="mt-1 text-xs text-center text-foreground/80">
              {label}
            </span>
            {index < steps.length - 1 && (
              <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-300 z-0"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
