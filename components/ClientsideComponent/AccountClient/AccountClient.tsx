
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ProfileInfo = dynamic(() => import("@/components/ClientsideComponent/Profile/ProfileInfo"));
const DeleteAccount = dynamic(() => import("@/components/ClientsideComponent/Profile/DeleteAccount"));
const ManageAddresses = dynamic(() => import("@/components/ClientsideComponent/Profile/ManageAddresses"));
const MyOrders = dynamic(() => import("@/components/ClientsideComponent/Profile/MyOrders"));

export default function AccountClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");

  const validTabs = useMemo(() => ["profile", "addresses", "orders", "delete-account"], []);

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
    localStorage.clear();
    router.push("/auth");
  };

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
          <h3 className="mt-6 mb-2 text-gray-600 font-medium">Account Settings</h3>
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
          <button
            onClick={() => handleTabChange("delete-account")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "delete-account" ? "bg-blue-100 font-semibold" : ""
            }`}
          >
            Delete Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-500 hover:underline mt-4"
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
        {activeTab === "delete-account" && <DeleteAccount />}
      </main>
    </div>
  );
}
