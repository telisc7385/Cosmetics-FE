// pages/thank-you.tsx or app/thank-you/page.tsx (for Next.js App Router)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore"; // Ensure this path is correct
import { useAppSelector } from "@/store/hooks/hooks"; // Ensure this path is correct
import { selectToken } from "@/store/slices/authSlice"; // Ensure this path is correct
import Image from "next/image";
import Lottie from "react-lottie-player"; // Import Lottie
import ShoppingCart from "@/public/ShoppingCart.json"; // Assuming your Lottie animation file path
import { handleRemovePincode } from "@/utils/removePincodeData";

// Interface Definitions (Ensure these match your backend response structure)
interface CustomerInfo {
  first_name: string;
  last_name: string;
  country_code_for_phone_number: string | null;
  phone_number: string;
  email: string;
  // Updated to support either a string or a structured object for addresses
  billing_address:
    | string
    | {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string; // Optional landmark field
      }
    | null; // Explicitly allow null
  delivery_address:
    | string
    | {
        street: string;
        city: string;
        state: string;
        pincode: string;
        landmark?: string; // Optional landmark field
      }
    | null; // Explicitly allow null
}

interface OrderInfo {
  abandentDiscountAmount: number;
  shippingRate: number;
  applied_tax_rate: number;
  sub_total: number;
  discount: number; // This should be a number
  discount_coupon_code: string | null; // This is string or null, NOT boolean
  final_total: number;
  order_status: string;
  invoice_url: string;
  created_at_formatted: string;
  created_at: string;
  abandoned_discount_amount?: number; // This is number | undefined
  coupon_discount_amount?: number; // This is number | undefined
  shipping_charges: number; // This is number
  taxable_amount: number; // This is number
  tax_percentage: number; // This is number
  tax_amount: number; // This is number
}

interface PaymentInfo {
  is_payment_done: boolean;
  payment_transaction_id: string;
  payment_type: string;
}

interface RawOrderItemFromApi {
  image: string;
  id: number;
  variant_id: number | null;
  name: string;
  SKU: string;
  unit_price: number;
  quantity: number;
  category: string;
  specification: string;
  slug?: string | null;
}

// Ensure DetailedOrder is correctly typed based on what your guest/checkout API returns
// and what the /order/detail/:orderId API returns.
export interface DetailedOrder {
  id: string;
  purchased_item_count: number;
  customer_info: CustomerInfo;
  order_info: OrderInfo;
  payment_info: PaymentInfo;
  items: RawOrderItemFromApi[];
}

interface OrderListApiResponse {
  message: string;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: DetailedOrder[];
}

const ThankYouPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId"); // Get paymentId from URL
  const token = useAppSelector(selectToken); // This will be null for guest users

  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing. Cannot display order details.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setOrder(null); // Reset order state before attempting to load

      let fetchedOrder: DetailedOrder | null = null;

      // 1. Attempt to load from sessionStorage for ALL sessions first,
      // but only if a stored order with the matching ID exists.
      if (typeof window !== "undefined") {
        const storedGuestOrder = sessionStorage.getItem("lastGuestOrder");
        if (storedGuestOrder) {
          try {
            const parsedOrder: DetailedOrder = JSON.parse(storedGuestOrder);
            // Crucially, check if the ID matches the one from the URL.
            // This prevents showing an old, irrelevant order.
            if (
              parsedOrder.id === orderId &&
              parsedOrder.order_info &&
              parsedOrder.customer_info
            ) {
              fetchedOrder = parsedOrder;
              // IMPORTANT: Remove it from sessionStorage after successful retrieval
              // to prevent showing it again on subsequent page loads/navs.
              sessionStorage.removeItem("lastGuestOrder");
              handleRemovePincode(); // This function likely clears pincode data from local storage/session.
              console.log(
                "ThankYouPage: Loaded guest order from sessionStorage."
              );
            } else {
              console.log(
                "ThankYouPage: Stored order in sessionStorage does not match current orderId or is incomplete. Will attempt API fetch."
              );
              // If it doesn't match, maybe it's an old guest order, or incomplete.
              // We should remove it and then proceed to API.
              sessionStorage.removeItem("lastGuestOrder");
            }
          } catch (e) {
            console.error(
              "ThankYouPage: Failed to parse stored guest order from sessionStorage:",
              e
            );
            // If parsing fails, proceed to API fetch
            sessionStorage.removeItem("lastGuestOrder"); // Clear corrupted data
          }
        }
      }

      if (fetchedOrder) {
        setOrder(fetchedOrder);
        setShowCelebration(true);
        setLoading(false);
        return; // Exit if a valid order was loaded from sessionStorage
      }

      // 2. If no valid order found in sessionStorage, then proceed with API fetch.
      // This API call will now be attempted for both logged-in and guest users.
      // The success depends on your backend's endpoint configuration for guest orders.
      try {
        console.log(
          `ThankYouPage: Attempting API fetch for order ID: ${orderId} (token present: ${!!token})`
        );
        const responseData = await apiCore<OrderListApiResponse>(
          `/order/detail/${orderId}`,
          "GET",
          undefined,
          token // Pass token if available (for logged-in users). For guests, this will be null/undefined.
        );

        if (responseData.results && responseData.results.length > 0) {
          setOrder(responseData.results[0]);
          setShowCelebration(true);
          console.log(
            "ThankYouPage: Successfully fetched order details from API."
          );
        } else {
          // If API returns no results, or an empty array
          setError("Order not found or no results returned for this ID.");
          toast.error("Order not found.");
          console.error(
            "ThankYouPage: API returned no results for order ID:",
            orderId
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";

        console.error(
          "ThankYouPage: Failed to fetch order details from API:",
          errorMessage
        );

        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized")
        ) {
          setError(
            "You are not authorized to view this order. Please log in if you are the owner."
          );
          toast.error("Unauthorized access to order details.");
        } else if (errorMessage.includes("404")) {
          setError("The order you are looking for could not be found.");
          toast.error("Order not found.");
        } else {
          setError(
            errorMessage ||
              "Failed to load order details for your recent purchase."
          );
          toast.error("Error loading order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, token]); // Re-run effect if orderId or token changes

  const handleDownloadInvoice = () => {
    // Crucially, check if order and order.order_info exist before accessing invoice_url
    if (order?.order_info?.invoice_url) {
      let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        baseUrl = "https://cosmaticadmin.twilightparadox.com"; // Fallback URL
      }
      if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }
      // Ensure the invoice URL from the backend is handled correctly
      // It might be an absolute path or a full URL.
      const invoiceRelativePath = order.order_info.invoice_url.startsWith(
        "http"
      )
        ? order.order_info.invoice_url // It's already a full URL
        : order.order_info.invoice_url.startsWith("/")
        ? `${baseUrl}${order.order_info.invoice_url}` // Absolute path, append to base
        : `${baseUrl}/${order.order_info.invoice_url}`; // Relative path, append with slash

      window.open(invoiceRelativePath, "_blank"); // Use the potentially adjusted URL
      toast.success("Downloading invoice... 📥");
    } else {
      toast.error("Invoice URL not available.");
    }
  };

  // --- Conditional Renders ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Lottie
          loop
          animationData={ShoppingCart} // Re-use your Lottie animation for loading
          play
          style={{ width: 100, height: 100 }}
        />
        <p className="mt-4 text-xl font-semibold text-gray-700">
          Loading order details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 text-red-600 p-3">
        <svg
          className="w-20 h-20 text-red-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl font-bold mb-3">Error!</h1>
        <p className="text-base text-center mb-4">{error}</p>
        <Link
          href="/"
          className="block bg-pink-600 text-white py-2 px-4 rounded-lg text-base font-semibold hover:bg-pink-700 transition-colors duration-300"
        >
          Go to Homepage
        </Link>
        {/* For guests, if API fetch failed, still guide them. */}
        <Link
          href="/guest-checkout"
          className="block mt-3 text-blue-600 hover:underline text-sm"
        >
          Try Guest Checkout Again
        </Link>
      </div>
    );
  }

  if (!order) {
    // This case should theoretically be covered by the `error` state now,
    // but kept as a fallback for extreme edge cases where order is null but no specific error.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 text-gray-800 p-3">
        <svg
          className="w-20 h-20 text-yellow-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl font-bold mb-3">Order Details Not Found</h1>
        <p className="text-base text-center mb-4">
          We could not find details for order ID:{" "}
          <span className="font-semibold">{orderId || "N/A"}</span>. Please
          ensure the URL is correct or contact support.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block bg-[#213E5A] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-transform duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
          >
            Continue Shopping
          </Link>
          {token && (
            <Link
              href="/my-orders"
              className="block text-blue-600 hover:underline text-sm"
            >
              View My Orders
            </Link>
          )}
        </div>
      </div>
    );
  }

  // If we reach here, `order` is guaranteed not to be null
  return (
    <div className="relative container mx-auto p-2 sm:p-4 bg-gray-50 min-h-screen">
      {showCelebration && (
        <div className="celebration-effect">
          {Array.from({ length: 150 }).map((_, i) => (
            <div
              key={`confetti-${i}`}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Global styles for confetti */}
      <style jsx global>{`
        .celebration-effect {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 1000;
        }

        .confetti {
          position: absolute;
          background-color: #f0f; /* Default color, overridden by inline style */
          opacity: 0;
          transform: translateY(0) rotate(0deg);
          animation: confetti-fall 3s ease-out forwards;
        }

        @keyframes confetti-fall {
          0% {
            opacity: 0;
            transform: translateY(-100px) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg shadow-md mb-4 text-center sm:p-5 mt-10">
        <svg
          className="w-14 h-14 sm:w-16 sm:h-16 text-white mx-auto mb-2 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
          Thank You! 🎉
        </h1>
        <p className="text-base sm:text-lg">
          Your order has been placed successfully.
        </p>
        <p className="text-sm mt-1">
          Order ID: <span className="font-semibold">{order.id}</span>
        </p>
        {paymentId && ( // Display paymentId if available
          <p className="text-sm mt-1">
            Payment ID: <span className="font-semibold">{paymentId}</span>
          </p>
        )}
        <p className="text-sm mt-1">
          We&apos;ve sent an order confirmation to your email:{" "}
          <span className="font-semibold">{order.customer_info.email}</span>
        </p>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-lg max-w-4xl mx-auto sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4 border-b pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              Order Summary
            </h2>
            <p className="text-sm text-gray-600">
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
            <p className="text-sm text-gray-600">
              Order Date:{" "}
              <span className="font-semibold">
                {order.order_info.created_at_formatted}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Payment Method:{" "}
              <span className="font-semibold">
                {order.payment_info.payment_type}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Payment Status:{" "}
              <span className="font-semibold">
                {order.payment_info.is_payment_done
                  ? "Completed"
                  : "Pending/Failed"}
              </span>
            </p>
            {order.payment_info.payment_transaction_id && (
              <p className="text-sm text-gray-600">
                Transaction ID:{" "}
                <span className="font-semibold">
                  {order.payment_info.payment_transaction_id}
                </span>
              </p>
            )}
            {paymentId && ( // Display paymentId in summary too if available from URL
              <p className="text-sm text-gray-600">
                Razorpay Payment ID:{" "}
                <span className="font-semibold">{paymentId}</span>
              </p>
            )}
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              Customer Information
            </h2>
            <p className="text-sm text-gray-600">
              Name:{" "}
              <span className="font-semibold">
                {order.customer_info.first_name} {order.customer_info.last_name}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Email:{" "}
              <span className="font-semibold">{order.customer_info.email}</span>
            </p>
            <p className="text-sm text-gray-600">
              Phone:{" "}
              <span className="font-semibold">
                {order.customer_info.country_code_for_phone_number}
                {order.customer_info.phone_number}
              </span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4 border-b pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              Billing Address:
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">
                {order.customer_info.first_name} {order.customer_info.last_name}
              </span>
              <br />
              <span className="font-semibold">
                {order.customer_info.country_code_for_phone_number}
                {order.customer_info.phone_number}
              </span>
              <br />
              {order.customer_info.billing_address ? ( // ADDED NULL CHECK
                typeof order.customer_info.billing_address === "string" ? (
                  <span className="whitespace-pre-line">
                    {order.customer_info.billing_address}
                  </span>
                ) : (
                  <>
                    <span>{order.customer_info.billing_address.street}</span>
                    <br />
                    {order.customer_info.billing_address.landmark && (
                      <>
                        <span>
                          {order.customer_info.billing_address.landmark}
                        </span>
                        <br />
                      </>
                    )}
                    <span>
                      {order.customer_info.billing_address.city},{" "}
                      {order.customer_info.billing_address.state} -{" "}
                      {order.customer_info.billing_address.pincode}
                    </span>
                  </>
                )
              ) : (
                <span className="italic">Billing address not provided.</span> // Fallback if null
              )}
            </p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              Shipping Address:
            </h3>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">
                {order.customer_info.first_name} {order.customer_info.last_name}
              </span>
              <br />
              <span className="font-semibold">
                {order.customer_info.country_code_for_phone_number}
                {order.customer_info.phone_number}
              </span>
              <br />
              {order.customer_info.delivery_address ? ( // ADDED NULL CHECK
                typeof order.customer_info.delivery_address === "string" ? (
                  <span className="whitespace-pre-line">
                    {order.customer_info.delivery_address}
                  </span>
                ) : (
                  <>
                    <span>{order.customer_info.delivery_address.street}</span>
                    <br />
                    {order.customer_info.delivery_address.landmark && (
                      <>
                        <span>
                          {order.customer_info.delivery_address.landmark}
                        </span>
                        <br />
                      </>
                    )}
                    <span>
                      {order.customer_info.delivery_address.city},{" "}
                      {order.customer_info.delivery_address.state} -{" "}
                      {order.customer_info.delivery_address.pincode}
                    </span>
                  </>
                )
              ) : (
                <span className="italic">Shipping address not provided.</span> // Fallback if null
              )}
            </p>
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
          Items: 📦
        </h3>
        <ul className="space-y-3 mb-4 border-b pb-3">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border p-2 rounded-md bg-gray-50"
              >
                {item.slug ? (
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </Link>
                ) : (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-grow">
                  {item.slug ? (
                    <Link
                      href={`/product/${item.slug}`}
                      className="cursor-pointer"
                    >
                      <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm">
                        {item.name}
                      </p>
                    </Link>
                  ) : (
                    <p className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </p>
                  )}
                  {item.variant_id && (
                    <p className="text-xs text-gray-600">SKU: {item.SKU}</p>
                  )}
                  <p className="text-xs text-gray-700">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    ₹{item.unit_price.toFixed(2)} each
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-900 mt-1 sm:mt-0 sm:ml-auto">
                  ₹{(item.quantity * item.unit_price).toFixed(2)}
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              No items found for this order.
            </p>
          )}
        </ul>
        <div className="text-right space-y-1">
          <div className="flex justify-between text-sm font-semibold text-gray-700">
            <span>Subtotal:</span>
            <span>₹{(order.order_info.sub_total ?? 0).toFixed(2)}</span>
          </div>

          {/* Abandent Discount */}
          {(order.order_info.abandentDiscountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-sm font-semibold text-gray-700">
              <span>Abandent Discount:</span>
              <span className="font-medium text-red-600">
                - ₹
                {(order.order_info.abandentDiscountAmount ?? 0).toFixed(2)}
              </span>
            </div>
          )}

          {/* Generic Discount if 'discount' field is used for total discount and no specific types are present */}
          {/* This condition ensures it doesn't duplicate if abandoned or coupon discount is already shown */}
          {(order.order_info.discount ?? 0) > 0 &&
            !(order.order_info.coupon_discount_amount ?? 0) && (
              <div className="flex justify-between text-sm font-semibold text-gray-700">
                <span>Discount:</span>
                <span className="font-medium text-red-600">
                  - ₹{(order.order_info.discount ?? 0).toFixed(2)}
                </span>
              </div>
            )}

          <div className="flex justify-between text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200">
            <span>Shipping Charges:</span>
            <span>₹{(order.order_info.shippingRate ?? 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm font-semibold text-gray-700 pb-2 border-b border-gray-200">
            <span>Tax ({order.order_info.applied_tax_rate ?? 0}%):</span>
            <span>₹{(order.order_info.tax_amount ?? 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-blue-700 border-t pt-2 mt-2">
            <span>Total Paid:</span>
            <span>₹{(order.order_info.final_total ?? 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-center space-y-2 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-2">
          <div className="flex flex-col items-center w-full sm:w-auto">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center justify-center hover:cursor-pointer text-[#213E5A] border border-[#213E5A] bg-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:-translate-y-1 hover:bg-[#213E5A] hover:text-white shadow-md w-full sm:w-auto"
              disabled={!order.order_info?.invoice_url}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Invoice
            </button>
            {!order.order_info?.invoice_url && (
              <p className="text-xs text-red-500 mt-1 sm:mt-0">
                Invoice not available yet.
              </p>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#213E5A] text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
