// components/ErrorDisplay.tsx
import React from "react";

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div
      className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md"
      role="alert"
    >
      <p className="font-bold">Error:</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorDisplay;
