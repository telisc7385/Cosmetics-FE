"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { FiLogOut } from "react-icons/fi";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { ChevronDown, ChevronUp, X } from "lucide-react"; // Import Chevron and X icons
import { handleRemovePincode } from "@/utils/removePincodeData";
import { clearCart } from "@/store/slices/cartSlice";

const ProfileInfo = dynamic(
  () => import("@/components/ClientsideComponent/Profile/ProfileInfo")
);
const DeleteAccount = dynamic(
  () => import("@/components/ClientsideComponent/Profile/DeleteAccount")
);
const ManageAddresses = dynamic(
  () => import("@/components/ClientsideComponent/Profile/ManageAddresses")
);
const MyOrders = dynamic(
  () => import("@/components/ClientsideComponent/Profile/MyOrders")
);

export default function AccountClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAppSelector(selectUser);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu visibility

  const validTabs = useMemo(
    () => [
      "profile",
      "addresses",
      "orders",
      // "delete-account", // HIDING: Removed from valid tabs
    ],
    []
  );

  useEffect(() => {
    if (!tabParam || !validTabs.includes(tabParam)) {
      setActiveTab("profile");
    } else {
      setActiveTab(tabParam);
    }
  }, [tabParam, validTabs]);

  const handleTabChange = (tab: string) => {
    router.push(`/account?tab=${tab}`);
    setIsMobileMenuOpen(false); // Close mobile menu on tab change
  };

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
                localStorage.clear();
                handleRemovePincode();
                clearCart();
                router.push("/auth");
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
        style: {
          top: "10px",
        },
      }
    );
  };

  // ✅ Prevent unused import warning (harmless dummy reference)
  void DeleteAccount;

  return (
    <div className=" flex flex-col lg:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside
        className="w-full lg:w-1/4 border-b lg:border-r lg:border-b-0 bg-white p-4 lg:p-6 text-[#213E5A]
                        flex flex-col shadow-sm lg:shadow-none relative"
      >
        {" "}
        {/* Added relative to parent for absolute positioning of X button */}
        {/* Mobile Header (visible only on mobile) */}
        <div
          className="lg:hidden flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <h2 className="font-bold text-lg">
            Hello, {user?.firstName || "Guest"}
          </h2>
          {isMobileMenuOpen ? (
            <ChevronUp className="w-5 h-5 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform" />
          )}
        </div>
        {/* Desktop Header (visible only on laptop) */}
        <h2 className="hidden lg:block font-bold text-lg mb-6">
          Hello, {user?.firstName || "Guest"}
        </h2>
        {/* Mobile Menu Content (conditionally visible on mobile, always visible on laptop) */}
        <div
          className={`flex flex-col space-y-2 flex-grow ${
            isMobileMenuOpen ? "block" : "hidden lg:block"
          }`}
        >
          <button
            onClick={() => handleTabChange("orders")}
            className={`w-full text-left px-4 py-2 rounded text-[#213E5A] transition-colors duration-200 ${
              activeTab === "orders"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            My Orders
          </button>
          <h3 className="mt-2 mb-2 text-gray-600 font-medium text-[#213E5A]">
            Account Settings
          </h3>
          <button
            onClick={() => handleTabChange("profile")}
            className={`w-full text-left px-4 py-2 rounded text-[#213E5A] transition-colors duration-200 ${
              activeTab === "profile"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => handleTabChange("addresses")}
            className={`w-full text-left px-4 py-2 rounded text-[#213E5A] transition-colors duration-200 ${
              activeTab === "addresses"
                ? "bg-blue-100 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            Manage Addresses
          </button>
          {/* HIDING: Delete Account Button */}
          {/* <button
            onClick={() => handleTabChange("delete-account")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "delete-account" ? "bg-blue-100 font-semibold" : ""
            }`}
          >
            Delete Account
          </button> */}
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2 mt-4 text-sm bg-red-50 text-red-700 font-semibold rounded hover:bg-red-100 transition-colors border border-red-200 hover:cursor-pointer"
          >
            Logout
          </button>

          {/* Close button for mobile menu - now an 'X' in a round div on a divider */}
          {isMobileMenuOpen && (
            <div className="lg:hidden w-full h-8 relative mt-4">
              {" "}
              {/* Container for the line and X button */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200"></div>{" "}
              {/* The line */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors z-10"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 bg-gray-50">
        {activeTab === "profile" && <ProfileInfo />}
        {activeTab === "addresses" && <ManageAddresses />}
        {activeTab === "orders" && <MyOrders />}
        {/* HIDING: Delete Account Component Rendering */}
        {/* {activeTab === "delete-account" && <DeleteAccount />} */}
      </main>
    </div>
  );
}
