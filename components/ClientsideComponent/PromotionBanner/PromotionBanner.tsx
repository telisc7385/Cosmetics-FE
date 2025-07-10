"use client";

import React, { useState, useEffect } from "react";
// Removed: import Image from 'next/image'; // Image component is not used
import Link from "next/link";
import { X } from "lucide-react";

const PromotionBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  // Changed to a constant as the image is static and its setter is not used
  const bannerImage: string = "/promobanner.jpg"; // Your static image path
  const [countdown, setCountdown] = useState<string>("");

  // Calculate countdown in "Days | Hours | Minutes | Seconds" format
  const calculateCountdown = () => {
    const eightDaysInMs = 8 * 24 * 60 * 60 * 1000;
    const launchTime = localStorage.getItem("bannerLaunchTime");
    let startTime: number;

    // Ensure bannerLaunchTime is set consistently for the countdown
    if (launchTime) {
      startTime = parseInt(launchTime, 10);
    } else {
      // If no launch time exists, set it now. This ensures the 8-day countdown starts from the first view.
      startTime = Date.now();
      localStorage.setItem("bannerLaunchTime", startTime.toString());
    }

    const endTime = startTime + eightDaysInMs;
    const now = Date.now();
    const timeLeft = endTime - now;

    if (timeLeft <= 0) {
      return "00 | 00 | 00 | 00";
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const formatTime = (num: number) => num.toString().padStart(2, "0");

    return `${formatTime(days)} | ${formatTime(hours)} | ${formatTime(
      minutes
    )} | ${formatTime(seconds)}`;
  };

  useEffect(() => {
    // Always show banner after 10 seconds, regardless of previous closes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000); // 10 seconds

    // Set up countdown interval
    const countdownInterval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []); // Empty dependency array means it runs once on mount

  // Update countdown every second
  useEffect(() => {
    if (isVisible) {
      setCountdown(calculateCountdown());
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // No need to check !bannerImage here as it's a constant string
  if (!isVisible) {
    return null;
  }

  return (
    // New wrapper div for the banner and close button
    <div
      className={`fixed bottom-4 right-4 w-80 md:w-96
        transition-transform duration-700 ease-out transform
        ${
          isVisible
            ? "translate-x-0 translate-y-0"
            : "translate-x-full translate-y-full"
        }
        z-50`}
    >
      {/* Close button - now outside the banner content but within the animating container */}
      <button
        onClick={handleClose}
        className="absolute -top-2 -left-2 bg-black bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-90 transition-colors z-50 shadow-md"
        aria-label="Close banner"
      >
        <X size={18} />
      </button>

      {/* Main banner content */}
      <div
        className="bg-white rounded-lg shadow-xl overflow-hidden"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative p-4 text-white flex flex-col justify-between h-full min-h-[200px]">
          {/* Content Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>

          <div className="relative z-10 flex flex-col justify-end h-full">
            <p className="text-sm font-medium mb-1">Limited Time Offer!</p>
            <h3 className="text-xl font-bold mb-2">Exclusive Discount</h3>
            <p className="text-xs">Grab your favorites before time runs out.</p>

            {/* Updated Countdown Display - Reduced size, moved down */}
            <div className="mt-4 flex justify-between items-center text-center">
              {countdown.split(" | ").map((timePart, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <span className="text-xl md:text-2xl font-bold text-white leading-none">
                    {timePart}
                  </span>
                  <span className="text-xs uppercase mt-1 text-gray-300">
                    {index === 0
                      ? "Days"
                      : index === 1
                      ? "Hours"
                      : index === 2
                      ? "Minutes"
                      : "Seconds"}
                  </span>
                </div>
              ))}
            </div>

            {/* Shop Now Button - Bottom Left Aligned */}
            <Link href="/shop" passHref>
              <button
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-lg
                           hover:bg-blue-700 transition-all duration-300 transform hover:scale-105
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           self-start" // Aligns to the start (left) of the flex container
              >
                Shop Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner;
