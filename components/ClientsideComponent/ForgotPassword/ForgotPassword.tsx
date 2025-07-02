"use client";
export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { RootState } from "@/store/store";
import {
  resetPasswordFailure,
  resetPasswordFlowReset,
  resetPasswordStart,
  resetPasswordSuccess,
  resetRequestFailure,
  resetRequestStart,
  resetRequestSuccess,
  verifyOtpFailure,
  verifyOtpStart,
  verifyOtpSuccess,
} from "@/store/slices/authSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { resetLoading, resetError, resetStep, resetSuccess } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    dispatch(resetPasswordFlowReset());
  }, [dispatch]);

  useEffect(() => {
    if (resetSuccess && resetStep === 3) {
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    }
  }, [resetSuccess, resetStep, router]);

  const handleSendEmail = async () => {
    dispatch(resetRequestStart());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/password-reset/request-reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        dispatch(resetRequestSuccess());
      } else {
        dispatch(resetRequestFailure(data.error || "Failed to send OTP"));
      }
    } catch {
      dispatch(resetRequestFailure("Network error"));
    }
  };

  const handleVerifyOtp = async () => {
    dispatch(verifyOtpStart());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/password-reset/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        dispatch(verifyOtpSuccess());
      } else {
        dispatch(verifyOtpFailure(data.error || "OTP verification failed"));
      }
    } catch {
      dispatch(verifyOtpFailure("Network error"));
    }
  };

  const handleResetPassword = async () => {
    dispatch(resetPasswordStart());

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/password-reset/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        dispatch(resetPasswordSuccess());
      } else {
        dispatch(resetPasswordFailure(data.error || "Password reset failed"));
      }
    } catch {
      dispatch(resetPasswordFailure("Network error"));
    }
  };

  return (
    <div className="w-full mx-auto p-4 rounded space-y-4 bg-white shadow">
      {resetStep === 1 && (
        <>
          <p>Enter your email to receive a verification OTP.</p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border"
            disabled={resetLoading}
            autoComplete="email"
          />
          <button
            onClick={handleSendEmail}
            disabled={!email || resetLoading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {resetLoading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {resetStep === 2 && (
        <>
          <p>Enter the OTP sent to your email.</p>
          <div className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm flex items-center gap-3">
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-gray-400 text-gray-700 text-sm"
              disabled={resetLoading}
              autoComplete="one-time-code"
            />
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={!otp || resetLoading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {resetLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      {resetStep === 3 && (
        <>
          <p>Enter your new password.</p>
          <div className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm flex items-center gap-3">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-gray-400 text-gray-700 text-sm"
              disabled={resetLoading}
              autoComplete="new-password"
            />
          </div>
          <button
            onClick={handleResetPassword}
            disabled={!newPassword || resetLoading}
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </button>
        </>
      )}

      {resetSuccess && (
        <p className="text-green-600 font-semibold text-center">
          Password reset successful!
        </p>
      )}

      {resetError && (
        <p className="text-red-600 text-sm font-medium text-center">
          {resetError}
        </p>
      )}
    </div>
  );
}
