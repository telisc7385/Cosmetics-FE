"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore";

type PincodeData = {
  pincode: string;
  city: string;
  state: string;
};

type Props = {
  onVerified?: (data: PincodeData) => void; // Made optional
};

const PincodeVerifier = ({ onVerified }: Props) => {
  const [enteredPincode, setEnteredPincode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<PincodeData | null>(null);

  // Use useEffect to load the saved pincode from localStorage on component mount
  useEffect(() => {
    const savedPincode = localStorage.getItem("verifiedPincode");
    const savedCity = localStorage.getItem("verifiedCity");
    const savedState = localStorage.getItem("verifiedState");

    if (savedPincode && savedCity && savedState) {
      const data = {
        pincode: savedPincode,
        city: savedCity,
        state: savedState,
      };
      setEnteredPincode(savedPincode);
      setVerifiedData(data);
      // Conditionally call onVerified only if it exists
      if (onVerified) {
        onVerified(data);
      }
    }
  }, [onVerified]); //   onVerified to dependency array

  const handleVerify = async () => {
    if (!enteredPincode || enteredPincode.length !== 6) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    try {
      setVerifying(true);
      const res = await apiCore<{
        available: boolean;
        city?: string;
        state?: string;
        estimated_delivery_days?: number;
        message?: string;
      }>("/pincode/check", "POST", { pincode: enteredPincode });

      if (!res.available) throw new Error(res.message || "Invalid pincode");

      const pincodeInfo = {
        pincode: enteredPincode,
        city: res.city || "",
        state: res.state || "",
      };

      setVerifiedData(pincodeInfo);
      // Conditionally call onVerified only if it exists
      if (onVerified) {
        onVerified(pincodeInfo);
      }
      toast.success(
        `Delivery available in ${pincodeInfo.city}, ${pincodeInfo.state}`
      ); // Use pincodeInfo for toast

      // Save verified pincode data to localStorage
      localStorage.setItem("verifiedPincode", pincodeInfo.pincode);
      localStorage.setItem("verifiedCity", pincodeInfo.city);
      localStorage.setItem("verifiedState", pincodeInfo.state);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      toast.error(message);
      setVerifiedData(null);
      // Clear localStorage if verification fails
      localStorage.removeItem("verifiedPincode");
      localStorage.removeItem("verifiedCity");
      localStorage.removeItem("verifiedState");
    } finally {
      setVerifying(false);
    }
  };

  const handleClearVerification = () => {
    setEnteredPincode("");
    setVerifiedData(null);
    localStorage.removeItem("verifiedPincode");
    localStorage.removeItem("verifiedCity");
    localStorage.removeItem("verifiedState");
    // Optionally, inform the parent that verification is cleared
    // Conditionally call onVerified only if it exists
    if (onVerified) {
      onVerified({ pincode: "", city: "", state: "" }); // Pass empty data
    }
  };

  return (
    <div className="mb-5">
      <h4 className="font-semibold mb-2 text-[#213E5A]">
        Select Delivery Location
      </h4>
      <p className="text-sm text-gray-500 mb-3">
        Enter your area pincode to check delivery availability
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter pincode"
          value={enteredPincode}
          onChange={(e) => setEnteredPincode(e.target.value)}
          className="border text-[#213E5A] border-gray-300 rounded-md px-4 py-2 w-72 bg-gray-100 focus:bg-white outline-none"
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || verifiedData !== null} // Disable if already verified
          className="bg-[#1A324A] text-white px-4 py-2 rounded-md hover:bg-[#142835] disabled:opacity-50 hover:cursor-pointer"
        >
          {verifying ? "Checking..." : "Apply"}
        </button>
        {verifiedData && (
          <button
            type="button"
            onClick={handleClearVerification}
            className="text-red-500 hover:text-red-700 font-medium ml-2"
          >
            Clear
          </button>
        )}
      </div>

      {verifiedData && (
        <p className="text-green-600 text-sm mt-2">
          Delivery available to {verifiedData.city}, {verifiedData.state}
        </p>
      )}
    </div>
  );
};

export default PincodeVerifier;
