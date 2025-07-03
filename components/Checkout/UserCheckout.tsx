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
import { Minus, Plus, Trash2 } from "lucide-react";

const UserCheckout = () => {
  const { items, error: cartError, loading: cartLoading, incrementItemQuantity, decrementItemQuantity, removeCartItem } = useLoggedInCart();
  const router = useRouter();
  const token = useAppSelector(selectToken);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const shippingCharges = 0;
  const totalAmount = subtotal + shippingCharges;

  // ✅ Independent state
  const [address, setAddress] = useState<LocalAddressItem[]>([]);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [addressIsLoading, setAddressIsLoading] = useState(true);
  const [addressHasError, setAddressHasError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<LocalAddressItem | null>(null);
  const [formData, setFormData] = useState<AddressInput>({ fullName: "", phone: "", pincode: "", state: "", city: "", addressLine: "", landmark: "" });
  const [isAddingShippingAddress, setIsAddingShippingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");


  // 🎯 Load addresses and set initial billing/shipping
  useEffect(() => {
    async function fetchAddresses() {
      if (!token) {
        setAddressIsLoading(false);
        setAddressHasError("Please log in to manage addresses.");
        return;
      }
      setAddressIsLoading(true);
      try {
        const data = await apiCore<FetchAddressesResponse>("/address", "GET", undefined, token);
        const fetchedAddresses = data.address || [];
        setAddress(fetchedAddresses);
        if (fetchedAddresses.length > 0) {
          const sb = localStorage.getItem("selectedBillingId");
          const ss = localStorage.getItem("selectedShippingId");
          const same = localStorage.getItem("sameAsBilling") === "true";

          const defaultAddr = fetchedAddresses.find(a => a.isDefault) || fetchedAddresses[0];
          const billingId = sb && fetchedAddresses.some(a => a.id === sb) ? sb : defaultAddr.id;
          const shippingId = same ? billingId : ss && fetchedAddresses.some(a => a.id === ss) ? ss : null;

          setSelectedBillingId(billingId);
          setSelectedShippingId(shippingId);
          setSameAsBilling(same);
        } else {
          setAddressHasError("No addresses found. Please add a new address.");
          setSameAsBilling(true);
        }
      } catch (err: any) {
        setAddressHasError("Failed to fetch addresses: " + err.message);
        console.error(err);
      } finally {
        setAddressIsLoading(false);
      }
    }
    fetchAddresses();
  }, [token]);

  // 💾 Persist selection
  useEffect(() => {
    selectedBillingId ? localStorage.setItem("selectedBillingId", selectedBillingId) : localStorage.removeItem("selectedBillingId");
    selectedShippingId ? localStorage.setItem("selectedShippingId", selectedShippingId) : localStorage.removeItem("selectedShippingId");
    localStorage.setItem("sameAsBilling", String(sameAsBilling));
  }, [selectedBillingId, selectedShippingId, sameAsBilling]);

  // 🧩 Modal controls
  const openCreateModal = (forShipping: boolean) => {
    setFormData({ fullName: "", phone: "", pincode: "", state: "", city: "", addressLine: "", landmark: "" });
    setEditingAddress(null);
    setIsAddingShippingAddress(forShipping);
    setShowModal(true);
  };
  const openEditModal = (addr: LocalAddressItem) => {
    setFormData({ fullName: addr.fullName, phone: addr.phone, pincode: addr.pincode, state: addr.state, city: addr.city, addressLine: addr.addressLine, landmark: addr.landmark || "" });
    setEditingAddress(addr);
    setIsAddingShippingAddress(false);
    setShowModal(true);
  };

  // 🗑️ Delete with independence
  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    if (!token) {
      toast.error("You must be logged in to delete addresses.");
      return;
    }
    try {
      await apiCore<any>(`/address/${id}`, "DELETE", undefined, token);
      setAddress(prev => prev.filter(a => a.id !== id));

      if (selectedBillingId === id) {
        setSelectedBillingId(null);
        if (sameAsBilling) {
          setSelectedShippingId(null);
          setSameAsBilling(false);
        }
      }
      if (selectedShippingId === id) {
        setSelectedShippingId(null);
      }

      toast.success("Address deleted successfully!");
    } catch (err: any) {
      toast.error("Failed to delete address: " + err.message);
      console.error(err);
    }
  };

  // 📝 Handle form field updates
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if ((name === "phone" || name === "pincode") && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Save (create/update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("You must be logged in to save addresses.");

    const { fullName, phone, pincode, city, state, addressLine } = formData;
    if (!fullName || !phone || !pincode || !city || !state || !addressLine)
      return toast.error("Please fill all required address fields.");
    if (!/^\d{10}$/.test(phone)) return toast.error("Please enter a valid 10-digit phone number.");
    if (!/^\d{6}$/.test(pincode)) return toast.error("Please enter a valid 6-digit pincode.");

    try {
      if (editingAddress) {
        const res = await apiCore<SingleAddressResponse>(`/address/${editingAddress.id}`, "PATCH", formData, token);
        setAddress(prev => prev.map(a => a.id === res.updated?.id ? res.updated : a));
        toast.success("Address updated successfully!");
      } else {
        const res = await apiCore<SingleAddressResponse>("/address", "POST", formData, token);
        const added = res.address!;
        setAddress(prev => [...prev, added]);

        if (isAddingShippingAddress) {
          setSelectedShippingId(added.id);
          setSameAsBilling(false);
        } else {
          setSelectedBillingId(added.id);
          if (sameAsBilling) setSelectedShippingId(added.id);
        }

        toast.success("Address created successfully!");
      }
      setShowModal(false);
      setEditingAddress(null);
      setIsAddingShippingAddress(false);
    } catch (err: any) {
      toast.error("Failed to save address: " + err.message);
      console.error(err);
    }
  };

  // ✅ Final order placement
  const handlePlaceOrder = async () => {
  if (!selectedBillingId) return toast.error("Please select a billing address.");
  if (items.length === 0) return toast.error("Your cart is empty.");
  if (!token) return router.push("/login");
  if (cartLoading || addressIsLoading) return toast.error("Please wait until everything loads.");

  const payload = {
    items: items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.sellingPrice,
    })),
    discountAmount: 0, // TODO: update if you have any logic
    addressId: sameAsBilling ? selectedBillingId : selectedShippingId!,
    totalAmount,
    paymentMethod, // "COD" or "RAZORPAY"
  };

  try {
    const order = await apiCore<OrderResponse>("/order", "POST", payload, token);
    toast.success("Order placed successfully!");
    router.push(`/thank-you/${order.id || ""}`);
  } catch (err: any) {
    toast.error(err.message || "There was an error placing your order.");
    console.error(err);
  }
};


  // 🔁 UI render helper
  const renderAddressList = (addresses: LocalAddressItem[], selected: string | null, onSelect: (id: string) => void, title: string, forShipping: boolean) => (
    <div className="space-y-4">
      {addresses.length === 0 && !addressIsLoading ? (
        <div onClick={() => openCreateModal(forShipping)} className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-40">
          <div className="text-5xl text-gray-400 mb-2">+</div>
          <div className="text-gray-600 font-semibold">Create First {title} Address</div>
        </div>
      ) : (
        <>
          {addresses.map(a => (
            <div key={a.id} onClick={() => onSelect(a.id)} className={`border rounded p-4 cursor-pointer ${selected === a.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{a.fullName}</p>
                  <p>{a.phone}</p>
                  <p>{a.addressLine}, {a.landmark && `${a.landmark}, `}{a.city}, {a.state} - {a.pincode}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={e => { e.stopPropagation(); openEditModal(a); }} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={e => { e.stopPropagation(); deleteAddress(a.id); }} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => openCreateModal(forShipping)} className="mt-4 text-blue-600 hover:underline">+ Add New {title} Address</button>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 min-h-screen max-w-7xl mx-auto">
      {/* Billing & Shipping Selection */}
      <div className="w-full md:w-1/2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
        {addressIsLoading ? <p>Loading addresses...</p> : addressHasError && <p className="text-red-600">{addressHasError}</p>}
        {renderAddressList(address, selectedBillingId, setSelectedBillingId, "Billing", false)}

        <div className="mt-6">
          <label className="inline-flex items-center space-x-2">
            <input type="checkbox" checked={sameAsBilling} onChange={e => {
              const checked = e.target.checked;
              setSameAsBilling(checked);
              if (checked && selectedBillingId) {
                setSelectedShippingId(selectedBillingId);
              } else if (!checked && selectedBillingId === selectedShippingId) {
                setSelectedShippingId(null);
              }
            }} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="text-sm">Shipping address same as billing</span>
          </label>
        </div>

        {!sameAsBilling && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {addressIsLoading ? <p>Loading addresses...</p> : addressHasError && <p className="text-red-600">{addressHasError}</p>}
            {renderAddressList(address, selectedShippingId, setSelectedShippingId, "Shipping", true)}
          </div>
        )}

        <div className="mt-6">
  <label htmlFor="payment-method" className="block mb-2 font-medium">Select Payment Method:</label>
  <select
    id="payment-method"
    value={paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value as "COD" | "RAZORPAY")}
    className="w-full border px-3 py-2 rounded"
  >
    <option value="COD">Cash on Delivery (COD)</option>
    <option value="RAZORPAY">Pay Online (Razorpay)</option>
  </select>
</div>

      </div>

      {/* Cart Summary */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Product Summary</h2>
          {cartLoading ? <p>Loading cart...</p> : cartError ? <p className="text-red-600">{cartError}</p> : items.length === 0 ? <p>Your cart is empty</p> : (
            <ul className="space-y-4">
  {items.map(item => (
    <li
      key={item.cartItemId}
      className="flex items-start gap-4 p-4 border border-gray-400 rounded shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      <Image
        src={item.image}
        alt={item.name}
        width={64}
        height={64}
        className="w-20 h-20 object-cover rounded-md border"
      />
      <div className="flex flex-col flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-gray-900">{item.name}</p>
            {item.variant?.name && (
              <p className="text-sm text-gray-500 mt-1">Variant: {item.variant.name}</p>
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-4">
            ₹{(item.quantity * item.sellingPrice).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center mt-4 space-x-2">
          <button
            onClick={() => decrementItemQuantity(item.cartItemId)}
            disabled={item.quantity <= 1}
            className="p-1.5 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <Minus size={18} />
          </button>
          <span className="px-2 font-medium text-gray-800">{item.quantity}</span>
          <button
            onClick={() => incrementItemQuantity(item.cartItemId)}
            className="p-1.5 rounded border bg-gray-100 hover:bg-gray-200"
          >
            <Plus size={18} />
          </button>

          <button
            onClick={() => removeCartItem(item.cartItemId)}
            className="ml-auto text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 size={18} />
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
          <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping:</span><span>₹{shippingCharges.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold border-t pt-4"><span>Total:</span><span>₹{totalAmount.toFixed(2)}</span></div>
          <button onClick={handlePlaceOrder} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Place Order</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#edf3f8] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingAddress ? "Edit Address" : `Add ${isAddingShippingAddress ? "Shipping" : "Billing"} Address`}</h3>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="fullName" placeholder="Full Name *" required value={formData.fullName} onChange={handleFormChange} className="border px-3 py-2 rounded" />
              <input name="phone" placeholder="Phone *" required value={formData.phone} onChange={handleFormChange} className="border px-3 py-2 rounded" />
              <input name="pincode" placeholder="Pincode *" required value={formData.pincode} onChange={handleFormChange} className="border px-3 py-2 rounded" />
              <input name="state" placeholder="State *" required value={formData.state} onChange={handleFormChange} className="border px-3 py-2 rounded" />
              <input name="city" placeholder="City *" required value={formData.city} onChange={handleFormChange} className="border px-3 py-2 rounded" />
              <input name="landmark" placeholder="Landmark" value={formData.landmark} onChange={handleFormChange} className="border px-3 py-2 rounded" />
              <textarea name="addressLine" placeholder="Address Line *" required rows={3} value={formData.addressLine} onChange={handleFormChange} className="border px-3 py-2 rounded col-span-full" />
              <div className="col-span-full flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editingAddress ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCheckout;
