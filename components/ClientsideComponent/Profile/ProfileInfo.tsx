// "use client";
 
// import React, { useEffect, useRef, useState } from "react";
// import { apiCore } from "@/api/ApiCore";
// import { useAppSelector } from "@/store/hooks/hooks";
// import { selectToken } from "@/store/slices/authSlice";
// import toast from "react-hot-toast";
// import { FaCamera } from "react-icons/fa";
// import Image from "next/image";

 
// interface UserInfo {
//   id: number;
//   email: string;
//   role: string;
//   bio: string;
//   firstName: string;
//   lastName: string;
//   imageUrl: string;
// }
 
// export default function PersonalInfo() {
//   const token = useAppSelector(selectToken);
//   const [user, setUser] = useState<UserInfo | null>(null);
//   const [editing, setEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     bio: "",
//   });
//   const fileInputRef = useRef<HTMLInputElement>(null);
 
//   const getUserInfo = async () => {
//     try {
//       const res = await apiCore(
//         "/user/details",
//         "GET",
//         undefined,
//         token || undefined
//       );
//       const userData = res as UserInfo; // ✅ Type assertion here
//       setUser(userData);
//       setFormData({
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         bio: userData.bio,
//       });
//     } catch {
//       toast.error("Failed to load personal info");
//     }
//   };
 
//   useEffect(() => {
//     getUserInfo();
//   }, []);
 
//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
 
//   const handleSave = async () => {
//     try {
//       await apiCore("/user/update", "PATCH", formData, token || undefined);
//       toast.success("Profile updated");
//       getUserInfo();
//       setEditing(false);
//     } catch (err) {
//       toast.error("Failed to update profile");
//     }
//   };
 
//   const handleImageClick = () => {
//     fileInputRef.current?.click();
//   };
 
//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file || !token) return;
 
//     const formData = new FormData();
//     formData.append("image", file);
 
//     try {
//       await fetch(
//         `${
//           process.env.NEXT_PUBLIC_BASE_URL || "https://ecom-ahj1.onrender.com"
//         }/user/update`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Token ${token}`,
//           },
//           body: formData,
//         }
//       );
//       toast.success("Profile image updated");
//       getUserInfo();
//     } catch (err) {
//       toast.error("Failed to update image");
//     }
//   };
 
//   if (!user) return null;
 
//   return (
//     <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
//       <div className="flex items-center gap-6 relative">
//         <div
//           className="relative cursor-pointer group"
//           onClick={handleImageClick}
//         >
//           <Image
//             src={user.imageUrl}
//             alt={user.firstName}
//             width={96}
//             height={96}
//             className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
//           />
//           <div className="absolute bottom-1 right-1 bg-blue-600 p-1 rounded-full text-white text-xs group-hover:scale-110 transition">
//             <FaCamera size={14} />
//           </div>
//         </div>
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           className="hidden"
//           onChange={handleImageChange}
//         />
 
//         <div>
//           {editing ? (
//             <>
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleInputChange}
//                 className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none"
//               />
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleInputChange}
//                 className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none ml-2"
//               />
//             </>
//           ) : (
//             <h2 className="text-2xl font-bold text-gray-800 capitalize">
//               {user.firstName} {user.lastName}
//             </h2>
//           )}
//           <p className="text-sm text-gray-600">{user.email}</p>
//           <span className="inline-block mt-1 px-3 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-semibold">
//             {user.role}
//           </span>
//         </div>
//       </div>
 
//       <div className="mt-6 border-t pt-4">
//         <h3 className="text-lg font-semibold text-gray-700 mb-1">Bio</h3>
//         {editing ? (
//           <textarea
//             name="bio"
//             value={formData.bio}
//             onChange={handleInputChange}
//             rows={3}
//             className="w-full text-sm text-gray-700 border border-gray-300 rounded px-3 py-2 focus:outline-none"
//           />
//         ) : (
//           <p className="text-gray-600 text-sm">{user.bio || "No bio added."}</p>
//         )}
//       </div>
 
//       <div className="mt-4 flex justify-end space-x-3">
//         {editing ? (
//           <>
//             <button
//               onClick={() => setEditing(false)}
//               className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Save Changes
//             </button>
//           </>
//         ) : (
//           <button
//             onClick={() => setEditing(true)}
//             className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
//           >
//             Edit Profile
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
 
 
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiCore } from "@/api/ApiCore";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";
import Image from "next/image";

interface UserInfo {
  id: number;
  email: string;
  role: string;
  bio: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}

export default function PersonalInfo() {
  const token = useAppSelector(selectToken);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        bio: userData.bio,
      });
    } catch {
      toast.error("Failed to load personal info");
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
      await apiCore("/user/update", "PATCH", formData, token || undefined);
      toast.success("Profile updated");
      getUserInfo();
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "https://cosmaticadmin.twilightparadox.com"
        }/user/update`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );
      toast.success("Profile image updated");
      getUserInfo();
    } catch {
      toast.error("Failed to update image");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex items-center gap-6 relative">
        <div
          className="relative cursor-pointer group w-24 h-24"
          onClick={handleImageClick}
        >
          <Image
            src={user.imageUrl}
            alt={user.firstName}
            width={96}
            height={96}
            className="rounded-full object-cover border-4 border-blue-100 shadow-md"
          />
          <div className="absolute bottom-1 right-1 bg-blue-600 p-1 rounded-full text-white text-xs group-hover:scale-110 transition">
            <FaCamera size={14} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        <div>
          {editing ? (
            <>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none ml-2"
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
          />
        ) : (
          <p className="text-gray-600 text-sm">{user.bio || "No bio added."}</p>
        )}
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
