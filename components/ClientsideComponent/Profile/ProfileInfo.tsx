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
    email: "",
    bio: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
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
        email: userData.email,
        bio: userData.bio || "",
      });
    } catch (error: unknown) {
      console.error("Failed to load personal info:", error);
      toast.error("Failed to load personal info");
    }
  }, [token]);

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
      firstName: !nameRegex.test(formData.firstName.trim())
        ? "First name can contain only letters"
        : "",
      lastName: !nameRegex.test(formData.lastName.trim())
        ? "Last name can contain only letters"
        : "",
      email: !emailRegex.test(formData.email.trim())
        ? "Enter a valid email address"
        : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bio: formData.bio,
      };

      const loadingToastId = toast.loading("Saving changes...");

      const updatedUser = await apiCore<UserInfo>(
        "/user/update",
        "PATCH",
        updatePayload,
        token
      );

      toast.success("Profile updated successfully!", { id: loadingToastId });

      dispatch(
        updateProfile({
          firstName: updatedUser.firstName || formData.firstName,
          lastName: updatedUser.lastName || formData.lastName,
          email: updatedUser.email || formData.email,
          bio: updatedUser.bio || formData.bio,
          role: updatedUser.role || user?.role,
          phone: updatedUser.phone || user?.phone,
        })
      );

      getUserInfo();
      setEditing(false);
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile.");
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
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 relative">
        <div className="flex-shrink-0 self-center sm:self-start">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
            <Image
              src={displayImageUrl}
              alt={user.firstName || "Profile Image"}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col w-full">
              {editing ? (
                <>
                  <label
                    htmlFor="firstName"
                    className="text-sm text-gray-600 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="text-base font-medium text-gray-800 border border-gray-300 rounded px-3 py-1.5 mb-1 focus:outline-none"
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500 mb-2">
                      {errors.firstName}
                    </p>
                  )}

                  <label
                    htmlFor="lastName"
                    className="text-sm text-gray-600 mb-1 mt-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="text-base font-medium text-gray-800 border border-gray-300 rounded px-3 py-1.5 focus:outline-none"
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500 mb-2">
                      {errors.lastName}
                    </p>
                  )}

                  <label
                    htmlFor="email"
                    className="text-sm text-gray-600 mb-1 mt-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="text-base font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded px-3 py-1.5 cursor-not-allowed"
                    placeholder="Email"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 sm:static sm:self-start">
          <span className="inline-block px-3 py-1 text-xs sm:text-sm rounded-full bg-blue-50 text-blue-700 font-semibold">
            {user.role}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Bio</h3>
        {editing ? (
          <>
            <label htmlFor="bio" className="text-sm text-gray-600 mb-1 block">
              Your Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none"
              placeholder="Tell us about yourself..."
            />
          </>
        ) : (
          <p className="text-gray-600 text-sm">{user.bio || "No bio added."}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        {editing ? (
          <>
            <button
              onClick={() => {
                setEditing(false);
                if (user) {
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    bio: user.bio || "",
                  });
                  setErrors({ firstName: "", lastName: "", email: "" });
                }
              }}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ backgroundColor: "#203b67" }}
              className="px-4 py-2 text-sm text-white rounded hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{ backgroundColor: "#203b67" }}
            className="px-4 py-2 text-sm text-white rounded hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
