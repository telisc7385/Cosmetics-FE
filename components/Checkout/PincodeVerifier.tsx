"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore";

type PincodeData = {
  pincode: string;
  city: string;
  state: string;
};

type Props = {
  onVerified: (data: PincodeData) => void;
};

const PincodeVerifier = ({ onVerified }: Props) => {
  const [enteredPincode, setEnteredPincode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<PincodeData | null>(null);

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
      onVerified(pincodeInfo);
      toast.success(`Delivery available in ${res.city}, ${res.state}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      toast.error(message);
      setVerifiedData(null);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mb-5">
      <h4 className="font-semibold mb-2">Select Delivery Location</h4>
      <p className="text-sm text-red-500 mb-3">
        Enter your area pincode to check delivery availability
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter pincode"
          value={enteredPincode}
          onChange={(e) => setEnteredPincode(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-72 bg-gray-100 focus:bg-white outline-none"
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying}
          className="bg-[#1A324A] text-white px-4 py-2 rounded-md hover:bg-[#142835] disabled:opacity-50 hover:cursor-pointer"
        >
          {verifying ? "Checking..." : "Apply"}
        </button>
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
