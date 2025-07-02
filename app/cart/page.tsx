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





const CartPage = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const guestCartItems = useAppSelector(selectGuestCartItems);
  const dispatch = useAppDispatch();

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

  const handleRemove = (cartItemId: number) => {
    if (isLoggedIn) {
      removeLoggedInItem(cartItemId);
    } else {
      dispatch(removeFromCart(cartItemId));
    }
  };

  const handleClearCart = () => {
    if (isLoggedIn) {
      clearLoggedInCart();
    } else {
      dispatch(clearGuestCart());
    }
  };

  const subtotal = items.reduce(
    (
      total: number,
      item: CartItem // Explicitly typed 'total' and 'item'
    ) => total + item.sellingPrice * item.quantity,
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
    return (
      <div className="text-center py-10 text-gray-500">
        Your cart is empty. Start shopping!
      </div>
    );
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
                    className="text-sm text-red-500 hover:text-red-700 font-medium mt-3 text-left"
                  >
                    REMOVE
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

          <button className="w-full py-3 mt-6 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition-colors">
            Checkout
          </button>
          <button className="w-full py-3 mt-4 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
            Continue Shopping
          </button>

          <div className="flex justify-center mt-6 space-x-3">
            <Image src="/icons/visa.svg" alt="Visa"   width={40}
  height={24} className="h-6" />
            <Image src="/icons/mastercard.svg" alt="Mastercard"   width={40}
  height={24} className="h-6" />
            <Image src="/icons/amex.svg" alt="American Express"   width={40}
  height={24} className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
