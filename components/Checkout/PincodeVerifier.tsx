"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore"; // Assuming you have an apiCore utility at this path
import { handleRemovePincode } from "@/utils/removePincodeData";

import { useAppSelector } from "@/store/hooks/hooks"; // To subscribe to token changes for logout
import { selectToken } from "@/store/slices/authSlice"; // To get current token from Redux
import { useAuthStatus } from "@/store/hooks/useAuthStatus";

type PincodeData = {
  pincode: string;
  city: string;
  state: string;
  shippingRate?: number;
  taxPercentage?: number;
  taxType?: string;
};

type Props = {
  onVerified?: (data: PincodeData | null) => void; // Modified to accept null for unverified state
};

const PincodeVerifier = ({ onVerified }: Props) => {
  const [enteredPincode, setEnteredPincode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<PincodeData | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null); // New state for error message

  const { isLoggedIn } = useAuthStatus(); // Use the auth status hook
  const currentToken = useAppSelector(selectToken); // Get current token from Redux

  // Restore saved data on mount
  useEffect(() => {
    // Determine which storage to check based on login status
    const storage = isLoggedIn ? localStorage : sessionStorage;

    const savedPincode = storage.getItem("verifiedPincode");
    const savedCity = storage.getItem("verifiedCity");
    const savedState = storage.getItem("verifiedState");
    const savedShipping = storage.getItem("verifiedShipping");
    const savedTax = storage.getItem("verifiedTax");
    const savedTaxType = storage.getItem("verifiedTaxType");

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
      setPincodeError(null); // Clear any previous error on successful restore
      onVerified?.(data); // Call onVerified with the restored data
    } else {
      // If no stored data, ensure parent is notified of unverified state
      onVerified?.(null);
    }
  }, [onVerified, isLoggedIn]); // Re-run if login status changes

  // Effect to clear pincode on logout
  useEffect(() => {
    // This effect runs whenever currentToken changes.
    // If currentToken becomes null and pincode data exists, it implies logout.
    if (!currentToken) {
      // User logged out, clear pincode data
      handleRemovePincode();
      setEnteredPincode("");
      setVerifiedData(null);
      setPincodeError(null);
      onVerified?.(null);
      console.log("PincodeVerifier: User logged out, pincode data cleared.");
    }
  }, [currentToken, onVerified]); // Depend on currentToken and onVerified

  const handleVerify = async () => {
    setPincodeError(null); // Clear previous errors on new attempt

    if (!enteredPincode || enteredPincode.length !== 6) {
      const message = "Please enter a valid 6-digit pincode.";
      toast.error(message);
      setPincodeError(message);
      setVerifiedData(null);
      onVerified?.(null); // Notify parent of unverified state
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

      if (!res.available) {
        const message =
          res.message || "Invalid pincode or service not available.";
        throw new Error(message);
      }

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

      // Save in state & correct storage based on login status
      setVerifiedData(pincodeInfo);
      const storageToUse = isLoggedIn ? localStorage : sessionStorage;
      storageToUse.setItem("verifiedPincode", pincodeInfo.pincode);
      storageToUse.setItem("verifiedCity", pincodeInfo.city);
      storageToUse.setItem("verifiedState", pincodeInfo.state);
      storageToUse.setItem("verifiedShipping", String(summaryRes.shippingRate));
      storageToUse.setItem("verifiedTax", String(summaryRes.taxPercentage));
      storageToUse.setItem("verifiedTaxType", summaryRes.taxType);

      onVerified?.(pincodeInfo); // Pass the full data to the parent
      toast.success(
        `Delivery available in ${pincodeInfo.city}, ${pincodeInfo.state}`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Pincode verification failed.";
      toast.error(message);
      setPincodeError(message); // Set the error message
      setVerifiedData(null); // Clear verified data
      // Clear all related localStorage items on error
      handleRemovePincode(); // Ensure all stored pincode data is cleared on verification failure
      onVerified?.(null); // Notify parent of unverified state
    } finally {
      setVerifying(false);
    }
  };

  const handleClearVerification = () => {
    setEnteredPincode("");
    setVerifiedData(null);
    setPincodeError(null); // Clear error message
    handleRemovePincode(); // Ensure all stored pincode data is cleared
    onVerified?.(null); // Notify parent of cleared state
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
          disabled={verifying || verifiedData !== null} // Disable input if verifying or already verified
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || verifiedData !== null} // Disable button if verifying or already verified
          className="bg-[#1A324A] text-white px-4 py-2 rounded-md hover:bg-[#142835] disabled:opacity-50"
        >
          {verifying ? "Checking..." : "Apply"}
        </button>
      </div>

      {verifiedData && (
        <div className="flex items-center gap-18 mt-2">
          <p className="text-green-600 text-sm">
            Delivery available to {verifiedData.city}, {verifiedData.state}
          </p>
          <button
            type="button"
            onClick={handleClearVerification}
            className="text-red-500 hover:text-red-700 font-medium text-sm"
          >
            Clear
          </button>
        </div>
      )}

      {!verifiedData &&
        pincodeError && ( // Show error message and clear button if not verified and there's an error
          <div className="flex items-center gap-2 mt-2">
            <p className="text-red-600 text-sm">{pincodeError}</p>
            <button
              type="button"
              onClick={handleClearVerification}
              className="text-red-500 hover:text-red-700 font-medium text-sm"
            >
              Clear
            </button>
          </div>
        )}
    </div>
  );
};

export default PincodeVerifier;
