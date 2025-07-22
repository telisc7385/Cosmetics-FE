"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import {
  selectCartItems,
  clearCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "@/store/slices/cartSlice";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie-player";
import ShoppingCart from "@/public/ShoppingCart.json";
import { FiTrash2 } from "react-icons/fi";

interface CheckoutDataFromCart {
  subtotal: number;
  shippingRate: number;
  taxableAmount: number; // New: subtotal + shippingRate
  taxAmount: number; // New: tax calculated on taxableAmount
  taxPercentage: number;
  taxType: string; // New: tax type from CartPage
  total: number; // This 'total' is the final total from CartPage (after tax, before coupon)
  cartItems: CartItem[]; // Changed from any[] to CartItem[]
  // verifiedPincodeDetails: VerifiedPincodeDetails | null;
}

// (EmptyCartAnimation component is unchanged and good as is)
const EmptyCartAnimation = () => (
  <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
    <style jsx>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out forwards;
      }
    `}</style>
    <Lottie
      loop
      animationData={ShoppingCart}
      play
      style={{ width: 300, height: 300 }}
    />
    <p className="mt-6 text-xl font-semibold text-gray-700">
      Your cart is empty!
    </p>
    <p className="mt-2 text-gray-500">
      Looks like you haven&apos;t added anything to your cart yet.
    </p>
    <button
      onClick={() => (window.location.href = "/shop")}
      className="mt-6 px-6 py-3 bg-[#213E5A] text-white rounded-md shadow-lg hover:bg-[#1a324a] transition-all duration-300 transform hover:scale-105 cursor-pointer"
    >
      Start Shopping
    </button>
  </div>
);

const GuestCheckout = () => {
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    pincode: "",
    state: "",
    _city: "",
    addressLine: "",
    landmark: "",
    paymentMethod: "COD",
  });

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutDataFromCart | null>(
    null
  );

  console.log("checkoutData", checkoutData);

  const city = formData._city;
  const setCity = (value: string) =>
    setFormData((prev) => ({ ...prev, _city: value }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === "phone" && !/^\d*$/.test(e.target.value)) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCheckoutData = localStorage.getItem(
        "orderSummaryForCheckout"
      );
      if (storedCheckoutData) {
        const parsedData: CheckoutDataFromCart = JSON.parse(storedCheckoutData);
        setCheckoutData(parsedData);
      } else {
        toast.error("Cart data not found. Please go back to cart.");
        router.push("/cart"); // Redirect if no cart data
      }
    }
  }, [router]);

  const shippingRate = checkoutData?.shippingRate || 0;
  const taxableAmount = subtotal + shippingRate;
  const taxPercentage = checkoutData?.taxPercentage || 0;
  const taxAmount = taxableAmount * (taxPercentage / 100); // Calculation from CartPage
  const taxType = checkoutData?.taxType || "";
  const finalTotalAmount = taxableAmount + taxAmount;

  const handlePlaceOrder = async () => {
    // Input Validations
    if (!formData.email) return toast.error("Email is required.");
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine ||
      !city ||
      !formData.state ||
      !formData.pincode
    ) {
      return toast.error("Please fill all required address fields.");
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      return toast.error("Please enter a valid 10-digit phone number.");
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      return toast.error("Please enter a valid 6-digit pincode.");
    }
    if (cartItems.length === 0) {
      return toast.error("Your cart is empty.");
    }

    // Prepare payload
    const itemsForPayload = cartItems.map((item: CartItem) => ({
      quantity: item.quantity,
      price: item.sellingPrice,
      ...(item.variantId !== null && item.variantId !== undefined
        ? { variantId: item.variantId }
        : { productId: item.id }),
    }));

    const formattedBillingAddress = `${formData.addressLine}, ${formData.landmark ? formData.landmark + ", " : ""
      }${city}, ${formData.state} - ${formData.pincode}`;
    const formattedShippingAddress = `${formData.addressLine}, ${formData.landmark ? formData.landmark + ", " : ""
      }${city}, ${formData.state} - ${formData.pincode}`;

    const payload = {
      email: formData.email,
      address: {
        fullName: formData.fullName,
        phone: formData.phone,
        pincode: formData.pincode,
        state: formData.state,
        city: city,
        addressLine: formData.addressLine,
        landmark: formData.landmark,
      },
      billingAddress: formattedBillingAddress,
      shippingAddress: formattedShippingAddress,
      items: itemsForPayload,
      subtotal: subtotal,
      shippingRate: shippingRate,
      taxAmount: taxAmount,
      appliedTaxRate: taxPercentage,
      taxableAmount: taxableAmount,
      taxType: taxType,
      isTaxInclusive: true,
      totalAmount: parseFloat(finalTotalAmount.toFixed(2)),
      paymentMethod: formData.paymentMethod,
    };

    setIsPlacingOrder(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/guest/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Checkout failed.");

      const order = data.order;
      if (!order || !order.id) throw new Error("Order creation failed.");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastGuestOrder", JSON.stringify(order));
      }

      if (formData.paymentMethod.toLowerCase() === "razorpay") {
        const razorpayOrderId = order.razorpayOrderId;
        const internalOrderId = order.id;

        const loadScript = (src: string): Promise<boolean> => {
          return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const scriptLoaded = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );

        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay. Please try again.");
          setIsPlacingOrder(false);
          return;
        }

        const options = {
          key: "rzp_live_s1XxBl5X5Jx4lU", // Change to your actual key
          amount: Math.round(order.totalAmount * 100),
          currency: "INR",
          name: "consmo",
          description: "Thank you for your purchase",
          order_id: razorpayOrderId,
          prefill: {
            name: formData.fullName,
            email: formData.email,
          },
          handler: function () {
            dispatch(clearCart());
            toast.success("Payment successful!");
            router.replace(`/thank-you?orderId=${internalOrderId}`);
          },
          modal: {
            ondismiss: function () {
              toast.error("Payment cancelled.");
              setIsPlacingOrder(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // For COD
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        router.replace(`/thank-you?orderId=${order.id}`);
        setIsPlacingOrder(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
      setIsPlacingOrder(false);
    }
  };

  // (Conditional rendering for isPlacingOrder and cartItems.length === 0 are unchanged and correct)
  if (isPlacingOrder) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <Lottie
            loop
            animationData={ShoppingCart}
            play
            style={{ width: 150, height: 150 }}
          />
          <p className="mt-4 text-xl font-semibold text-gray-700">
            Placing your order, please wait...
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4 container mx-auto">
        {/*
          IMPORTANT: This 'EmptyCartAnimation' will be shown if the cart is empty
          when this component first renders, OR if the user navigates back to
          this page after the cart has been cleared by a successful order.

          To prevent showing 'Your cart is empty' after a successful order and redirect,
          the 'Thank You' page must load. The issue is likely that the "Thank You"
          page isn't configured to *use* the `orderId` or `lastGuestOrder` data
          you're passing/storing.
        */}
        <EmptyCartAnimation />
      </div>
    );
  }

  // (The rest of your JSX for GuestCheckout form and cart display is unchanged and good)
  return (
    <div
      className="font-sans flex flex-col lg:flex-row mt-20 rounded-lg container mx-auto my-auto"
      style={{ backgroundColor: "#F3F6F7" }}
    >
      <div className="w-full lg:w-3/5 bg-white p-6 md:p-8 lg:p-10 border-r border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Guest Checkout
        </h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 space-y-0">
          <input
            type="email"
            name="email"
            placeholder="Email *"
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name *"
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone *"
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
          />
          <input
            type="text"
            name="pincode" // Added pincode input
            placeholder="Pincode *"
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.pincode}
            onChange={handleChange}
            maxLength={6}
          />
          <input
            type="text"
            name="state"
            placeholder="State *"
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.state}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City *"
            required
            className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <textarea
            name="addressLine"
            placeholder="Address Line *"
            rows={2}
            required
            className="col-span-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.addressLine}
            onChange={handleChange}
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark (Optional)"
            className="col-span-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 bg-white text-sm"
            value={formData.landmark}
            onChange={handleChange}
          />
          <div className="col-span-full mt-3">
            <label className="block text-gray-700 text-xs font-medium mb-1">
              Select Payment Method:
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-700 bg-white text-sm"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Razorpay">Pay Online (Razorpay)</option>
            </select>
          </div>
          {/* Place Order button for large screens (desktop) */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="col-span-full mt-5 text-white font-bold py-3 rounded bg-[#213E5A] hover:bg-[#1A334B] text-lg flex items-center justify-center gap-2 hidden lg:flex"
          >
            {isPlacingOrder ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.536-3.536A9 9 0 1021 12h-2a7 7 0 11-7-7v4z"
                  ></path>
                </svg>
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </form>
      </div>

      <div className="w-full lg:w-2/5 bg-white p-2 md:p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Your Order
        </h2>

        <ul className="space-y-2">
          {cartItems.map((item: CartItem) => (
            <li
              key={item.cartItemId}
              className="bg-white rounded-lg p-2 sm:p-6 lg:py-3 lg:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 shadow-sm mb-4 relative"
            >
              {/* Common Left Section (Image and main text container) */}
              <div className="flex items-start sm:items-center w-full sm:w-auto mb-1 sm:mb-0">
                {item.slug ? (
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex-shrink-0 mr-4 sm:mr-6 flex flex-col items-center"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md cursor-pointer sm:w-28 sm:h-28"
                    />
                    {/* Stock under image for mobile/tablet/laptop */}
                    <p className="text-xs text-gray-500 mt-1">
                      Stock: {item.stock}
                    </p>
                  </Link>
                ) : (
                  <div className="mr-4 sm:mr-6 flex-shrink-0 flex flex-col items-center">
                    {" "}
                    {/* Reduced font size here */}
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md sm:w-28 sm:h-28"
                    />
                    {/* Stock under image for mobile/tablet/laptop */}
                    <p className="text-xs text-gray-500 mt-1">
                      Stock: {item.stock}
                    </p>
                  </div>
                )}

                {/* Mobile View Specific Layout - visible only on 'sm' breakpoint and below */}
                <div className="flex flex-col justify-between h-full w-full sm:hidden">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      {item.slug ? (
                        <Link href={`/product/${item.slug}`} className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                          {item.name}
                        </h3>
                      )}
                    </div>

                    {/* Price with quantity and total aligned in one row */}
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-700">
                        Price: ₹{item.sellingPrice.toFixed(2)} / item{" "}
                        <span className="text-xs text-gray-500">
                          x {item.quantity}
                        </span>
                      </p>
                      <p className="text-xs text-gray-900 whitespace-nowrap font-semibold">
                        ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full mt-3">
                    <div className="flex items-center space-x-1 border border-gray-300 rounded-md py-0.5 px-1">
                      <button
                        onClick={() =>
                          item.quantity < item.stock &&
                          dispatch(incrementQuantity(item.cartItemId))
                        }
                        disabled={item.quantity >= item.stock}
                        className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                      >
                        -
                      </button>
                      <span className="font-medium text-sm w-4 text-center text-[#213E5A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          item.quantity > 1 &&
                          dispatch(decrementQuantity(item.cartItemId))
                        }
                        disabled={item.quantity <= 1}
                        className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.cartItemId))}
                      className="text-red-500 hover:text-red-700 font-medium p-1 rounded-full transition-colors cursor-pointer"
                      aria-label={`Remove ${item.name}`}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tablet/Laptop View Specific Layout for Title, Stock, and Quantity - hidden on 'sm' breakpoint and below */}
                <div className="hidden sm:flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      {item.slug ? (
                        <Link href={`/product/${item.slug}`} className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                          {item.name}
                        </h3>
                      )}
                    </div>

                    {/* Price per item with x{quantity} */}
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ₹{item.sellingPrice.toFixed(2)} / item{" "}
                      <span className="text-sm text-gray-500">
                        x {item.quantity}
                      </span>
                    </p>

                    {item.variantId && (
                      <p className="text-xs text-gray-400">
                        {/* Variant ID: {item.variantId} */}
                      </p>
                    )}

                    {/* Increment/Decrement for Tablet/Laptop */}
                    <div className="w-20 flex items-center border border-gray-300 rounded-md py-0.5 mt-2">
                      <button
                        onClick={() =>
                          item.quantity > 1 &&
                          dispatch(decrementQuantity(item.cartItemId))
                        }
                        disabled={item.quantity <= 1}
                        className="w-7 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-base"
                      >
                        -
                      </button>
                      <span className="font-medium text-base w-6 text-center text-[#213E5A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          item.quantity < item.stock &&
                          dispatch(incrementQuantity(item.cartItemId))
                        }
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet/Laptop View: Trash icon and Price - positioned to the right */}
              <div className="hidden sm:flex flex-col items-end gap-4">
                {/* Trash button for larger screens (sm and up) - absolute positioning */}
                <button
                  onClick={() => dispatch(removeFromCart(item.cartItemId))}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-medium p-1 rounded-full transition-colors cursor-pointer"
                  aria-label={`Remove ${item.name}`}
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>

                <div className="text-lg font-semibold text-gray-900 w-20 text-right mt-auto">
                  ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Back to Shop Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/shop")} // Use router.push for navigation
            className="bg-[#213E5A] hover:bg-[#1a3249] text-white font-semibold py-2 px-6 rounded-md shadow-lg transition duration-300 transform hover:scale-105"
          >
            Back to Shop
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-3 rounded-lg shadow-md mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between pb-2">
              <span className="text-gray-700 font-semibold">Subtotal:</span>
              <span className="font-medium text-gray-900">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">Shipping Charges</span>
              <span className="font-medium text-gray-900">
                ₹{shippingRate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-gray-700 font-semibold">
                Taxable Amount
              </span>
              <span className="font-semibold text-gray-900">
                ₹{taxableAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">
                Tax ({taxPercentage}%)
              </span>
              <span className="font-medium text-gray-900">
                ₹{taxAmount.toFixed(2)}
              </span>
            </div>
            {/* Display Total before discount */}
            {/* <div className="flex justify-between pb-2">
              <span className="text-gray-700 font-semibold">
                Total (before discount)
              </span>
              <span className="font-semibold text-gray-900">
                ₹{(taxableAmount + taxAmount).toFixed(2)}
              </span>
            </div> */}

            <div className="flex justify-between pt-4 border-t-2 border-gray-300">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{finalTotalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Place Order button for mobile view - visible on small screens, hidden on large screens */}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isPlacingOrder}
        className="block lg:hidden w-full mt-5 text-white font-bold py-3 rounded bg-[#213E5A] hover:bg-[#1A334B] text-lg flex items-center justify-center gap-2"
      >
        {isPlacingOrder ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3.536-3.536A9 9 0 1021 12h-2a7 7 0 11-7-7v4z"
              ></path>
            </svg>
            Placing Order...
          </>
        ) : (
          "Place Order"
        )}
      </button>
    </div>
  );
};

export default GuestCheckout;
