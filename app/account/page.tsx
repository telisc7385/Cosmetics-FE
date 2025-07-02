// "use client";
 
// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import ProfileInfo from "@/components/ClientsideComponent/Profile/ProfileInfo";
// import DeleteAccount from "@/components/ClientsideComponent/Profile/DeleteAccount";
// import ManageAddresses from "@/components/ClientsideComponent/Profile/ManageAddresses";
// import MyOrders from "@/components/ClientsideComponent/Profile/MyOrders";

// export default function AccountPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
 
//   const initialTab = searchParams.get("tab") || "profile";
//   const [activeTab, setActiveTab] = useState(initialTab);
 
//   useEffect(() => {
//     const currentTab = searchParams.get("tab");
//     if (currentTab && currentTab !== activeTab) {
//       setActiveTab(currentTab);
//     }
//   }, [searchParams,activeTab]);
 
//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);
//     router.push(`/account?tab=${tab}`);
//   };
 
//   return (
//     <div className="flex min-h-screen">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-gray-50 border-r p-4">
//         <h2 className="font-bold mb-4 text-lg">Hello, Ashish Sharma</h2>
//         <div className="space-y-2">
//           <button
//             onClick={() => handleTabChange("orders")}
//             className={`w-full text-left px-4 py-2 rounded ${
//               activeTab === "orders" ? "bg-blue-100 font-semibold" : ""
//             }`}
//           >
//             My Orders
//           </button>
 
//           <h3 className="mt-4 text-gray-600 font-medium">Account Settings</h3>
 
//           <button
//             onClick={() => handleTabChange("profile")}
//             className={`w-full text-left px-4 py-2 rounded ${
//               activeTab === "profile" ? "bg-blue-100 font-semibold" : ""
//             }`}
//           >
//             Profile Information
//           </button>
 
//           <button
//             onClick={() => handleTabChange("addresses")}
//             className={`w-full text-left px-4 py-2 rounded ${
//               activeTab === "addresses" ? "bg-blue-100 font-semibold" : ""
//             }`}
//           >
//             Manage Addresses
//           </button>
 
//           <button
//             onClick={() => handleTabChange("delete-account")}
//             className={`w-full text-left px-4 py-2 rounded ${
//               activeTab === "delete-account" ? "bg-blue-100 font-semibold" : ""
//             }`}
//           >
//             Delete Account
//           </button>
 
//           <button
//             onClick={() => {
//               localStorage.clear();
//               window.location.href = "/auth";
//             }}
//             className="text-left px-4 py-2 text-red-500 hover:underline"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
 
//       {/* Right Content */}
//       <div className="flex-1 p-6">
//         {activeTab === "profile" && <ProfileInfo />}
//         {activeTab === "addresses" && <ManageAddresses />}
//         {activeTab === "orders" && <MyOrders />}
//         {activeTab === "delete-account" && <DeleteAccount />}
//       </div>
//     </div>
//   );
// }
 
 

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfileInfo from "@/components/ClientsideComponent/Profile/ProfileInfo";
import DeleteAccount from "@/components/ClientsideComponent/Profile/DeleteAccount";
import ManageAddresses from "@/components/ClientsideComponent/Profile/ManageAddresses";
import MyOrders from "@/components/ClientsideComponent/Profile/MyOrders";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profile");

  // Sync URL tab with local state
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 border-r p-4">
        <h2 className="font-bold mb-4 text-lg">Hello, Ashish Sharma</h2>
        <div className="space-y-2">
          <button
            onClick={() => handleTabChange("orders")}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === "orders" ? "bg-blue-100 font-semibold" : ""
            }`}
          >
            My Orders
          </button>

          <h3 className="mt-4 text-gray-600 font-medium">Account Settings</h3>

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
            onClick={() => {
              localStorage.clear();
              window.location.href = "/auth";
            }}
            className="text-left px-4 py-2 text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-6">
        {activeTab === "profile" && <ProfileInfo />}
        {activeTab === "addresses" && <ManageAddresses />}
        {activeTab === "orders" && <MyOrders />}
        {activeTab === "delete-account" && <DeleteAccount />}
      </div>
    </div>
  );
}
