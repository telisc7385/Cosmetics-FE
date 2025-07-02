// "use client";
 
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
 
// export default function MyOrders() {
//   const [orders, setOrders] = useState<any[]>([]);
 
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await fetch(
//           "https://cosmaticadmin.twilightparadox.com/order",
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Token ${localStorage.getItem("token")}`, // 🔁 Replace with actual logic if stored differently
//             },
//           }
//         );
 
//         if (!res.ok) throw new Error("Failed to fetch orders");
 
//         const data = await res.json();
//         setOrders(data);
//       } catch (err) {
//         toast.error("Failed to load orders");
//       }
//     };
 
//     fetchOrders();
//   }, []);
 
//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">My Orders</h2>
//       {orders.length === 0 ? (
//         <p>No orders found.</p>
//       ) : (
//         <ul className="space-y-4">
//           {orders.map((order) => (
//             <li key={order.id} className="border p-4 rounded shadow-sm">
//               <p className="font-semibold">Order ID: {order.id}</p>
//               <p>Status: {order.status}</p>
//               <p>Total: ₹{order.total}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
 
 

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Order {
  id: number;
  status: string;
  total: number;
  // Add other fields as needed (date, items, etc.)
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "https://cosmaticadmin.twilightparadox.com/order",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch orders");

        const data: Order[] = await res.json();
        setOrders(data);
      } catch {
        toast.error("Failed to load orders");
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border p-4 rounded shadow-sm">
              <p className="font-semibold">Order ID: {order.id}</p>
              <p>Status: {order.status}</p>
              <p>Total: ₹{order.total}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
