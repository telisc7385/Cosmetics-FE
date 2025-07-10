// app/login/page.tsx or components/ClientsideComponent/Auth/AuthPage.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginForm from "./LoginForm"; // Ensure correct path
import RegisterForm from "./RegisterForm"; // Ensure correct path
import { useSearchParams } from "next/navigation"; // Import useSearchParams

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const searchParams = useSearchParams(); // Get search params

  // Get redirect path from URL params, looking for 'redirect_to' first, then 'redirect', or default to '/'
  const redirectPath =
    searchParams.get("redirect_to") || searchParams.get("redirect") || "/";

  // Functions to switch between forms
  const handleSwitchToRegister = () => setShowLogin(false);
  const handleSwitchToLogin = () => setShowLogin(true);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left - Form Section */}
      <div className="w-full md:w-full sm:p-4 mt-6">
        <div className="flex justify-center mb-2">
          <button
            onClick={handleSwitchToLogin} // Use the handler
            className={`px-4 py-2 rounded-l font-medium cursor-pointer ${
              showLogin
                ? "bg-[#214364] text-white" // Updated color
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={handleSwitchToRegister} // Use the handler
            className={`px-4 py-2 rounded-r font-medium cursor-pointer ${
              !showLogin
                ? "bg-[#214364] text-white" // Updated color
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showLogin ? "login" : "register"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {showLogin ? (
              <LoginForm
                redirectPath={redirectPath}
                onSwitchToRegister={handleSwitchToRegister} // Pass the handler
              />
            ) : (
              <RegisterForm
                redirectPath={redirectPath} // Pass redirectPath to RegisterForm
                onSwitchToLogin={handleSwitchToLogin} // Pass the handler
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
