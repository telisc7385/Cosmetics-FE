"use client";
 import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";
 
export default function DeleteAccount() {
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleDelete = async () => {
    if (!token) {
      toast.error("Unauthorized");
      return;
    }
 
    try {
      setLoading(true);
      await apiCore("/user/delete", "DELETE", {}, token);
      toast.success("Account deleted successfully");
      localStorage.clear();
      router.push("/auth");
    }  catch {
      toast.error("Failed to delete account");
    }finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow border">
      <h2 className="text-xl font-semibold mb-4 text-red-600">
        Delete Account
      </h2>
      <p className="mb-4 text-gray-700">
        This action is permanent and cannot be undone. Are you sure you want to
        delete your account?
      </p>
 
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Yes, I want to delete
        </button>
      ) : (
        <div className="space-x-4">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-700 text-white px-4 py-2 rounded"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-gray-600 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
 
 