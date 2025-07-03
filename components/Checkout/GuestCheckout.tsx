// GuestCheckout.tsx
"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectCartItems } from "@/store/slices/cartSlice";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const GuestCheckout = () => {
  const cartItems = useAppSelector(selectCartItems);
  const router = useRouter();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    addressLine: "",
    landmark: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    // --- START OF MODIFICATION ---
    // Transform cartItems to match the backend's expectation (either productId OR variantId)
    const itemsForPayload = cartItems.map((item: CartItem) => {
      const itemPayload: {
        productId?: number;
        variantId?: number;
        quantity: number;
        price: number;
      } = {
        quantity: item.quantity,
        price: item.sellingPrice,
      };

      if (item.variantId !== null && item.variantId !== undefined) {
        // If it's a variant, pass only variantId
        itemPayload.variantId = item.variantId;
      } else {
        // If no variant, pass only productId (which is item.id from our CartItem structure)
        itemPayload.productId = item.id;
      }
      return itemPayload;
    });
    // --- END OF MODIFICATION ---

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
      items: itemsForPayload, // Use the transformed items array
      totalAmount: subtotal,
      paymentMethod: "COD",
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/guest/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Order failed");
      }

      const data = await response.json();
      const orderId = data.order.id;
      console.log(orderId, "orderid");
      router.push(`/thank-you/${orderId}`);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Error placing order");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">Your cart is empty</div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {/* Billing/Shipping Form */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Billing & Shipping</h2>
        <form className="grid grid-cols-1 gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email *"
            required
            className="border px-3 py-2"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="border px-3 py-2"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="border px-3 py-2"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            className="border px-3 py-2"
            value={formData.pincode}
            onChange={handleChange}
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            className="border px-3 py-2"
            value={formData.state}
            onChange={handleChange}
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            className="border px-3 py-2"
            value={formData.city}
            onChange={handleChange}
          />
          <input
            type="text"
            name="addressLine"
            placeholder="Address Line"
            className="border px-3 py-2"
            value={formData.addressLine}
            onChange={handleChange}
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark"
            className="border px-3 py-2"
            value={formData.landmark}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={handlePlaceOrder}
            className="bg-blue-600 text-white py-2 rounded mt-4 hover:bg-blue-700"
          >
            Place Order
          </button>
        </form>
      </div>

      {/* Cart Summary */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
        {cartItems.map((item: CartItem) => (
          <div
            key={item.cartItemId}
            className="flex gap-4 items-center border-b py-4"
          >
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
