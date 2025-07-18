// src/components/Checkout/PincodeVerifier.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
// Assuming you have an apiCore utility at this path
import { apiCore } from "@/api/ApiCore";

type PincodeData = {
  pincode: string;
  city: string;
  state: string;
  shippingRate?: number;
  taxPercentage?: number;
  taxType?: string;
};

type Props = {
  onVerified?: (data: PincodeData) => void;
};

const PincodeVerifier = ({ onVerified }: Props) => {
  const [enteredPincode, setEnteredPincode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<PincodeData | null>(null);

  // Restore saved data on mount
  useEffect(() => {
    const savedPincode = localStorage.getItem("verifiedPincode");
    const savedCity = localStorage.getItem("verifiedCity");
    const savedState = localStorage.getItem("verifiedState");
    const savedShipping = localStorage.getItem("verifiedShipping");
    const savedTax = localStorage.getItem("verifiedTax");
    const savedTaxType = localStorage.getItem("verifiedTaxType");

    if (savedPincode && savedCity && savedState) {
      const data: PincodeData = {
        pincode: savedPincode,
        city: savedCity,
        state: savedState,
        shippingRate: savedShipping ? Number(savedShipping) : undefined,
        taxPercentage: savedTax ? Number(savedTax) : undefined,
        taxType: savedTaxType || undefined,
      };
      setEnteredPincode(savedPincode);
      setVerifiedData(data);
      onVerified?.(data); // Call onVerified with the restored data
    }
  }, [onVerified]); // onVerified is a dependency because it's used inside useEffect

  const handleVerify = async () => {
    if (!enteredPincode || enteredPincode.length !== 6) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    try {
      setVerifying(true);

      // 1. Verify pincode availability
      const res = await apiCore<{
        available: boolean;
        city?: string;
        state?: string;
        estimated_delivery_days?: number;
        message?: string;
      }>("/pincode/check", "POST", { pincode: enteredPincode });

      if (!res.available)
        throw new Error(
          res.message || "Invalid pincode or service not available."
        );

      // 2. Fetch order summary info (tax, shipping, etc.)
      // In a real app, 'items' should be passed from the cart context
      const summaryRes = await apiCore<{
        success: boolean;
        shippingRate: number;
        taxPercentage: number;
        taxType: string;
      }>("/order/order-summary", "POST", {
        pincode: enteredPincode,
        items: [], // Placeholder: Replace with actual cart items if your API needs them
      });

      const pincodeInfo: PincodeData = {
        pincode: enteredPincode,
        city: res.city || "",
        state: res.state || "",
        shippingRate: summaryRes.shippingRate,
        taxPercentage: summaryRes.taxPercentage,
        taxType: summaryRes.taxType,
      };

      // Save in state & localStorage
      setVerifiedData(pincodeInfo);
      localStorage.setItem("verifiedPincode", pincodeInfo.pincode);
      localStorage.setItem("verifiedCity", pincodeInfo.city);
      localStorage.setItem("verifiedState", pincodeInfo.state);
      localStorage.setItem("verifiedShipping", String(summaryRes.shippingRate));
      localStorage.setItem("verifiedTax", String(summaryRes.taxPercentage));
      localStorage.setItem("verifiedTaxType", summaryRes.taxType);

      // onVerified?.(pincodeInfo); // Pass the full data to the parent
      // toast.success(
      //   `Delivery available in ${pincodeInfo.city}, ${pincodeInfo.state}`
      // );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Pincode verification failed.";
      toast.error(message);
      setVerifiedData(null);
      // Clear all related localStorage items on error
      localStorage.removeItem("verifiedPincode");
      localStorage.removeItem("verifiedCity");
      localStorage.removeItem("verifiedState");
      localStorage.removeItem("verifiedShipping");
      localStorage.removeItem("verifiedTax");
      localStorage.removeItem("verifiedTaxType");
      onVerified?.({ pincode: "", city: "", state: "" }); // Notify parent of cleared state
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
    localStorage.removeItem("verifiedShipping");
    localStorage.removeItem("verifiedTax");
    localStorage.removeItem("verifiedTaxType");
    onVerified?.({ pincode: "", city: "", state: "" }); // Notify parent of cleared state
  };

  return (
    <div className="mb-5">
      <h4 className="font-semibold mb-2 text-[#213E5A]">
        Select Delivery Location
      </h4>
      <p className="text-sm text-gray-500 mb-3">
        Enter your area pincode to check delivery availability
      </p>

      <div className="flex gap-2 items-center flex-wrap">
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
          disabled={verifying || verifiedData !== null}
          className="bg-[#1A324A] text-white px-4 py-2 rounded-md hover:bg-[#142835] disabled:opacity-50"
        >
          {verifying ? "Checking..." : "Apply"}
        </button>
      </div>

      {verifiedData && (
        <>
          <p className="text-green-600 text-sm mt-2">
            Delivery available to {verifiedData.city}, {verifiedData.state}
          </p>
          {/* Removed tax/shipping display here as per request, now shown in CartPage Order Summary */}
          <button
            type="button"
            onClick={handleClearVerification}
            className="text-red-500 hover:text-red-700 font-medium mt-2"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
};

export default PincodeVerifier;
