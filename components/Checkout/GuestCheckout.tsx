"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectCartItems } from "@/store/slices/cartSlice";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PincodeVerifier from "./PincodeVerifier";

const GuestCheckout = () => {
  const cartItems = useAppSelector(selectCartItems);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePincodeVerified = (data: {
    pincode: string;
    city: string;
    state: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.email) {
      toast.error("Email is required");
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
      totalAmount: subtotal,
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
        throw new Error(errorData.message || "Order failed");
      }

      const data = await response.json();
      router.push(`/thank-you/${data.order.id}`);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error placing order");
    }
  };

  if (cartItems.length === 0) {
    return <div className="text-center text-gray-500 py-10">Your cart is empty</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mx-auto px-4 py-10">
      <div className="w-full bg-white/80 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-2xl border border-pink-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Billing & Shipping
        </h2>

        <PincodeVerifier onVerified={handlePincodeVerified} />

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email *"
            required
            className="border border-pink-300 rounded-md px-4 py-2 focus:outline-pink-500 bg-white"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="border border-pink-300 rounded-md px-4 py-2 focus:outline-pink-500 bg-white"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="border border-pink-300 rounded-md px-4 py-2 focus:outline-pink-500 bg-white"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            readOnly
            className="border border-green-400 rounded-md px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
            value={formData.pincode}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            className="border border-pink-300 rounded-md px-4 py-2 focus:outline-pink-500 bg-white"
            value={formData.state}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            className="border border-pink-300 rounded-md px-4 py-2 focus:outline-pink-500 bg-white"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="addressLine"
            placeholder="Address Line"
            className="col-span-1 sm:col-span-2 border border-pink-300 rounded-md px-4 py-2 bg-white"
            value={formData.addressLine}
            onChange={handleChange}
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark"
            className="col-span-1 sm:col-span-2 border border-pink-300 rounded-md px-4 py-2 bg-white"
            value={formData.landmark}
            onChange={handleChange}
          />
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={(e) =>
              setFormData({ ...formData, paymentMethod: e.target.value })
            }
            className="col-span-1 sm:col-span-2 border border-pink-300 rounded-md px-4 py-2 text-gray-600 bg-white"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="Razorpay">Razorpay</option>
          </select>
          <button
            type="button"
            onClick={handlePlaceOrder}
            className="col-span-1 sm:col-span-2 mt-2 bg-pink-600 text-white font-semibold py-2 rounded hover:bg-pink-700 transition-all"
          >
            Place Order
          </button>
        </form>
      </div>

      {/* Cart Summary */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
        {cartItems.map((item: CartItem) => (
          <div key={item.cartItemId} className="flex gap-4 items-center border-b py-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded object-cover"
            />
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              <p className="text-sm text-gray-900 font-semibold">
                ₹{(item.quantity * item.sellingPrice).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
        <div className="pt-4 text-right font-bold text-lg text-gray-800">
          Subtotal: ₹{subtotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default GuestCheckout;
