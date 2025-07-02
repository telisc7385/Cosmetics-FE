"use client";

import React, { useState } from "react";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import Image from "next/image";

const UserCheckout = () => {
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const { items, loading, error } = useLoggedInCart();

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsBilling(e.target.checked);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 min-h-screen">

      {/* Checkout Form - Right Side */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Full Name" />
          <Input placeholder="Phone" />
          <Input placeholder="Pincode" />
          <Input placeholder="State" />
          <Input placeholder="City" />
          <Input placeholder="Landmark" />
          <Textarea placeholder="Address Line" />
        </form>

        <div className="my-6">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm">Shipping address same as billing</span>
          </label>
        </div>

        {!sameAsBilling && (
          <>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Phone" />
              <Input placeholder="Pincode" />
              <Input placeholder="State" />
              <Input placeholder="City" />
              <Input placeholder="Landmark" />
              <Textarea placeholder="Address Line" />
            </form>
          </>
        )}
      </div>

       <div className="w-full md:w-1/2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Cart Products</h2>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">Error loading cart: {error}</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.cartItemId}
                className="flex items-start gap-4 border p-4 rounded"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
            <li className="text-right font-semibold text-gray-800 pt-2 border-t">
              Subtotal: ₹{subtotal.toFixed(2)}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

const Input = ({ placeholder }: { placeholder: string }) => (
  <input
    type="text"
    placeholder={placeholder}
    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
  />
);

const Textarea = ({ placeholder }: { placeholder: string }) => (
  <textarea
    placeholder={placeholder}
    rows={3}
    className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 col-span-full resize-none"
  />
);

export default UserCheckout;
