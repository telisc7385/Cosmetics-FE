// src/app/cart/page.tsx (or pages/cart.tsx)
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import Image from "next/image";
import Link from "next/link";
import {
  selectCartItems as selectGuestCartItems,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart as clearGuestCart,
} from "@/store/slices/cartSlice";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { CartItem } from "@/types/cart";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import Lottie from "react-lottie-player";
import emptyCartAnimationData from "@/public/cart.json";
import PincodeVerifier from "@/components/Checkout/PincodeVerifier";
import AuthPromptModal from "@/components/Checkout/AuthPromptModal";

// Define a type for the order summary data
interface OrderSummaryApiResponse {
  taxType: string;
  taxPercentage: number;
  taxDetails: Array<{
    name: string;
    percentage: number;
  }>;
  shippingRate: number;
  isTaxInclusive: boolean;
}

// Define a type for verified pincode details, including order summary parts
interface VerifiedPincodeDetails {
  pincode: string;
  city: string;
  state: string;
  shippingRate?: number; // Optional, as it comes from order summary
  taxPercentage?: number; // Optional, as it comes from order summary
  taxType?: string; // Optional, as it comes from order summary
}

// Define a type for the data passed from CartPage to Checkout
interface CheckoutDataFromCart {
  subtotal: number; // This will now be the final calculated subtotal (after discount)
  shippingRate: number;
  taxableAmount: number;
  taxAmount: number;
  taxPercentage: number;
  taxType: string;
  total: number;
  abandonedDiscountApplied: number; // To pass the applied discount to checkout
  verifiedPincodeDetails: VerifiedPincodeDetails | null;
  cartItems: CartItem[]; // Pass cart items to UserCheckout if needed
}

const EmptyCartAnimation = () => (
  <div className="flex flex-col items-center justify-center py-10 bg-white rounded-lg shadow-md animate-fadeIn">
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
      animationData={emptyCartAnimationData}
      play
      style={{ width: 300, height: 300 }}
    />
    <p className="mt-6 text-xl font-semibold text-gray-700">
      Your cart is empty!
    </p>
    <p className="mt-2 text-gray-500 w-72 text-center md:w-full">
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

const CartPage = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const guestCartItems = useAppSelector(selectGuestCartItems);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    items: loggedInCartItems,
    loading: loggedInLoading,
    error: loggedInError,
    incrementItemQuantity: incrementLoggedInItem,
    decrementItemQuantity: decrementLoggedInItem,
    removeCartItem: removeLoggedInItem,
    clearCart: clearLoggedInCart,
    abandonedDiscount, // This is the discount value from the provider
  } = useLoggedInCart();

  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [orderSummaryData, setOrderSummaryData] =
    useState<OrderSummaryApiResponse | null>(null);
  const [verifiedPincodeDetails, setVerifiedPincodeDetails] =
    useState<VerifiedPincodeDetails | null>(null);

  const items = isLoggedIn ? loggedInCartItems : guestCartItems;
  const loading = isLoggedIn ? loggedInLoading : false;
  const error = isLoggedIn ? loggedInError : null;

  // Effect to load initial pincode details and order summary data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPincode = localStorage.getItem("verifiedPincode");
      const storedCity = localStorage.getItem("verifiedCity");
      const storedState = localStorage.getItem("verifiedState");
      const storedShipping = localStorage.getItem("verifiedShipping");
      const storedTax = localStorage.getItem("verifiedTax");
      const storedTaxType = localStorage.getItem("verifiedTaxType");

      if (storedPincode && storedCity && storedState) {
        const pincodeData: VerifiedPincodeDetails = {
          pincode: storedPincode,
          city: storedCity,
          state: storedState,
          shippingRate: storedShipping ? Number(storedShipping) : undefined,
          taxPercentage: storedTax ? Number(storedTax) : undefined,
          taxType: storedTaxType || undefined,
        };
        setVerifiedPincodeDetails(pincodeData);
        setPincodeVerified(true);

        // Populate orderSummaryData from localStorage
        if (
          pincodeData.shippingRate !== undefined &&
          pincodeData.taxPercentage !== undefined
        ) {
          setOrderSummaryData({
            taxType: pincodeData.taxType || "N/A",
            taxPercentage: pincodeData.taxPercentage,
            taxDetails: [], // This might need to be retrieved if backend provides full details
            shippingRate: pincodeData.shippingRate,
            isTaxInclusive: false, // Assuming false for now based on previous context
          });
        }
      }
    }
  }, []); // Runs only once on mount

  // Memoize handlePincodeVerified to ensure its reference is stable
  const handlePincodeVerified = useCallback((data: VerifiedPincodeDetails) => {
    setPincodeVerified(true);
    setVerifiedPincodeDetails(data);

    // Directly set order summary data from the verified data
    if (data.shippingRate !== undefined && data.taxPercentage !== undefined) {
      setOrderSummaryData({
        taxType: data.taxType || "N/A",
        taxPercentage: data.taxPercentage,
        taxDetails: [], // Initialize or fetch if needed
        shippingRate: data.shippingRate,
        isTaxInclusive: false, // Assuming false
      });
      // toast.success(
      //   `Delivery available in ${data.city}, ${data.state}. Order summary updated!`
      // );
    } else {
      setOrderSummaryData(null);
      toast.error("Pincode verified, but order summary details are missing.");
    }
  }, []); // Dependencies are empty as it only uses its input 'data'

  const handleIncrement = (cartItemId: number) => {
    if (isLoggedIn) {
      incrementLoggedInItem(cartItemId);
    } else {
      dispatch(incrementQuantity(cartItemId));
    }
  };

  const handleDecrement = (cartItemId: number) => {
    if (isLoggedIn) {
      decrementLoggedInItem(cartItemId);
    } else {
      dispatch(decrementQuantity(cartItemId));
    }
  };

  const handleRemove = async (cartItemId: number) => {
    const itemToRemove = items.find((item) => item.cartItemId === cartItemId);
    if (!itemToRemove) return;

    if (isLoggedIn) {
      try {
        await removeLoggedInItem(cartItemId);
      } catch (err: unknown) {
        console.error("Failed to remove item from cart:", err);
        toast.error(`Failed to remove ${itemToRemove.name}. Please try again.`);
      }
    } else {
      dispatch(removeFromCart(cartItemId));
      toast.error(`${itemToRemove.name} removed from cart.`);
    }
  };

  const handleClearCart = () => {
    if (isLoggedIn) {
      clearLoggedInCart();
    } else {
      dispatch(clearGuestCart());
    }
    // Also clear order summary and pincode if cart is cleared
    setOrderSummaryData(null);
    setVerifiedPincodeDetails(null);
    setPincodeVerified(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("verifiedPincode");
      localStorage.removeItem("verifiedCity");
      localStorage.removeItem("verifiedState");
      localStorage.removeItem("verifiedShipping");
      localStorage.removeItem("verifiedTax");
      localStorage.removeItem("verifiedTaxType");
      localStorage.removeItem("orderSummaryForCheckout"); // Clear any stored summary for checkout
    }
  };

  // Calculate the base subtotal (sum of item prices * quantities)
  const baseSubtotal = items.reduce(
    (total: number, item: CartItem) =>
      total + item.sellingPrice * item.quantity,
    0
  );

  // Determine the final subtotal after applying the abandoned discount if logged in
  const finalSubtotal =
    isLoggedIn && abandonedDiscount > 0
      ? baseSubtotal - abandonedDiscount
      : baseSubtotal;

  const shippingRate = orderSummaryData?.shippingRate || 0;
  const taxableAmount = finalSubtotal + shippingRate; // Tax applied after discount
  const taxPercentage = orderSummaryData?.taxPercentage || 0;
  const taxAmount = taxableAmount * (taxPercentage / 100);
  const total = taxableAmount + taxAmount;
  const taxType = orderSummaryData?.taxType || "N/A";

  const handleCheckoutClick = () => {
    if (!pincodeVerified) {
      toast.error("Please verify your pincode first.");
      return;
    }

    if (!orderSummaryData) {
      toast.error(
        "Order summary not available. Please try verifying pincode again."
      );
      return;
    }

    // Prepare data to pass to checkout page
    const checkoutData: CheckoutDataFromCart = {
      subtotal: finalSubtotal, // Pass the final calculated subtotal (after discount)
      shippingRate,
      taxableAmount,
      taxAmount,
      taxPercentage,
      taxType,
      total,
      abandonedDiscountApplied: isLoggedIn ? abandonedDiscount : 0, // Pass the discount amount
      verifiedPincodeDetails,
      cartItems: items, // Pass cart items too if UserCheckout needs them
    };

    // Store data in localStorage for the UserCheckout page to retrieve
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "orderSummaryForCheckout",
        JSON.stringify(checkoutData)
      );
    }

    if (isLoggedIn) {
      router.push("/checkout");
    } else {
      setShowAuthPrompt(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowAuthPrompt(false);
    router.push("/checkout");
  };

  if (loading && items.length === 0)
    return <div className="text-center py-10">Loading your cart...</div>;

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        Error loading cart: {error}
      </div>
    );

  if (items.length === 0 && !loading) return <EmptyCartAnimation />;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-[#F3F6F7]">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-3/5">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white rounded-lg p-2 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 shadow-sm mb-4 relative"
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
                    {item.slug ? (
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                    )}
                    {/* Selling price specifically for mobile view */}
                    <p className="text-xs text-gray-700 mt-1">
                      Price: ₹{item.sellingPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-900 mt-1">
                      Total: ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between w-full mt-3">
                    <div className="flex items-center space-x-1 border border-gray-300 rounded-md py-0.5 px-1">
                      <button
                        onClick={() => handleDecrement(item.cartItemId)}
                        className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                      >
                        -
                      </button>
                      <span className="font-medium text-sm w-4 text-center text-[#213E5A]">
                        {" "}
                        {/* Reduced font size here */}
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.cartItemId)}
                        className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.cartItemId)}
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
                    {item.slug ? (
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                    )}
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ₹{item.sellingPrice.toFixed(2)} / item
                    </p>
                    {item.variantId && (
                      <p className="text-xs text-gray-400">
                        {/* Variant ID: {item.variantId} */}
                      </p>
                    )}
                    {/* Increment/Decrement for Tablet/Laptop - adjusted size */}
                    <div className="w-20 flex items-center border border-gray-300 rounded-md py-0.5 mt-2">
                      {" "}
                      {/* Reduced width (w-20) and vertical padding (py-0.5) */}
                      <button
                        onClick={() => handleDecrement(item.cartItemId)}
                        className="w-7 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-base"
                      >
                        -
                      </button>
                      <span className="font-medium text-base w-6 text-center text-[#213E5A]">
                        {" "}
                        {/* Reduced font size (text-base) */}
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.cartItemId)}
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
                  onClick={() => handleRemove(item.cartItemId)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-medium p-1 rounded-full transition-colors cursor-pointer"
                  aria-label={`Remove ${item.name}`}
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>

                <div className="text-lg font-semibold text-gray-900 w-20 text-right mt-auto">
                  ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-2/5 bg-white rounded-lg p-6 shadow-md border border-gray-200 self-start">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearCart}
              className="text-[#007BFF] hover:text-[#0056B3] text-sm font-semibold cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="mb-4">
            <PincodeVerifier
              onVerified={handlePincodeVerified} // This prop is now a stable reference
            />
            {/* {verifiedPincodeDetails && (
              <div className="mt-2 text-sm text-gray-600">
                Delivery to:{" "}
                <span className="font-semibold">
                  {verifiedPincodeDetails.pincode},{" "}
                  {verifiedPincodeDetails.city}, {verifiedPincodeDetails.state}
                </span>
              </div>
            )} */}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between pb-2">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹{baseSubtotal.toFixed(2)} {/* Display original subtotal */}
              </span>
            </div>

            {/* Display the abandoned discount if applied */}
            {isLoggedIn && abandonedDiscount > 0 && (
              <div className="flex justify-between pb-2 text-green-600">
                <span className="text-gray-700 text-sm">Discount Applied</span>
                <span className="font-medium text-green-600 text-sm">
                  - ₹{abandonedDiscount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Display the discounted subtotal if a discount was applied */}
            {isLoggedIn && abandonedDiscount > 0 && (
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-700 font-semibold">
                  Subtotal (after discount)
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{finalSubtotal.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">Shipping Rate</span>
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
                {taxType} Tax ({taxPercentage}%)
              </span>
              <span className="font-medium text-gray-900">
                ₹{taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t-2 border-gray-300">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className={`w-full py-3 mt-6 text-white font-semibold rounded-md transition-colors ${
              pincodeVerified && items.length > 0 && orderSummaryData
                ? "bg-[#1A324A] hover:bg-[#142636] cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={
              !pincodeVerified || items.length === 0 || !orderSummaryData
            }
          >
            Checkout
          </button>

          <button
            onClick={() => router.push("/shop")}
            className="w-full py-3 mt-4 bg-white text-[#1A324A] border border-[#1A324A] font-semibold rounded-md hover:bg-[#f9f9f9] transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      {showAuthPrompt && (
        <AuthPromptModal
          onClose={() => setShowAuthPrompt(false)}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
    </div>
  );
};

export default CartPage;
