"use client";

import React, { useEffect, useState } from "react";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import Image from "next/image";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  addressLine: string;
  landmark?: string;
}

const UserCheckout = () => {
  const { items, loading, error } = useLoggedInCart();
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Omit<Address, "id">>({
    fullName: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    addressLine: "",
    landmark: "",
  });

  useEffect(() => {
    async function fetchAddresses() {
      // TODO: Replace with your real API call
      const data = [
        {
          id: "1",
          fullName: "John Doe",
          phone: "1234567890",
          pincode: "123456",
          state: "State A",
          city: "City A",
          addressLine: "123, Some street",
          landmark: "Near Park",
        },
      ];
      setAddresses(data);
      if (data.length > 0) {
        setSelectedBillingId(data[0].id);
        setSelectedShippingId(data[0].id);
      }
    }
    fetchAddresses();
  }, []);

  const openCreateModal = () => {
    setFormData({
      fullName: "",
      phone: "",
      pincode: "",
      state: "",
      city: "",
      addressLine: "",
      landmark: "",
    });
    setEditingAddress(null);
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      pincode: address.pincode,
      state: address.state,
      city: address.city,
      addressLine: address.addressLine,
      landmark: address.landmark || "",
    });
    setEditingAddress(address);
    setShowModal(true);
  };

  const deleteAddress = (id: string) => {
    if (!confirm("Delete this address?")) return;
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedBillingId === id) setSelectedBillingId(null);
    if (selectedShippingId === id) setSelectedShippingId(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      alert("Full Name and Phone are required");
      return;
    }

    if (editingAddress) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? { ...a, ...formData } : a))
      );
    } else {
      const newAddress = { id: Date.now().toString(), ...formData };
      setAddresses((prev) => [...prev, newAddress]);
    }

    setShowModal(false);
    setEditingAddress(null);
  };

  const renderAddressList = (
    selectedId: string | null,
    setSelected: (id: string) => void
  ) => (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          onClick={() => setSelected(address.id)}
          className={`border rounded p-4 cursor-pointer relative ${
            selectedId === address.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{address.fullName}</p>
              <p>{address.phone}</p>
              <p>
                {address.addressLine},{" "}
                {address.landmark && `${address.landmark}, `}
                {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(address);
                }}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAddress(address.id);
                }}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={openCreateModal}
        className="mt-4 inline-block text-blue-600 hover:underline"
      >
        + Add New Address
      </button>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Address Section */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>

        {addresses.length === 0 ? (
          <div
            onClick={openCreateModal}
            className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-40"
          >
            <div className="text-5xl text-gray-400 mb-2">+</div>
            <div className="text-gray-600 font-semibold">Create Address</div>
          </div>
        ) : (
          renderAddressList(selectedBillingId, setSelectedBillingId)
        )}

        <div className="mt-6">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => setSameAsBilling(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm">Shipping address same as billing</span>
          </label>
        </div>

        {!sameAsBilling && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {renderAddressList(selectedShippingId, setSelectedShippingId)}
          </div>
        )}
      </div>

      {/* Cart Section */}
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

      {/* Modal for Address Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg relative">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? "Edit Address" : "Add Address"}
            </h3>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="fullName" value={formData.fullName} onChange={handleFormChange} placeholder="Full Name *" required className="border px-3 py-2 rounded" />
              <input name="phone" value={formData.phone} onChange={handleFormChange} placeholder="Phone *" required className="border px-3 py-2 rounded" />
              <input name="pincode" value={formData.pincode} onChange={handleFormChange} placeholder="Pincode" className="border px-3 py-2 rounded" />
              <input name="state" value={formData.state} onChange={handleFormChange} placeholder="State" className="border px-3 py-2 rounded" />
              <input name="city" value={formData.city} onChange={handleFormChange} placeholder="City" className="border px-3 py-2 rounded" />
              <input name="landmark" value={formData.landmark} onChange={handleFormChange} placeholder="Landmark" className="border px-3 py-2 rounded" />
              <textarea name="addressLine" value={formData.addressLine} onChange={handleFormChange} placeholder="Address Line" rows={3} className="border px-3 py-2 rounded col-span-full" />
              <div className="col-span-full flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  {editingAddress ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCheckout;
