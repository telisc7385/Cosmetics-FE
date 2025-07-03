// app/thank-you/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import Image from "next/image";

// Define types based on the NEW API response structure you provided
interface CustomerInfo {
  first_name: string;
  last_name: string;
  country_code_for_phone_number: string | null;
  phone_number: string;
  email: string;
  billing_address: string; // Full string address, might need parsing for display
  delivery_address: string; // Full string address, might need parsing for display
}

interface OrderInfo {
  sub_total: number;
  discount: number;
  discount_coupon_code: string;
  final_total: number;
  order_status: string;
  invoice_url: string;
  created_at_formatted: string;
  created_at: string;
}

interface PaymentInfo {
  is_payment_done: boolean;
  payment_transaction_id: string;
  payment_type: string;
}

interface RawOrderItemFromApi {
  // This matches the 'items' array in your API response
  id: number; // This is product ID or similar, not necessarily order_item_id
  variant_id: number | null;
  name: string;
  SKU: string;
  unit_price: number;
  quantity: number;
  category: string;
  specification: string;
  // IMPORTANT: Your API response for items *doesn't* include an 'image' directly.
  // You'll need a way to get the image, either from a product/variant data store
  // or a generic placeholder. For now, I'll add a placeholder function.
}

// The DetailedOrder now reflects the structure of an item within the 'results' array
interface DetailedOrder {
  id: string; // e.g., "COM-48-Guest"
  purchased_item_count: number;
  customer_info: CustomerInfo;
  order_info: OrderInfo;
  payment_info: PaymentInfo;
  items: RawOrderItemFromApi[]; // Array of items as returned by your API
}

// The overall API response shape
interface OrderListApiResponse {
  message: string;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: DetailedOrder[]; // The array containing your order(s)
}

// Helper function to get product image (you'll need to implement this properly)
// For now, it returns a placeholder. You might need to fetch product details separately
// or have a mapping of product IDs to image URLs.
const getProductImageUrl = (
  productId: number,
  variantId: number | null
): string => {
  // In a real application, you might:
  // 1. Have a map/cache of product images.
  // 2. Make another API call to get product details (less efficient).
  // 3. Assume a consistent URL structure for product images based on ID.
  // For now, let's use a generic placeholder:
  return `https://via.placeholder.com/80?text=P${productId}`; // Placeholder
};

const ThankYouPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token = useAppSelector(selectToken);

  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shippingCharges = 0; // Assuming 0 for now

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing. Cannot display order details.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Using the updated apiCore which now handles its own base URL prepending
        // and uses the correct response type (OrderListApiResponse)
        const responseData = await apiCore<OrderListApiResponse>(
          `/order/detail/${orderId}`, // This is now a relative path
          "GET",
          undefined,
          token
        );

        if (responseData.results && responseData.results.length > 0) {
          const fetchedOrder = responseData.results[0]; // Access the first item in the results array

          // Re-evaluating the authentication logic:
          // If a token exists, it's a logged-in user. We trust the API to return the correct order.
          // If no token exists, it's a guest user. We assume guest orders can be viewed by anyone with the orderId.
          // The API response *doesn't* directly have `user_id` on the `DetailedOrder` anymore.
          // So the previous `data.order.user_id === null` check is no longer directly applicable.
          // The API itself should enforce if a guest order (no token) can view a logged-in user's order.
          // For now, the successful fetch means the API allowed the access.

          setOrder(fetchedOrder);
        } else {
          setError("Order not found or no results returned for this ID.");
          toast.error("Order not found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch order details on thank you page:", err);
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
              "Failed to load order details for your recent purchase."
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
    if (order?.order_info.invoice_url) {
      // Assuming invoice_url is also a relative path and needs base URL
      const invoiceFullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${order.order_info.invoice_url}`;
      window.open(invoiceFullUrl, "_blank");
      toast.success("Downloading invoice...");
    } else {
      toast.error("Invoice URL not available.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">
          Loading order details for your purchase...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 text-red-600 p-4">
        <svg
          className="w-24 h-24 text-red-500 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold mb-4">Error!</h1>
        <p className="text-lg text-center mb-6">{error}</p>
        <Link
          href="/"
          className="block bg-pink-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors duration-300"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 text-gray-800 p-4">
        <svg
          className="w-24 h-24 text-yellow-500 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-3xl font-bold mb-4">Order Details Not Found</h1>
        <p className="text-lg text-center mb-6">
          We could not find details for order ID:{" "}
          <span className="font-semibold">{orderId || "N/A"}</span>. Please
          ensure the URL is correct or contact support.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block bg-pink-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors duration-300"
          >
            Continue Shopping
          </Link>
          {token && (
            <Link
              href="/my-orders"
              className="block text-blue-600 hover:underline"
            >
              View My Orders
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Main Thank You Page content with order details
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg shadow-md mb-8 text-center">
        <svg
          className="w-20 h-20 text-white mx-auto mb-4 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="text-4xl font-extrabold mb-2">Thank You!</h1>
        <p className="text-xl">Your order has been placed successfully.</p>
        <p className="text-md mt-2">
          Order ID: <span className="font-semibold">{order.id}</span>
        </p>
        <p className="text-md mt-2">
          We've sent an order confirmation to your email:{" "}
          <span className="font-semibold">{order.customer_info.email}</span>
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Order Summary
            </h2>
            <p className="text-lg text-gray-600">
              Status:{" "}
              <span
                className={`font-semibold ${
                  order.order_info.order_status === "DELIVERED"
                    ? "text-green-600"
                    : order.order_info.order_status === "CANCELLED"
                    ? "text-red-600"
                    : "text-orange-500"
                }`}
              >
                {order.order_info.order_status}
              </span>
            </p>
            <p className="text-lg text-gray-600">
              Order Date:{" "}
              <span className="font-semibold">
                {order.order_info.created_at_formatted}
              </span>
            </p>
            <p className="text-lg text-gray-600">
              Payment Method:{" "}
              <span className="font-semibold">
                {order.payment_info.payment_type}
              </span>
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Customer Information
            </h2>
            <p className="text-lg text-gray-600">
              Name:{" "}
              <span className="font-semibold">
                {order.customer_info.first_name} {order.customer_info.last_name}
              </span>
            </p>
            <p className="text-lg text-gray-600">
              Email:{" "}
              <span className="font-semibold">{order.customer_info.email}</span>
            </p>
            <p className="text-lg text-gray-600">
              Phone:{" "}
              <span className="font-semibold">
                {order.customer_info.phone_number}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Billing Address:
            </h3>
            <p className="text-md text-gray-600 whitespace-pre-line">
              {order.customer_info.billing_address}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Shipping Address:
            </h3>
            <p className="text-md text-gray-600 whitespace-pre-line">
              {order.customer_info.delivery_address}
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
                  src={getProductImageUrl(item.id, item.variant_id)} // Use helper function for image
                  alt={item.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.variant_id && (
                    <p className="text-sm text-gray-600">SKU: {item.SKU}</p>
                  )}
                  <p className="text-sm text-gray-700">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-md font-semibold text-gray-800">
                    ₹{item.unit_price.toFixed(2)} each
                  </p>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{(item.quantity * item.unit_price).toFixed(2)}
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
            <span>₹{order.order_info.sub_total.toFixed(2)}</span>
          </div>
          {order.order_info.discount > 0 && (
            <div className="flex justify-between text-lg font-semibold text-gray-700">
              <span>
                Discount ({order.order_info.discount_coupon_code || "Applied"}):
              </span>
              <span className="text-red-600">
                -₹{order.order_info.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold text-gray-700">
            <span>Shipping:</span>
            <span>₹{shippingCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-blue-700 border-t pt-4 mt-4">
            <span>Total Paid:</span>
            <span>₹{order.order_info.final_total.toFixed(2)}</span>
          </div>
        </div>

        {/* Invoice Download Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg shadow-md"
            disabled={!order.order_info.invoice_url}
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
          {!order.order_info.invoice_url && (
            <p className="text-sm text-red-500 mt-2">Invoice not available.</p>
          )}
          <Link
            href="/"
            className="block bg-pink-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-colors duration-300 mt-8"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
