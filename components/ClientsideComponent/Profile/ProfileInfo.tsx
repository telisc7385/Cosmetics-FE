// PersonalInfo.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiCore } from "@/api/ApiCore";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import { selectToken, updateProfile } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import Image from "next/image";

interface UserInfo {
  id: number;
  email: string;
  role: string;
  bio: string | null;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  phone: string;
}

export default function PersonalInfo() {
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });

  const getUserInfo = useCallback(async () => {
    try {
      const res = await apiCore(
        "/user/details",
        "GET",
        undefined,
        token || undefined
      );
      const userData = res as UserInfo;
      setUser(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || "",
      });
    } catch (error: unknown) {
      console.error("Failed to load personal info:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load personal info");
      }
    }
  }, [token]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      };

      const loadingToastId = toast.loading("Saving changes...");

      const updatedUser = await apiCore<UserInfo>(
        "/user/update", // Endpoint for user update
        "PATCH",
        updatePayload, // Send data as JSON body
        token
      );

      toast.success("Profile updated successfully!", { id: loadingToastId });

      dispatch(
        updateProfile({
          firstName: updatedUser.firstName || formData.firstName,
          lastName: updatedUser.lastName || formData.lastName,
          // ✨ FIX: DO NOT include imageUrl here if the form doesn't handle image uploads
          // The Redux reducer for updateProfile should already handle preserving it
          // if it's not present in the action payload.
          // If updatedUser from API response *does* contain the imageUrl,
          // then passing it is fine. If it *doesn't*, then don't force null.
          bio: updatedUser.bio || formData.bio,
          role: updatedUser.role || user?.role,
          phone: updatedUser.phone || user?.phone,
        })
      );

      getUserInfo(); // Re-fetch to ensure UI is in sync with backend

      setEditing(false);
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        (error instanceof Error && error.message) ||
        "Failed to update profile.";
      toast.error(errorMessage, { id: toast.loading("Saving changes...") });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const displayImageUrl = user.imageUrl || "/default-avatar.png";

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex items-center gap-6 relative">
        <div className="relative !w-[144px] !h-[144px] !rounded-full overflow-hidden">
          <Image
            src={displayImageUrl}
            alt={user.firstName || "Profile Image"}
            width={144}
            height={144}
            className="!w-[144px] !h-[144px] object-cover border-4 border-blue-100 shadow-md"
          />
        </div>

        <div>
          {editing ? (
            <>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none"
                placeholder="First Name"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none ml-2"
                placeholder="Last Name"
              />
            </>
          ) : (
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {user.firstName} {user.lastName}
            </h2>
          )}
          <p className="text-sm text-gray-600">{user.email}</p>
          <span className="inline-block mt-1 px-3 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-semibold">
            {user.role}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Bio</h3>
        {editing ? (
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none"
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-gray-600 text-sm">{user.bio || "No bio added."}</p>
        )}
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        {editing ? (
          <>
            <button
              onClick={() => {
                setEditing(false);
                if (user) {
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio || "",
                  });
                }
              }}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ backgroundColor: "#203b67" }}
              className="px-4 py-2 text-sm text-white rounded hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{ backgroundColor: "#203b67" }}
            className="px-4 py-2 text-sm text-white rounded hover:opacity-90 transition-opacity cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
