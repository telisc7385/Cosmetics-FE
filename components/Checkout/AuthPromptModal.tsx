// components/Checkout/AuthPromptModal.tsx
import React from "react";
import Link from "next/link"; // Use Link for navigation

interface AuthPromptModalProps {
  onClose: () => void;
  onContinueAsGuest: () => void;
}


const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  onClose,
  onContinueAsGuest,
}) => {
  return (
    <div className="fixed inset-0 bg-[#F3F6F7] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-sm text-center transform scale-95 opacity-0 animate-scaleIn">
        <style jsx>{`
          @keyframes scaleIn {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}</style>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Proceed to Checkout
        </h2>
        <p className="text-gray-600 mb-8">
          To continue, please choose an option:
        </p>
        <div className="space-y-4">
          <button
            onClick={onContinueAsGuest}
            className="w-full py-3 bg-[#213E5A] text-white font-semibold rounded-md hover:bg-[#1a324a] transition-colors shadow-md"
          >
            Continue as Guest
          </button>
          <Link
            href="/auth" // KEY CHANGE: Add redirect parameter
            className="block w-full py-3 bg-white border border-[#213E5A] text-[#213E5A] font-semibold rounded-md hover:bg-gray-50 transition-colors shadow-md"
          >
            Login Now
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;
