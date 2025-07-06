// PersonalInfo.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiCore } from "@/api/ApiCore"; // Make sure this path is correct for your project setup
import { useAppSelector } from "@/store/hooks/hooks"; // Make sure this path is correct
import { selectToken } from "@/store/slices/authSlice"; // Make sure this path is correct
import toast from "react-hot-toast"; // Ensure you have react-hot-toast installed: npm install react-hot-toast
import { FaCamera } from "react-icons/fa"; // Ensure you have react-icons installed: npm install react-icons
import Image from "next/image"; // Next.js Image component

// Define the UserInfo interface based on your API response structure
interface UserInfo {
  id: number;
  email: string;
  role: string;
  bio: string;
  firstName: string;
  lastName: string;
  imageUrl: string; // The URL for the user's profile image
}

export default function PersonalInfo() {
  const token = useAppSelector(selectToken); // Get the authentication token from Redux store
  const [user, setUser] = useState<UserInfo | null>(null); // State to store user's profile data
  const [editing, setEditing] = useState(false); // State to control edit mode (true when "Edit Profile" is clicked)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  }); // State for form inputs (firstName, lastName, bio)

  // State to temporarily hold the selected image file (client-side only until saved)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  // Function to fetch user information from the backend
  const getUserInfo = useCallback(async () => {
    try {
      const res = await apiCore(
        "/user/details", // API endpoint to get user details
        "GET",
        undefined, // No body for GET request
        token || undefined // Pass the token for authentication
      );
      const userData = res as UserInfo; // Cast the response to UserInfo type
      setUser(userData); // Set the user state
      // Initialize formData with current user data when fetched
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
      });
      // Important: Clear any pending image selection when user info is re-fetched/loaded
      setSelectedImageFile(null);
    } catch (error: unknown) {
      // Changed 'any' to 'unknown' here
      console.error("Failed to load personal info:", error);
      // You can add a type guard to access 'message' property
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to load personal info");
      }
    }
  }, [token]); // Dependency array: re-run if token changes

  // Effect hook to fetch user info on component mount
  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]); // Dependency array: re-run if getUserInfo function changes (due to useCallback, it won't unless token changes)

  // Handle changes in text input fields (First Name, Last Name, Bio)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This function handles the actual saving of all profile changes (text and image) to the server
  const handleSave = async () => {
    try {
      // Create FormData to send all data, including the file if selected
      const updateFormData = new FormData();
      updateFormData.append("firstName", formData.firstName);
      updateFormData.append("lastName", formData.lastName);
      updateFormData.append("bio", formData.bio);

      // Only append the image if a new one was selected locally
      if (selectedImageFile) {
        updateFormData.append("image", selectedImageFile);
      }

      // Perform the fetch request to your API endpoint
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://cosmaticadmin.twilightparadox.com"
        }/user/update`,
        {
          method: "PATCH", // Use PATCH for partial updates
          headers: {
            Authorization: `Token ${token}`,
            // Do NOT set 'Content-Type': 'multipart/form-data' here; the browser handles it automatically for FormData
          },
          body: updateFormData, // Send the FormData object
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!");
      getUserInfo(); // Re-fetch user info to display all newly updated data (text and new image URL from server)
      setEditing(false); // Exit editing mode
      setSelectedImageFile(null); // Clear the locally held image file after successful upload
    } catch (error: unknown) {
      // Changed 'any' to 'unknown' here
      console.error("Failed to update profile:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error("Failed to update profile.");
      }
    }
  };

  // Handles click on the profile image to open the file input
  const handleImageClick = () => {
    // Only allow image click if in editing mode
    if (editing) {
      fileInputRef.current?.click(); // Programmatically click the hidden file input
    }
  };

  // This function only handles selecting the image and storing it locally for preview
  // It DOES NOT make an API call or upload the image to the server at this point.
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the selected file
    if (file) {
      setSelectedImageFile(file); // Store the file in local state
      toast.success("New image selected! Click 'Save Changes' to upload."); // Inform user
    } else {
      setSelectedImageFile(null); // Clear if user cancels file selection
    }
    // Clear the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // If user data is not yet loaded, show nothing or a loading spinner
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Determine which image URL to display:
  // - A local preview of the selected new image (using URL.createObjectURL)
  // - Or the user's current image (already on the server)
  const displayImageUrl = selectedImageFile
    ? URL.createObjectURL(selectedImageFile) // Create temporary URL for local preview
    : user.imageUrl; // Use the image URL from the user data (already on server)

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex items-center gap-6 relative">
        {/* Profile Image Section */}
        <div
          // !w-[144px] !h-[144px] enforce strict pixel dimensions (144px by 144px)
          // !rounded-full ensures a perfect circle by overriding potential conflicts
          // overflow-hidden to ensure any cropping from object-cover stays within the circle
          className="relative group !w-[144px] !h-[144px] !rounded-full overflow-hidden"
          onClick={editing ? handleImageClick : undefined} // Only clickable when editing
          style={{ cursor: editing ? "pointer" : "default" }} // Change cursor when clickable
        >
          <Image
            src={displayImageUrl} // Displays local preview if available, else current user image
            alt={user.firstName || "Profile Image"}
            width={144} // Fixed intrinsic width for Next.js Image component
            height={144} // Fixed intrinsic height for Next.js Image component
            // `!w-[144px] !h-[144px]` reinforces strict size directly on the img tag
            // `object-cover` ensures the image fills the 144x144 area, cropping if its aspect ratio doesn't match 1:1
            // `border-4 border-blue-100 shadow-md` for styling
            className="!w-[144px] !h-[144px] object-cover border-4 border-blue-100 shadow-md"
          />
          {/* Camera icon overlay, only shown when in editing mode */}
          {editing && (
            <div className="absolute bottom-1 right-1 bg-blue-600 p-1 rounded-full text-white text-xs group-hover:scale-110 transition">
              <FaCamera size={14} /> {/* Camera icon */}
            </div>
          )}
        </div>
        {/* Hidden file input, triggered by handleImageClick */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*" // Only accept image files
          className="hidden" // Hide the default file input
          onChange={handleImageChange} // Call handleImageChange when a file is selected
        />

        {/* User Name, Email, Role Section */}
        <div>
          {editing ? (
            // Render input fields when in editing mode
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
            // Render static text when not editing
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

      {/* Bio Section */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Bio</h3>
        {editing ? (
          // Render textarea when in editing mode
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none"
            placeholder="Tell us about yourself..."
          />
        ) : (
          // Render static bio text when not editing
          <p className="text-gray-600 text-sm">{user.bio || "No bio added."}</p>
        )}
      </div>

      {/* Action Buttons (Edit/Cancel/Save) */}
      <div className="mt-4 flex justify-end space-x-3">
        {editing ? (
          // Show Cancel and Save buttons when editing
          <>
            <button
              onClick={() => {
                setEditing(false); // Exit editing mode
                // Reset formData to the original user data and clear selected image on cancel
                if (user) {
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio,
                  });
                }
                setSelectedImageFile(null); // Clear the locally held image file
              }}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave} // Call handleSave to upload changes
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </>
        ) : (
          // Show Edit button when not editing
          <button
            onClick={() => setEditing(true)} // Enter editing mode
            className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
