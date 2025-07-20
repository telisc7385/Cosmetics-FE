"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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

type Props = {
  setShowForgotPassword: (value: boolean) => void;
};
export default function ForgotPassword({ setShowForgotPassword }: Props) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { resetLoading, resetError, resetStep, resetSuccess } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    dispatch(resetPasswordFlowReset());
  }, [dispatch]);

  useEffect(() => {
    if (!resetLoading && resetError) {
      toast.error(resetError);
    }

    if (resetSuccess && resetStep === 3) {
      toast.success("Password reset successful!", {
        duration: 3000,
      });

      dispatch(resetPasswordFlowReset());

      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    }
  }, [resetError, resetLoading, resetSuccess, resetStep, router, dispatch]);

  // Timer countdown for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resetStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resetStep, timer]);

  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    dispatch(resetRequestStart());
    const toastId = toast.loading("Sending OTP...");

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
        toast.success("OTP sent to your email!", { id: toastId });
        setTimer(600); // restart timer
      } else {
        dispatch(resetRequestFailure(data.error || "Failed to send OTP"));
        toast.dismiss(toastId);
      }
    } catch (err: unknown) {
      // Added : unknown for TypeScript safety
      console.error("Error in handleSendEmail:", err); // Logged the error
      dispatch(resetRequestFailure("Network error. Please try again."));
      toast.dismiss(toastId);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP.");
      return;
    }

    dispatch(verifyOtpStart());
    const toastId = toast.loading("Verifying OTP...");

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
        toast.success("OTP verified!", { id: toastId });
        // router.push('/auth')
  

      } else {
        dispatch(verifyOtpFailure(data.error || "OTP verification failed"));
        toast.dismiss(toastId);
      }
    } catch (err: unknown) {
      // Added : unknown for TypeScript safety
      console.error("Error in handleVerifyOtp:", err); // Logged the error
      dispatch(verifyOtpFailure("Network error. Please try again."));
      toast.dismiss(toastId);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Please enter your new password.");
      return;
    }

    dispatch(resetPasswordStart());
    const toastId = toast.loading("Resetting password...");

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
        toast.dismiss(toastId);
        setShowForgotPassword(false)
      } else {
        dispatch(resetPasswordFailure(data.error || "Reset failed"));
        toast.dismiss(toastId);
      }
    } catch (err: unknown) {
      // Added : unknown for TypeScript safety
      console.error("Error in handleResetPassword:", err); // Logged the error
      dispatch(resetPasswordFailure("Network error. Please try again."));
      toast.dismiss(toastId);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <div className="w-full mx-auto p-4 rounded space-y-4 bg-white shadow">
      {resetStep === 1 && (
        <>
          <p className="text-gray-700">Enter your email to receive OTP.</p>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#214364] cursor-pointer"
            disabled={resetLoading}
            autoComplete="email"
          />
          <button
            onClick={handleSendEmail}
            disabled={!email || resetLoading}
            className="w-full bg-[#214364] text-white py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetLoading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {resetStep === 2 && (
        <>
          <p className="text-gray-700">
            Enter the 6-digit OTP sent to your email.
          </p>
          <div className="flex justify-center gap-2 mb-4 text-[#213E5A] ">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                    const prev = document.getElementById(`otp-${i - 1}`);
                    prev?.focus();
                  }
                }}
                className="w-10 h-10 text-center text-lg border border-gray-300 rounded focus:ring-1 focus:ring-[#214364]"
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || resetLoading}
            className="w-full bg-[#214364] text-white py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="mt-3 text-center text-sm text-gray-600">
            {timer > 0 ? (
              <p>
                Resend OTP in{" "}
                <span className="font-semibold text-[#214364]">
                  {Math.floor(timer / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timer % 60).toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleSendEmail}
                className="text-[#214364] font-semibold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}

      {resetStep === 3 && (
        <>
          <p className="text-gray-700">Enter your new password.</p>
          <div className="w-full relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 pr-10 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#214364]"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            onClick={handleResetPassword}
            disabled={!newPassword || resetLoading}
            className="w-full bg-[#214364] text-white py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </button>
        </>
      )}
    </div>
  );
}
