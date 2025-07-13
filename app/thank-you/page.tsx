"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation"; // Import useRouter
import toast from "react-hot-toast";
import { apiCore } from "@/api/ApiCore";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import Image from "next/image";

interface CustomerInfo {
  first_name: string;
  last_name: string;
  country_code_for_phone_number: string | null;
  phone_number: string;
  email: string;
  billing_address: string;
  delivery_address: string;
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

interface DetailedOrder {
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
  const router = useRouter(); // Initialize useRouter
  const orderId = searchParams.get("orderId");
  const token = useAppSelector(selectToken);

  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing. Cannot display order details.");
        setLoading(false);
        // If orderId is missing, it's a good place to replace history to home
        router.replace("/");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const responseData = await apiCore<OrderListApiResponse>(
          `/order/detail/${orderId}`,
          "GET",
          undefined,
          token
        );

        if (responseData.results && responseData.results.length > 0) {
          const fetchedOrder = responseData.results[0];
          setOrder(fetchedOrder);
          setShowCelebration(true); // Trigger confetti
          // Successfully fetched order, now replace the history state
          router.replace(`/thank-you?orderId=${orderId}`); // Replace with current URL to ensure back goes to home
        } else {
          setError("Order not found or no results returned for this ID.");
          toast.error("Order not found.");
          router.replace("/"); // If order not found, go to home
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";

        console.error("Failed to fetch order details:", errorMessage);

        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Unauthorized")
        ) {
          setError(
            "You are not authorized to view this order. Please log in if you are the owner."
          );
          toast.error("Unauthorized access.");
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
        router.replace("/"); // On any error, redirect to home
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token, router]); // Add router to dependency array

  const handleDownloadInvoice = () => {
    if (order?.order_info.invoice_url) {
      let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) {
        baseUrl = "https://cosmaticadmin.twilightparadox.com";
      }
      if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }
      const invoiceRelativePath = order.order_info.invoice_url.startsWith("/")
        ? order.order_info.invoice_url
        : `/${order.order_info.invoice_url}`;

      const invoiceFullUrl = `${baseUrl}${invoiceRelativePath}`;
      window.open(invoiceFullUrl, "_blank");
      toast.success("Downloading invoice...");
    } else {
      toast.error("Invoice URL not available.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-base text-gray-600">
          Loading order details for your purchase...
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
      </div>
    );
  }

  if (!order) {
    // This case should ideally be caught by the error state and router.replace('/')
    // but kept for robustness. If order is null and no error, it's an unexpected state.
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
          background-color: #f0f;
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

      <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg shadow-md mb-4 text-center sm:p-5">
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
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Thank You!</h1>
        <p className="text-base sm:text-lg">
          Your order has been placed successfully.
        </p>
        <p className="text-sm mt-1">
          Order ID: <span className="font-semibold">{order.id}</span>
        </p>
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
                {order.customer_info.phone_number}
              </span>
              <br />
              <span className="whitespace-pre-line">
                {order.customer_info.billing_address}
              </span>
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
                {order.customer_info.phone_number}
              </span>
              <br />
              <span className="whitespace-pre-line">
                {order.customer_info.delivery_address}
              </span>
            </p>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
          Items:
        </h3>
        <ul className="space-y-3 mb-4 border-b pb-3">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border p-2 rounded-md bg-gray-50"
              >
                {/* Link for Image - Added cursor-pointer class */}
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
                  {/* Link for Product Name - Added cursor-pointer class */}
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
            <span>₹{order.order_info.sub_total.toFixed(2)}</span>
          </div>
          {order.order_info.discount > 0 && (
            <div className="flex justify-between text-sm font-semibold text-gray-700">
              <span>
                Discount ({order.order_info.discount_coupon_code || "Applied"}):
              </span>
              <span className="text-red-600">
                -₹{order.order_info.discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold text-blue-700 border-t pt-2 mt-2">
            <span>Total Paid:</span>
            <span>₹{order.order_info.final_total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center space-y-2 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-2">
          <div className="flex flex-col items-center w-full sm:w-auto">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center justify-center hover:cursor-pointer text-[#213E5A] border border-[#213E5A] bg-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 transform hover:-translate-y-1 hover:bg-[#213E5A] hover:text-white shadow-md w-full sm:w-auto"
              disabled={!order.order_info.invoice_url}
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
            {!order.order_info.invoice_url && (
              <p className="text-xs text-red-500 mt-1 sm:mt-0">
                Invoice not available.
              </p>
            )}
          </div>
          {/* <Link
            href="/shop"
            className="block bg-[#213E5A] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-transform duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center"
          >
            Continue Shopping
          </Link> */}
          <Link
            href="/"
            className="block bg-[#213E5A] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-transform duration-300 transform hover:-translate-y-1 w-full sm:w-auto text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
