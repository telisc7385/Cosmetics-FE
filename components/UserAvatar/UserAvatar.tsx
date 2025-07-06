"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { FiUser, FiLogOut } from "react-icons/fi";
import { BsBoxSeam } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function UserAvatar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const customer = useSelector((state: RootState) => state.auth.customer);

  const username = customer?.firstName || "";
  const initials = username ? username[0].toUpperCase() : "US";

  const handleLogout = () => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex flex-col overflow-hidden`}
        >
          <div className="flex-1 w-full p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <FiLogOut className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-800">
                  Are you sure you want to log out?
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                dispatch(logout());
                router.push("/auth");
                router.refresh();
              }}
              className="w-full px-4 py-3 flex items-center justify-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Yes, Logout
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full px-4 py-3 flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border-l border-gray-200"
            >
              No, Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: { top: "10px" },
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!customer) {
    return (
      <Link href="/auth" aria-label="Login">
        <div className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
          <FiUser size={20} />
          <span className="whitespace-nowrap">Sign In / Sign Up</span>
        </div>
      </Link>
    );
  }

  const menuItems = [
    {
      name: "My Profile",
      icon: <FaUserEdit className="mr-3 text-gray-500" />,
      action: () => router.push("/account?tab=profile"),
    },
    {
      name: "Orders",
      icon: <BsBoxSeam className="mr-3 text-gray-500" />,
      action: () => router.push("/account?tab=orders"),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <div
        onMouseEnter={() => setMenuOpen(true)}
        className="flex items-center gap-3 cursor-pointer px-8 py-1 rounded-md hover:bg-gray-100 transition-all duration-200"
      >
        {customer.imageUrl ? (
          <Image
            src={customer.imageUrl}
            alt="User Avatar"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-base uppercase border border-gray-300">
            {initials}
          </div>
        )}
        <span className="text-gray-800 font-medium text-sm whitespace-nowrap">
          {username}
        </span>
      </div>

      {menuOpen && (
        <div
          onMouseLeave={() => setMenuOpen(false)}
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 animate-fade-in"
        >
          <ul className="py-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    item.action();
                  }}
                  className="flex items-center w-full px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item.icon}
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t px-4 py-2">
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="flex items-center text-sm text-red-600 hover:text-red-700 w-full"
            >
              <MdLogout className="mr-3" size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
