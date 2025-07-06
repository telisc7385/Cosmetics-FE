"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { FiLogOut } from "react-icons/fi";

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

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full sm:w-1/4 border-r bg-white p-6">
        <h2 className="font-bold text-lg mb-6">Hello, Ashish Sharma</h2>
        <div className="space-y-2">
          <button
            onClick={() => handleTabChange("orders")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "orders" ? "bg-blue-100 font-semibold" : ""
            }`}
          >
            My Orders
          </button>
          <h3 className="mt-6 mb-2 text-gray-600 font-medium">
            Account Settings
          </h3>
          <button
            onClick={() => handleTabChange("profile")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "profile" ? "bg-blue-100 font-semibold" : ""
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => handleTabChange("addresses")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "addresses" ? "bg-blue-100 font-semibold" : ""
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
            className="text-center px-2 py-3 mt-4 text-sm bg-red-50 text-red-700 font-semibold rounded hover:bg-red-100 transition-colors border border-red-200 hover:cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        {activeTab === "profile" && <ProfileInfo />}
        {activeTab === "addresses" && <ManageAddresses />}
        {activeTab === "orders" && <MyOrders />}
        {/* HIDING: Delete Account Component Rendering */}
        {/* {activeTab === "delete-account" && <DeleteAccount />} */}
      </main>
    </div>
  );
}
