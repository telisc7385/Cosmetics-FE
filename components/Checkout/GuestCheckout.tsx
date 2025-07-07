"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import {
  selectCartItems,
  clearCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
} from "@/store/slices/cartSlice";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi"; // For the delete icon

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
    city: "",
    addressLine: "",
    landmark: "",
    paymentMethod: "COD",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === "phone" && !/^\d*$/.test(e.target.value)) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.email) {
      toast.error("Email is required.");
      return;
    }
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine ||
      !formData.city ||
      !formData.state
    ) {
      toast.error("Please fill all required address fields.");
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items to place an order.");
      return;
    }

    const itemsForPayload = cartItems.map((item: CartItem) => ({
      quantity: item.quantity,
      price: item.sellingPrice,
      ...(item.variantId !== null && item.variantId !== undefined
        ? { variantId: item.variantId }
        : { productId: item.id }),
    }));

    const payload = {
      email: formData.email,
      address: {
        fullName: formData.fullName,
        phone: formData.phone,
        pincode: formData.pincode,
        state: formData.state,
        city: formData.city,
        addressLine: formData.addressLine,
        landmark: formData.landmark,
      },
      items: itemsForPayload,
      totalAmount: parseFloat(subtotal.toFixed(2)),
      paymentMethod: formData.paymentMethod,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/guest/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Order failed. Try again.");
      }

      const data = await response.json();
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      router.push(`/thank-you?orderId=${data.order.id}`);
    } catch (error: unknown) {
      console.error("Order error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected error placing order.";
      toast.error(message);
    }
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items are in stock.`);
      return;
    }
    if (newQuantity <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    if (newQuantity > item.quantity) {
      dispatch(incrementQuantity(item.cartItemId)); // Increment
    } else {
      dispatch(decrementQuantity(item.cartItemId)); // Decrement
    }
  };

  const handleDeleteItem = (itemId: number) => {
    dispatch(removeFromCart(itemId));
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-600 text-xl font-medium px-4">
        Your cart is empty. Please add items to proceed to checkout.
      </div>
    );
  }

  return (
    <div
      className="font-sans flex flex-col lg:flex-row min-h-screen"
      style={{ backgroundColor: "#F3F6F7" }}
    >
      {/* Checkout Form */}
      <div className="w-full lg:w-3/5 bg-white shadow-xl p-6 md:p-8 lg:p-10 border-r border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Guest Checkout
        </h2>
        {/* ...form inputs for email, address, etc. ... */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          className="col-span-full mt-5 text-white font-bold py-3 rounded bg-[#213E5A] hover:bg-[#1A334B] text-lg"
        >
          Place Order
        </button>
      </div>

      {/* Cart Items */}
      <div className="w-full lg:w-2/5 bg-white shadow-xl p-6 md:p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Your Order
        </h2>
        <ul className="space-y-4">
          {cartItems.map((item: CartItem) => (
            <li
              key={item.cartItemId}
              className="flex gap-3 items-center p-2 rounded bg-gray-50 border"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={70}
                height={70}
                className="w-16 h-16 rounded object-cover border"
              />
              <div className="flex-grow">
                <p className="font-semibold text-gray-900 text-base">
                  {item.name}
                </p>
                {item.variantId && item.variant && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Variant:{" "}
                    <span className="font-medium">{item.variant.name}</span>
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-0.5">
                  Qty:{" "}
                  <span className="font-medium">
                    <button
                      onClick={() =>
                        handleQuantityChange(item, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-2 py-1 mx-2 bg-gray-300 rounded disabled:opacity-50"
                    >
                      -
                    </button>
                    {item.quantity}
                    <button
                      onClick={() =>
                        handleQuantityChange(item, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock}
                      className="px-2 py-1 mx-2 bg-gray-300 rounded disabled:opacity-50"
                    >
                      +
                    </button>
                  </span>
                </p>
                <p className="text-base text-gray-800 font-bold mt-1">
                  ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                </p>
              </div>
              <FiTrash2
                onClick={() => handleDeleteItem(item.cartItemId)}
                style={{ cursor: "pointer", color: "red" }}
                title="Remove item"
              />
            </li>
          ))}
        </ul>
        <div className="pt-6 mt-6 border-t border-gray-200">
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">
            (Excluding shipping, calculated at final step)
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestCheckout;
