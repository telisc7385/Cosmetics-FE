"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import { selectCartItems, clearCart } from "@/store/slices/cartSlice";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PincodeVerifier from "./PincodeVerifier"; // Assuming this component exists and its styling is compatible

const GuestCheckout = () => {
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  // Initialize formData with empty strings to capture user input
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
    // Only allow digits for phone and pincode
    if (
      (e.target.name === "phone" || e.target.name === "pincode") &&
      !/^\d*$/.test(e.target.value)
    ) {
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePincodeVerified = (data: {
    pincode: string;
    city: string;
    state: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      pincode: data.pincode, // Ensure pincode is updated
      city: data.city, // Ensure city is updated
      state: data.state, // Ensure state is updated
    }));
  };

  const handlePlaceOrder = async () => {
    // Basic frontend validations remain
    if (!formData.email) {
      toast.error("Email is required.");
      return;
    }
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine ||
      !formData.pincode ||
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
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items to place an order.");
      return;
    }

    // Constructing the items array for the payload
    const itemsForPayload = cartItems.map((item: CartItem) => ({
      quantity: item.quantity,
      price: item.sellingPrice,
      // Conditionally include productId or variantId
      ...(item.variantId !== null && item.variantId !== undefined
        ? { variantId: item.variantId }
        : { productId: item.id }),
    }));

    // Construct the final payload using the dynamic formData values
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
      totalAmount: parseFloat(subtotal.toFixed(2)), // Ensure number and correct decimal places
      paymentMethod: formData.paymentMethod,
    };

    console.log("Sending payload:", payload); // Always useful to see what's being sent

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
        // Parse the error response from the backend
        const errorData = await response.json();
        // Log the full error object for detailed debugging
        console.error("Backend error response:", errorData);
        // Throw an error with a more specific message if available
        throw new Error(
          errorData.message ||
            "Order failed. Please check your details and try again."
        );
      }

      const data = await response.json();
      dispatch(clearCart());
      toast.success("Order placed successfully!");
      router.push(`/thank-you?orderId=${data.order.id}`);
    } catch (error: unknown) {
      // Catch network errors or errors thrown from the response.ok check
      console.error(
        "Guest order placement client-side error or API error:",
        error
      );
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while placing your order.";
      toast.error(message);
    }
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
      {/* Billing & Shipping Section */}
      <div className="w-full lg:w-3/5 bg-white shadow-xl p-6 md:p-8 lg:p-10 border-r border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Guest Checkout
        </h2>
        <div className="space-y-5">
          <PincodeVerifier onVerified={handlePincodeVerified} />
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            <input
              type="email"
              name="email"
              placeholder="Email *"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.fullName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone *"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
            />
            <input
              type="text"
              name="pincode"
              placeholder="Pincode *"
              readOnly
              required
              className="w-full border border-green-400 rounded px-3 py-2.5 bg-green-50 text-gray-700 cursor-not-allowed placeholder-green-500 text-sm"
              value={formData.pincode}
            />
            <input
              type="text"
              name="state"
              placeholder="State *"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.state}
              onChange={handleChange}
            />
            <input
              type="text"
              name="city"
              placeholder="City *"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.city}
              onChange={handleChange}
            />
            <textarea
              name="addressLine"
              placeholder="Address Line *"
              rows={2}
              required
              className="col-span-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.addressLine}
              onChange={handleChange}
            />
            <input
              type="text"
              name="landmark"
              placeholder="Landmark (Optional)"
              className="col-span-full border border-gray-300 rounded px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder-gray-500 text-sm"
              value={formData.landmark}
              onChange={handleChange}
            />
            <div className="col-span-full mt-3">
              <label
                htmlFor="paymentMethod"
                className="block text-gray-700 text-xs font-medium mb-1"
              >
                Select Payment Method:
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 appearance-none text-sm"
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Razorpay">Pay Online (Razorpay)</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="col-span-full mt-5 text-white font-bold py-3 rounded shadow-md transition-all duration-300 text-lg tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-[#213E5A40] bg-[#213E5A] hover:bg-[#1A334B]"
            >
              Place Order
            </button>
          </form>
        </div>
      </div>

      {/* Cart Summary */}
      <div className="w-full lg:w-2/5 bg-white shadow-xl p-6 md:p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          Your Order
        </h2>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            Your cart is empty.
          </p>
        ) : (
          <ul className="space-y-4">
            {cartItems.map((item: CartItem) => (
              <li
                key={item.cartItemId}
                className="flex gap-3 items-center p-2 rounded bg-gray-50/50 border border-gray-100 shadow-sm"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={70}
                  height={70}
                  className="w-16 h-16 rounded object-cover border border-gray-200"
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
                    Qty: <span className="font-medium">{item.quantity}</span>
                  </p>
                  <p className="text-base text-gray-800 font-bold mt-1">
                    ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
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
