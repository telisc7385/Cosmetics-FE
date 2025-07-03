// app/order/detail/[orderId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore"; // Ensure this path is correct
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import Image from "next/image";
import Link from "next/link";

// Define types for order data based on your API response
interface OrderItem {
  id: string; // The ID of the order item itself
  product: {
    id: string;
    name: string;
    image: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  quantity: number;
  price: number; // Price per unit at the time of order
}

interface DetailedOrder {
  id: string;
  user_id: string | null; // Crucial for distinguishing guest vs. registered user orders
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country_code_for_phone_number: string | null;
  billing_address: string;
  delivery_address: string;
  order_info: Record<string, any>;
  sub_total: number;
  discount: number;
  discount_coupon_code: string;
  final_total: number;
  order_status: string;
  invoice_url: string; // The URL to download the invoice
  created_at_formatted: string; // e.g., "03/07/2025, 12:21PM"
  created_at: string;
  items?: OrderItem[];
  // paymentMethod?: string; // Uncomment if your API returns this on order details
}

interface FullOrderDetailResponse {
  order: DetailedOrder;
}

const OrderDetailPage = () => {
  const params = useParams();
  const orderId = params.orderId as string; // Must be a string now, no undefined allowed

  const token = useAppSelector(selectToken);

  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shippingCharges = 0; // Assuming 0 for now

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // No check for !orderId here, as the route [orderId] guarantees it's present
      // If it somehow gets accessed without an ID, Next.js would likely 404 or redirect anyway.

      try {
        setLoading(true);
        setError(null);
        // Corrected apiCore call: pass only the relative path
        const data = await apiCore<FullOrderDetailResponse>(
          `/order/detail/${orderId}`, // <-- Corrected path here
          "GET",
          undefined,
          token // Pass token for authentication
        );

        // Authentication check:
        // If the user is NOT logged in (no token) AND the order is NOT a guest order (user_id is not null)
        const isGuestOrder = data.order.user_id === null;
        if (!token && !isGuestOrder) {
          setError("You must be logged in to view details for this order.");
          toast.error("Please log in to view this order.");
          setOrder(null); // Clear order data if unauthorized
          return;
        }

        setOrder(data.order);
      } catch (err: any) {
        console.error("Failed to fetch order details:", err);
        // More specific error handling for API response statuses could go here
        if (
          err.message &&
          (err.message.includes("401") || err.message.includes("Unauthorized"))
        ) {
          setError(
            "You are not authorized to view this order. Please log in if you are the owner."
          );
          toast.error("Unauthorized access.");
        } else if (err.message && err.message.includes("404")) {
          setError("The order you are looking for could not be found.");
          toast.error("Order not found.");
        } else {
          setError(
            err.message ||
              "Failed to load order details. Please check your order ID or try again later."
          );
          toast.error("Error loading order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]); // Dependencies for useEffect

  const handleDownloadInvoice = () => {
    if (order?.invoice_url) {
      const invoiceFullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${order.invoice_url}`;
      window.open(invoiceFullUrl, "_blank"); // Open in new tab
      toast.success("Downloading invoice...");
    } else {
      toast.error("Invoice URL not available.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600 bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
        <p className="text-lg text-center">{error}</p>
        <Link href="/" className="mt-6 text-blue-600 hover:underline">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-700 bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-lg text-center">
          The order with ID <span className="font-semibold">{orderId}</span>{" "}
          could not be found or does not exist.
        </p>
        <Link href="/my-orders" className="mt-6 text-blue-600 hover:underline">
          View My Orders
        </Link>
        <Link href="/" className="mt-2 text-blue-600 hover:underline">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Order Details
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Order ID:
            </h2>
            <p className="text-lg text-blue-600 font-mono">{order.id}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Status:
            </h2>
            <p
              className={`text-lg font-semibold ${
                order.order_status === "DELIVERED"
                  ? "text-green-600"
                  : order.order_status === "CANCELLED"
                  ? "text-red-600"
                  : "text-orange-500"
              }`}
            >
              {order.order_status.charAt(0).toUpperCase() +
                order.order_status.slice(1)}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Order Date:
            </h2>
            <p className="text-md text-gray-600">
              {order.created_at_formatted}
            </p>
          </div>
          {/* If your API includes paymentMethod, uncomment this */}
          {/* <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Payment Method:</h2>
            <p className="text-md text-gray-600">{order.paymentMethod}</p>
          </div> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Customer Info:
            </h3>
            <p className="text-md text-gray-600">
              {order.first_name} {order.last_name}
            </p>
            <p className="text-md text-gray-600">Email: {order.email}</p>
            <p className="text-md text-gray-600">Phone: {order.phone_number}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Billing Address:
            </h3>
            <p className="text-md text-gray-600 whitespace-pre-line">
              {order.billing_address}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Shipping Address:
            </h3>
            <p className="text-md text-gray-600 whitespace-pre-line">
              {order.delivery_address}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-4">Items:</h3>
        <ul className="space-y-4 mb-6 border-b pb-4">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded-md bg-gray-50"
              >
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  {item.variant && (
                    <p className="text-sm text-gray-600">
                      Variant: {item.variant.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-md font-semibold text-gray-800">
                    ₹{item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{(item.quantity * item.price).toFixed(2)}
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No items found for this order.</p>
          )}
        </ul>

        <div className="text-right space-y-2">
          <div className="flex justify-between text-lg font-semibold text-gray-700">
            <span>Subtotal:</span>
            <span>₹{order.sub_total.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-lg font-semibold text-gray-700">
              <span>Discount ({order.discount_coupon_code || "Applied"}):</span>
              <span className="text-red-600">
                -₹{order.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold text-gray-700">
            <span>Shipping:</span>
            <span>₹{shippingCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-blue-700 border-t pt-4 mt-4">
            <span>Total Paid:</span>
            <span>₹{order.final_total.toFixed(2)}</span>
          </div>
        </div>

        {/* Invoice Download Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg shadow-md"
            disabled={!order.invoice_url}
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            Download Invoice
          </button>
          {!order.invoice_url && (
            <p className="text-sm text-red-500 mt-2">Invoice not available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
