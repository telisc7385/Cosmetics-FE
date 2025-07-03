"use client";

import React, { useEffect, useState } from "react";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import {
  apiCore,
  LoggedInOrderPayload,
  OrderResponse,
  LocalAddressItem,
  FetchAddressesResponse,
  SingleAddressResponse,
  AddressInput,
  Address,
} from "@/api/ApiCore";

import { CartItem } from "@/types/cart";

const UserCheckout = () => {
  const {
    items,
    error: cartError,
    loading: cartLoading,
    incrementItemQuantity,
    decrementItemQuantity,
    removeCartItem,
  } = useLoggedInCart();
  const router = useRouter();
  const token = useAppSelector(selectToken);

  const subtotal = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity * item.sellingPrice,
    0
  );
  const shippingCharges = 0;
  const totalAmount = subtotal + shippingCharges;

  const [address, setAddress] = useState<LocalAddressItem[]>([]);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(
    null
  );
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null
  );
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [addressIsLoading, setAddressIsLoading] = useState(true);
  const [addressHasError, setAddressHasError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<LocalAddressItem | null>(
    null
  );
  const [formData, setFormData] = useState<AddressInput>({
    fullName: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    addressLine: "",
    landmark: "",
  });

  const [isAddingShippingAddress, setIsAddingShippingAddress] = useState(false);

  useEffect(() => {
    async function fetchAddresses() {
      if (!token) {
        setAddressIsLoading(false);
        setAddressHasError("Please log in to manage addresses.");
        console.warn("No token available for fetching addresses.");
        return;
      }
      setAddressIsLoading(true);
      setAddressHasError(null);
      try {
        const data = await apiCore<FetchAddressesResponse>(
          "/address",
          "GET",
          undefined,
          token
        );
        const fetchedAddresses = data.addresses || [];
        setAddress(fetchedAddresses);

        if (fetchedAddresses.length > 0) {
          const storedBillingId = localStorage.getItem("selectedBillingId");
          const storedShippingId = localStorage.getItem("selectedShippingId");
          const storedSameAsBilling =
            localStorage.getItem("sameAsBilling") === "true";

          let initialBillingId = null;
          let initialShippingId = null;

          if (
            storedBillingId &&
            fetchedAddresses.some((a) => a.id === storedBillingId)
          ) {
            initialBillingId = storedBillingId;
          } else {
            const defaultBillingAddress =
              fetchedAddresses.find((addr) => addr.isDefault) ||
              fetchedAddresses[0];
            initialBillingId = defaultBillingAddress?.id || null;
          }

          if (storedSameAsBilling) {
            initialShippingId = initialBillingId;
          } else if (
            storedShippingId &&
            fetchedAddresses.some((a) => a.id === storedShippingId)
          ) {
            initialShippingId = storedShippingId;
          } else {
            initialShippingId = null;
          }

          setSelectedBillingId(initialBillingId);
          setSelectedShippingId(initialShippingId);
          setSameAsBilling(storedSameAsBilling);
        } else {
          setAddressHasError("No addresses found. Please add a new address.");
          setSelectedBillingId(null);
          setSelectedShippingId(null);
          setSameAsBilling(true);
        }
      } catch (err: any) {
        setAddressHasError("Failed to fetch addresses: " + err.message);
        console.error("Failed to fetch addresses:", err);
      } finally {
        setAddressIsLoading(false);
      }
    }
    fetchAddresses();
  }, [token]);

  useEffect(() => {
    if (selectedBillingId)
      localStorage.setItem("selectedBillingId", selectedBillingId);
    else localStorage.removeItem("selectedBillingId");

    if (selectedShippingId)
      localStorage.setItem("selectedShippingId", selectedShippingId);
    else localStorage.removeItem("selectedShippingId");

    localStorage.setItem("sameAsBilling", String(sameAsBilling));
  }, [selectedBillingId, selectedShippingId, sameAsBilling]);

  const openCreateModal = (forShipping: boolean) => {
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
    setIsAddingShippingAddress(forShipping);
    setShowModal(true);
  };

  const openEditModal = (addr: LocalAddressItem) => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      state: addr.state,
      city: addr.city,
      addressLine: addr.addressLine,
      landmark: addr.landmark || "",
    });
    setEditingAddress(addr);
    setIsAddingShippingAddress(false);
    setShowModal(true);
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    if (!token) {
      toast.error("You must be logged in to delete addresses.");
      return;
    }
    try {
      await apiCore<any>(`/address/${id}`, "DELETE", undefined, token);
      setAddress((prev) => prev.filter((a) => a.id !== id));

      if (selectedBillingId === id) setSelectedBillingId(null);
      if (selectedShippingId === id) setSelectedShippingId(null);

      toast.success("Address deleted successfully!");
    } catch (err: any) {
      toast.error("Failed to delete address: " + err.message);
      console.error("Failed to delete address:", err);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone" || name === "pincode") {
      if (!/^\d*$/.test(value)) {
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("You must be logged in to save addresses.");
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

    try {
      if (editingAddress) {
        const updatedAddress = await apiCore<SingleAddressResponse>(
          `/address/${editingAddress.id}`,
          "PATCH",
          formData,
          token
        );
        setAddress((prev) =>
          prev.map((a) =>
            a.id === updatedAddress.address.id ? updatedAddress.address : a
          )
        );
        toast.success("Address updated successfully!");
      } else {
        const newAddress = await apiCore<SingleAddressResponse>(
          "/address",
          "POST",
          formData,
          token
        );
        setAddress((prev) => [...prev, newAddress.address]);

        if (isAddingShippingAddress) {
          setSelectedShippingId(newAddress.address.id);
          setSameAsBilling(false);
        } else {
          if (!selectedBillingId) {
            setSelectedBillingId(newAddress.address.id);
            if (sameAsBilling) {
              setSelectedShippingId(newAddress.address.id);
            }
          } else if (sameAsBilling) {
            setSelectedShippingId(selectedBillingId);
          }
        }
        toast.success("Address created successfully!");
      }
      setShowModal(false);
      setEditingAddress(null);
      setIsAddingShippingAddress(false);
    } catch (err: any) {
      toast.error("Failed to save address: " + err.message);
      console.error("Failed to save address:", err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedBillingId) {
      toast.error("Please select a billing address.");
      return;
    }
    if (!sameAsBilling && !selectedShippingId) {
      toast.error("Please select a shipping address.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items to place an order.");
      return;
    }
    if (!token) {
      toast.error("You must be logged in to place an order.");
      router.push("/login");
      return;
    }
    if (cartLoading) {
      toast.error("Cart is still loading. Please wait.");
      return;
    }
    if (addressIsLoading) {
      toast.error("Addresses are still loading. Please wait.");
      return;
    }
    if (addressHasError) {
      toast.error(
        "Cannot place order due to address error: " + addressHasError
      );
      return;
    }

    const payload: LoggedInOrderPayload = {
      billingAddressId: selectedBillingId,
      shippingAddressId: sameAsBilling
        ? selectedBillingId
        : selectedShippingId || selectedBillingId,
      items: items.map((item: CartItem) => ({
        // FIX: Removed parseInt as item.id and item.variantId are now numbers
        productId: item.id,
        variantId: item.variantId ? item.variantId : undefined,
        quantity: item.quantity,
        price: item.sellingPrice,
      })),
      totalAmount: totalAmount,
      discountAmount: 0,
      paymentMethod: "COD",
    };

    try {
      const orderResponse = await apiCore<OrderResponse>(
        "/order",
        "POST",
        payload,
        token
      );

      const orderId = orderResponse.id || "30";

      toast.success("Order placed successfully!");
      router.push(`/thank-you/${orderId}`);
    } catch (err: any) {
      console.error("Order placement error:", err);
      toast.error(err.message || "There was an error placing your order.");
    }
  };

  const renderAddressList = (
    addressesToDisplay: LocalAddressItem[],
    selectedId: string | null,
    setSelected: (id: string) => void,
    title: string,
    forShipping: boolean
  ) => (
    <div className="space-y-4">
      {addressesToDisplay.length === 0 && !addressIsLoading ? (
        <div
          onClick={() => openCreateModal(forShipping)}
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-40"
        >
          <div className="text-5xl text-gray-400 mb-2">+</div>
          <div className="text-gray-600 font-semibold">
            Create First {title} Address
          </div>
        </div>
      ) : (
        <>
          {addressesToDisplay.map(
            (
              addr // 'addr' is implicitly typed here, but okay in this specific context as 'LocalAddressItem' from renderAddressList signature
            ) => (
              <div
                key={addr.id}
                onClick={() => setSelected(addr.id)}
                className={`border rounded p-4 cursor-pointer relative ${
                  selectedId === addr.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{addr.fullName}</p>
                    <p>{addr.phone}</p>
                    <p>
                      {addr.addressLine},{" "}
                      {addr.landmark && `${addr.landmark}, `}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(addr);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(addr.id);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
          <button
            onClick={() => openCreateModal(forShipping)}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            + Add New {title} Address
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 min-h-screen max-w-7xl mx-auto">
      {/* Left Column: Address Section (now order-1) */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded shadow order-1 md:order-1">
        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>

        {addressIsLoading ? (
          <p>Loading addresses...</p>
        ) : addressHasError && address.length === 0 ? (
          <div className="text-red-600 mb-4">{addressHasError}</div>
        ) : null}

        {renderAddressList(
          address,
          selectedBillingId,
          setSelectedBillingId,
          "Billing",
          false
        )}

        <div className="mt-6">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setSameAsBilling(isChecked);
                if (isChecked && selectedBillingId) {
                  setSelectedShippingId(selectedBillingId);
                } else if (
                  !isChecked &&
                  selectedBillingId === selectedShippingId
                ) {
                  setSelectedShippingId(null);
                }
              }}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-sm">Shipping address same as billing</span>
          </label>
        </div>

        {!sameAsBilling && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {addressIsLoading ? (
              <p>Loading addresses...</p>
            ) : addressHasError && address.length === 0 ? (
              <div className="text-red-600 mb-4">{addressHasError}</div>
            ) : null}
            {renderAddressList(
              address,
              selectedShippingId,
              setSelectedShippingId,
              "Shipping",
              true
            )}
          </div>
        )}
      </div>

      {/* Right Column: Product Summary and Price Summary (now order-2) */}
      <div className="w-full md:w-1/2 flex flex-col gap-6 order-2 md:order-2">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Product Summary</h2>

          {cartLoading ? (
            <p>Loading cart items...</p>
          ) : cartError ? (
            <p className="text-red-600">Error loading cart: {cartError}</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item: CartItem) => (
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
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.variant?.name && (
                      <p className="text-xs text-gray-500">
                        Variant: {item.variant.name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <button
                        onClick={() => decrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity <= 1}
                        className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementItemQuantity(item.cartItemId)}
                        className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 3a1 1 0 100 2v3a1 1 0 102 0v-3a1 1 0 00-2 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-4">
            <span>Shipping:</span>
            <span>₹{shippingCharges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-800 border-t pt-4">
            <span>Total:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all text-lg"
          >
            Place Order
          </button>
        </div>
      </div>

      {/* Modal for Address Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg relative">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress
                ? "Edit Address"
                : `Add ${
                    isAddingShippingAddress ? "Shipping" : "Billing"
                  } Address`}
            </h3>
            <form
              onSubmit={handleFormSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                placeholder="Full Name *"
                required
                className="border px-3 py-2 rounded"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Phone Number *"
                required
                className="border px-3 py-2 rounded"
              />
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleFormChange}
                placeholder="Pincode *"
                required
                className="border px-3 py-2 rounded"
              />
              <input
                name="state"
                value={formData.state}
                onChange={handleFormChange}
                placeholder="State *"
                required
                className="border px-3 py-2 rounded"
              />
              <input
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                placeholder="City *"
                required
                className="border px-3 py-2 rounded"
              />
              <input
                name="landmark"
                value={formData.landmark}
                onChange={handleFormChange}
                placeholder="Landmark"
                className="border px-3 py-2 rounded"
              />
              <textarea
                name="addressLine"
                value={formData.addressLine}
                onChange={handleFormChange}
                placeholder="Address Line *"
                rows={3}
                required
                className="border px-3 py-2 rounded col-span-full"
              />
              <div className="col-span-full flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
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
