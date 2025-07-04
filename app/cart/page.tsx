// app/cart/page.tsx
"use client";

import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import Image from "next/image";
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
import { apiCore } from "@/api/ApiCore"; // Assuming apiCore is available for checkout API calls
import { selectToken } from "@/store/slices/authSlice"; // To get token for checkout API
import toast from "react-hot-toast"; // <--- Import toast
import { FiTrash2 } from "react-icons/fi"; // <--- Import trash icon

// Import Lottie player and the animation JSON
import Lottie from "react-lottie-player";
import emptyCartAnimationData from "@/public/cart.json"; // Assuming your Lottie JSON is here

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
      style={{ width: 300, height: 300 }} // Increased size from 200x200 to 300x300
    />
    <p className="mt-6 text-xl font-semibold text-gray-700">
      Your cart is empty!
    </p>
    <p className="mt-2 text-gray-500">
      Looks like you haven't added anything to your cart yet.
    </p>
    <button
      onClick={() => (window.location.href = "/shop")} // Assuming a /products page
      className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-md shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:cursor-pointer"
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
  const token = useAppSelector(selectToken); // Get token for API calls

  const {
    items: loggedInCartItems,
    loading: loggedInLoading,
    error: loggedInError,
    incrementItemQuantity: incrementLoggedInItem,
    decrementItemQuantity: decrementLoggedInItem,
    removeCartItem: removeLoggedInItem,
    clearCart: clearLoggedInCart,
  } = useLoggedInCart();

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
    if (!itemToRemove) return; // Should not happen

    if (isLoggedIn) {
      try {
        await removeLoggedInItem(cartItemId); // Await the removal
        toast.error(`${itemToRemove.name} removed from cart.`); // <--- Changed to toast.error for logged-in user
      } catch (err) {
        console.error("Failed to remove item from logged-in cart:", err);
        toast.error(`Failed to remove ${itemToRemove.name}. Please try again.`);
      }
    } else {
      dispatch(removeFromCart(cartItemId));
      toast.error(`${itemToRemove.name} removed from cart.`); // <--- Changed to toast.error for guest user
    }
  };

  const handleClearCart = () => {
    if (isLoggedIn) {
      clearLoggedInCart();
    } else {
      dispatch(clearGuestCart());
    }
    toast.success("All items removed from cart."); // Optional: Add toast for clear all
  };

  const prepareCartForCheckoutAPI = () => {
    return items.map((item) => {
      const payloadItem: {
        productId?: number;
        variantId?: number | null;
        quantity: number;
      } = {
        quantity: item.quantity,
      };

      if (item.variantId !== null && item.variantId !== undefined) {
        payloadItem.variantId = item.variantId;
      } else {
        payloadItem.productId = item.id;
      }
      return payloadItem;
    });
  };

  const handleCheckout = async () => {
    const checkoutPayload = prepareCartForCheckoutAPI();
    console.log("Checkout Payload for API:", checkoutPayload);

    try {
      // Example: If your checkout API expects the cart items in this format
      // const response = await apiCore('/checkout-api-endpoint', 'POST', { items: checkoutPayload }, isLoggedIn ? token : undefined);
      // console.log("Checkout API Response:", response);
      alert("Simulating checkout. Check console for payload.");
      // Handle success (e.g., redirect to order confirmation)
    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert(`Checkout failed: ${err.message || "Unknown error"}`);
      // Handle error (e.g., show error message to user)
    }
  };

  const subtotal = items.reduce(
    (total: number, item: CartItem) =>
      total + item.sellingPrice * item.quantity,
    0
  );
  const shipping = 5;
  const tax = 0;
  const total = subtotal + shipping + tax;

  if (loading && items.length === 0) {
    return <div className="text-center py-10">Loading your cart...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        Error loading cart: {error}
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return <EmptyCartAnimation />; // Display the animated empty cart
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Cart Items */}
        <div className="w-full lg:w-2/3">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-white rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 shadow-sm mb-4"
            >
              <div className="flex items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={112} // Same as Tailwind's w-28
                  height={112} // Same as Tailwind's h-28
                  className="w-28 h-28 object-cover rounded-md mr-6 flex-shrink-0"
                />
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Brand: Sephora Collection
                    </p>
                    {item.variantId && ( // Display variant ID if available
                      <p className="text-xs text-gray-400">
                        Variant ID: {item.variantId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.cartItemId)}
                    className="text-red-500 hover:text-red-700 font-medium mt-3 text-left p-1 rounded-full hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${item.name}`} // Good for accessibility
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quantity Selector and Price */}
              <div className="flex flex-col items-end sm:items-center gap-4 sm:flex-row w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center space-x-2 border border-gray-300 rounded-md py-1 px-2">
                  <button
                    onClick={() => handleDecrement(item.cartItemId)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm"
                    // Removed disabled={item.quantity <= 1} to allow deletion on decrement from 1
                  >
                    -
                  </button>
                  <span className="font-medium text-lg w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrement(item.cartItemId)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm"
                  >
                    +
                  </button>
                </div>
                <div className="text-lg font-semibold text-gray-900 w-20 text-right sm:text-left">
                  {/* Display total price for this item */}₹
                  {(item.sellingPrice * item.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg p-6 shadow-md border border-gray-200 self-start">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearCart}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">Shipping</span>
              <span className="font-medium text-gray-900">
                ₹{shipping.toFixed(2)}
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
            onClick={() => router.push("/checkout")}
            className="w-full py-3 mt-6 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors"
          >
            Checkout
          </button>
          <button className="w-full py-3 mt-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
            Continue Shopping
          </button>

          <div className="flex justify-center mt-6 space-x-3">
            <Image
              src="/icons/visa.svg"
              alt="Visa"
              width={40}
              height={24}
              className="h-6"
            />
            <Image
              src="/icons/mastercard.svg"
              alt="Mastercard"
              width={40}
              height={24}
              className="h-6"
            />
            <Image
              src="/icons/amex.svg"
              alt="American Express"
              width={40}
              height={24}
              className="h-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
