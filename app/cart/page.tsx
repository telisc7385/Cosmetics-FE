"use client";

import React, { useState, useEffect } from "react";
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
  } = useLoggedInCart();

  const [pincodeVerified, setPincodeVerified] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Use useEffect to check localStorage on initial load
  useEffect(() => {
    if (localStorage.getItem("verifiedPincode")) {
      setPincodeVerified(true);
    }
  }, []);

  const items = isLoggedIn ? loggedInCartItems : guestCartItems;
  const loading = isLoggedIn ? loggedInLoading : false;
  const error = isLoggedIn ? loggedInError : null;

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
        // toast.error(`${itemToRemove.name} removed from cart.`); // Consider if you want this toast here, as the cart updates
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
    // toast.success("All items removed from cart.");
  };

  // --- New Checkout Logic ---
  const handleCheckoutClick = () => {
    if (!pincodeVerified) {
      toast.error("Please verify your pincode first.");
      return;
    }

    if (isLoggedIn) {
      router.push("/checkout"); // Directly go to UserCheckout if logged in
    } else {
      setShowAuthPrompt(true); // Show the pop-up if not logged in
    }
  };

  const handleContinueAsGuest = () => {
    setShowAuthPrompt(false); // Close the pop-up
    router.push("/checkout"); // Redirect to GuestCheckout (handled by CheckoutPage.tsx)
  };

  const subtotal = items.reduce(
    (total: number, item: CartItem) =>
      total + item.sellingPrice * item.quantity,
    0
  );
  const tax = 0; // Assuming tax is 0 as per your current code
  const total = subtotal + tax;

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
      {/* Reduced from text-2xl to text-xl */}
      <h1 className="text-xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        {/* Changed lg:w-2/3 to lg:w-3/5 to make the cart items section narrower on laptops */}
        <div className="w-full lg:w-3/5">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 shadow-sm mb-4 relative" // Added relative for positioning trash icon
            >
              <div className="flex items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
                {/* Link for Image */}
                {/* Image is clickable if item.slug exists */}
                {item.slug ? (
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex-shrink-0 mr-6"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="w-28 h-28 object-cover rounded-md cursor-pointer"
                    />
                  </Link>
                ) : (
                  // Renders Image without Link if slug is missing
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={112}
                    height={112}
                    className="w-28 h-28 object-cover rounded-md mr-6 flex-shrink-0"
                  />
                )}
                <div className="flex flex-col justify-between h-full">
                  <div>
                    {/* Link for Product Name */}
                    {/* Product name is clickable if item.slug exists */}
                    {item.slug ? (
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>
                    ) : (
                      // Renders H3 without Link if slug is missing
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {item.name}
                      </h3>
                    )}
                    {/* Display Stock instead of Brand Name */}
                    <p className="text-sm text-gray-500 mt-0.5">
                      Stock: {item.stock}
                    </p>
                    {item.variantId && (
                      <p className="text-xs text-gray-400">
                        {/* Variant ID: {item.variantId} */}
                      </p>
                    )}
                  </div>
                  {/* Trash button moved outside this div */}
                </div>
              </div>

              {/* Trash button moved to top-right and removed hover bg */}
              <button
                onClick={() => handleRemove(item.cartItemId)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-medium p-1 rounded-full transition-colors cursor-pointer" // Removed hover:bg-red-50
                aria-label={`Remove ${item.name}`}
              >
                <FiTrash2 className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-end sm:items-center gap-4 sm:flex-row w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center space-x-2 border border-gray-300 rounded-md py-1 px-2">
                  <button
                    onClick={() => handleDecrement(item.cartItemId)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-medium text-lg w-6 text-center text-[#213E5A]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.cartItemId)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="text-lg font-semibold text-gray-900 w-20 text-right sm:text-left">
                  ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        {/* Adjusted lg:w-1/3 to lg:w-2/5 to give it more relative space */}
        <div className="w-full lg:w-2/5 bg-white rounded-lg p-6 shadow-md border border-gray-200 self-start">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearCart}
              className="text-[#007BFF] hover:text-[#0056B3] text-sm font-semibold cursor-pointer"
            >
              Clear all
            </button>
          </div>

          {/* Reduced from text-xl to text-lg */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="mb-4">
            <PincodeVerifier
              onVerified={(data) => {
                // This callback is triggered when PincodeVerifier successfully verifies
                // or when it loads a previously verified pincode from localStorage
                setPincodeVerified(!!data.pincode); // Set true if pincode exists, false otherwise (e.g., if cleared)
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-gray-700">Tax</span>
              <span className="font-medium text-gray-900">
                ₹{tax.toFixed(2)}
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
              pincodeVerified
                ? "bg-[#1A324A] hover:bg-[#142636] cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!pincodeVerified}
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
