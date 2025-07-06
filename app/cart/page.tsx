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
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import Lottie from "react-lottie-player";
import emptyCartAnimationData from "@/public/cart.json";

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

  const items = isLoggedIn ? loggedInCartItems : guestCartItems;
  const loading = isLoggedIn ? loggedInLoading : false;
  const error = isLoggedIn ? loggedInError : null;

  const handleIncrement = (cartItemId: number) => {
    isLoggedIn
      ? incrementLoggedInItem(cartItemId)
      : dispatch(incrementQuantity(cartItemId));
  };

  const handleDecrement = (cartItemId: number) => {
    isLoggedIn
      ? decrementLoggedInItem(cartItemId)
      : dispatch(decrementQuantity(cartItemId));
  };

  const handleRemove = async (cartItemId: number) => {
    const itemToRemove = items.find((item) => item.cartItemId === cartItemId);
    if (!itemToRemove) return;

    if (isLoggedIn) {
      try {
        await removeLoggedInItem(cartItemId);
        toast.error(`${itemToRemove.name} removed from cart.`);
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
    isLoggedIn ? clearLoggedInCart() : dispatch(clearGuestCart());
    toast.success("All items removed from cart.");
  };

  const subtotal = items.reduce(
    (total: number, item: CartItem) =>
      total + item.sellingPrice * item.quantity,
    0
  );
  const tax = 0;
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
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
                  width={112}
                  height={112}
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
                    {item.variantId && (
                      <p className="text-xs text-gray-400">
                        Variant ID: {item.variantId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.cartItemId)}
                    className="text-red-500 hover:text-red-700 font-medium mt-3 text-left p-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                    aria-label={`Remove ${item.name}`}
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end sm:items-center gap-4 sm:flex-row w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center space-x-2 border border-gray-300 rounded-md py-1 px-2">
                  <button
                    onClick={() => handleDecrement(item.cartItemId)}
                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-medium text-lg w-6 text-center">
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

        <div className="w-full lg:w-1/3 bg-white rounded-lg p-6 shadow-md border border-gray-200 self-start">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearCart}
              className="text-[#007BFF] hover:text-[#0056B3] text-sm font-semibold cursor-pointer"
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
            className="w-full py-3 mt-6 bg-[#213E5A] text-white font-semibold rounded-md hover:bg-[#1a324a] transition-colors cursor-pointer"
          >
            Checkout
          </button>
          <button
            onClick={() => router.push("/shop")}
            className="w-full py-3 mt-4 bg-[#213E5A] text-white font-semibold rounded-md hover:bg-[#1a324a] transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
