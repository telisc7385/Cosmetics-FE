"use client";

import React, { useEffect, useState } from "react";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider"; // Ensure this path is correct
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
import { CartItem } from "@/types/cart"; // Assuming CartItem is defined here
import { Minus, Plus, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link"; // Import Link for Next.js navigation

// Coupon types
interface Coupon {
  id: number;
  name: string;
  code: string;
  discount: number; // This is the discount percentage
  expiresAt: string; // ISO string format
}

interface CouponApiResponse {
  success: boolean;
  data: Coupon[];
}

// Updated type for coupon redeem response to include calculated amounts
interface CouponRedeemResponse {
  success: boolean;
  message: string;
  discountAmount: number; // The actual calculated discount amount in currency
  updatedTotalAmount: number; // The new total after discount
  couponCode: string; // The code that was applied
}

const UserCheckout = () => {
  const {
    items,
    error: cartError,
    loading: cartLoading, // Use this loading state
    incrementItemQuantity,
    decrementItemQuantity,
    removeCartItem,
    clearCart,
    cartId, // This should be a number from useLoggedInCart, or null during loading/if not present
  } = useLoggedInCart();
  const router = useRouter();
  const token = useAppSelector(selectToken);

  // Calculate subtotal from current cart items
  const initialSubtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );
  const shippingCharges = 0; // Shipping is set to 0

  // State for coupons
  const [showCouponSection, setShowCouponSection] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // New state for order placement animation

  // Initialize finalTotalAmount with a calculated value
  const [finalTotalAmount, setFinalTotalAmount] = useState<number>(
    initialSubtotal + shippingCharges
  );

  // Recalculate final total if subtotal or shipping changes, or if coupon is removed.
  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountAmount(0); // Ensure discount is 0 if no coupon is applied
      setFinalTotalAmount(initialSubtotal + shippingCharges);
    }
  }, [initialSubtotal, shippingCharges, appliedCoupon]);

  // State for address management
  const [address, setAddress] = useState<LocalAddressItem[]>([]);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<
    string | null
  >(null); // Primary selection
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<
    string | null
  >(null);
  const [useBillingAsDelivery, setUseBillingAsDelivery] = useState(true); // New: Checkbox for using billing as delivery
  const [addressIsLoading, setAddressIsLoading] = useState(true);
  const [addressHasError, setAddressHasError] = useState<string | null>(null);

  // State for address modal
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
  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");

  // Effect to fetch addresses on component mount or token change
  useEffect(() => {
    async function fetchAddresses() {
      if (!token) {
        setAddressIsLoading(false);
        setAddressHasError("Please log in to manage addresses.");
        return;
      }
      setAddressIsLoading(true);
      try {
        const data = await apiCore<FetchAddressesResponse>(
          "/address",
          "GET",
          undefined,
          token
        );
        const fetchedAddresses = data.address || [];
        setAddress(fetchedAddresses);

        if (fetchedAddresses.length > 0) {
          // Determine initial billing address
          const storedSelectedBillingId = localStorage.getItem(
            "selectedBillingAddressId"
          );
          const defaultBillingAddr =
            fetchedAddresses.find((a) => a.isDefault) || fetchedAddresses[0];
          const initialBillingId =
            storedSelectedBillingId &&
            fetchedAddresses.some((a) => a.id === storedSelectedBillingId)
              ? storedSelectedBillingId
              : defaultBillingAddr?.id;
          setSelectedBillingAddressId(initialBillingId || null);

          // Determine initial useBillingAsDelivery state
          const storedUseBillingAsDelivery = localStorage.getItem(
            "useBillingAsDelivery"
          );
          const initialUseBillingAsDelivery =
            storedUseBillingAsDelivery === "true"; // Convert string to boolean
          setUseBillingAsDelivery(initialUseBillingAsDelivery);

          // Determine initial delivery address based on useBillingAsDelivery
          if (initialUseBillingAsDelivery && initialBillingId) {
            setSelectedDeliveryAddressId(initialBillingId); // If using billing as delivery, set delivery ID to billing ID
          } else {
            const storedSelectedDeliveryId = localStorage.getItem(
              "selectedDeliveryAddressId"
            );
            const defaultDeliveryAddr =
              fetchedAddresses.find((a) => a.isDefault) || fetchedAddresses[0]; // Can be same default or specific delivery default
            const initialDeliveryId =
              storedSelectedDeliveryId &&
              fetchedAddresses.some((a) => a.id === storedSelectedDeliveryId)
                ? storedSelectedDeliveryId
                : defaultDeliveryAddr?.id;
            setSelectedDeliveryAddressId(initialDeliveryId || null);
          }
        } else {
          setAddressHasError("No addresses found. Please add new addresses.");
          setSelectedBillingAddressId(null);
          setSelectedDeliveryAddressId(null);
          setUseBillingAsDelivery(true); // Reset to default true if no addresses
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

  // Effect to store selected address IDs and checkbox state in local storage
  useEffect(() => {
    // Always store selected billing ID
    selectedBillingAddressId
      ? localStorage.setItem(
          "selectedBillingAddressId",
          selectedBillingAddressId
        )
      : localStorage.removeItem("selectedBillingAddressId");

    // Store the checkbox state
    localStorage.setItem("useBillingAsDelivery", String(useBillingAsDelivery));

    // If "use billing as delivery" is checked, ensure delivery address mirrors billing.
    if (useBillingAsDelivery && selectedBillingAddressId) {
      setSelectedDeliveryAddressId(selectedBillingAddressId);
      localStorage.removeItem("selectedDeliveryAddressId"); // Remove independent delivery ID
    } else if (!useBillingAsDelivery) {
      // Only store independent delivery ID if not using billing as delivery
      selectedDeliveryAddressId
        ? localStorage.setItem(
            "selectedDeliveryAddressId",
            selectedDeliveryAddressId
          )
        : localStorage.removeItem("selectedDeliveryAddressId");
    }
  }, [
    selectedBillingAddressId,
    selectedDeliveryAddressId,
    useBillingAsDelivery,
  ]);

  // Handler for toggling "Use Billing as Delivery"
  const handleToggleUseBillingAsDelivery = () => {
    const newToggleState = !useBillingAsDelivery;
    setUseBillingAsDelivery(newToggleState);
    if (newToggleState) {
      // If setting to true, automatically set delivery to billing
      setSelectedDeliveryAddressId(selectedBillingAddressId);
    }
    // If setting to false, the delivery address can be selected independently now (its state won't be changed here unless needed)
  };

  // Opens the modal for creating a new address
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

  // Opens the modal for editing an existing address
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
    setShowModal(true);
  };

  // Handles deleting an address
  const deleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    if (!token) {
      toast.error("You must be logged in to delete addresses.");
      return;
    }
    try {
      await apiCore<any>(`/address/${id}`, "DELETE", undefined, token);
      const remainingAddresses = address.filter((a) => a.id !== id);
      setAddress(remainingAddresses);

      // Adjust selected billing address if the deleted one was selected
      if (selectedBillingAddressId === id) {
        const newBillingId =
          remainingAddresses.length > 0 ? remainingAddresses[0].id : null;
        setSelectedBillingAddressId(newBillingId);
        // If useBillingAsDelivery is true, delivery will update via useEffect
      }

      // Adjust selected delivery address if the deleted one was selected and independent
      if (!useBillingAsDelivery && selectedDeliveryAddressId === id) {
        const newDeliveryId =
          remainingAddresses.length > 0 ? remainingAddresses[0].id : null;
        setSelectedDeliveryAddressId(newDeliveryId);
      }

      toast.success("Address deleted successfully!");
    } catch (err: any) {
      if (err.message && err.message.includes("P2003")) {
        toast.error(
          "This address cannot be deleted as it is associated with existing orders. Please contact support."
        );
      } else {
        toast.error("Failed to delete address: " + err.message);
      }
      console.error(err);
    }
  };

  // Handles changes in the address form
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if ((name === "phone" || name === "pincode") && !/^\d*$/.test(value))
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles submission of the address form (create/update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("You must be logged in to save addresses.");

    const { fullName, phone, pincode, city, state, addressLine } = formData;
    if (!fullName || !phone || !pincode || !city || !!state || !addressLine)
      // Fixed: Removed ! before state
      return toast.error("Please fill all required address fields.");
    if (!/^\d{10}$/.test(phone))
      return toast.error("Please enter a valid 10-digit phone number.");
    if (!/^\d{6}$/.test(pincode))
      return toast.error("Please enter a valid 6-digit pincode.");

    try {
      if (editingAddress) {
        const res = await apiCore<SingleAddressResponse>(
          `/address/${editingAddress.id}`,
          "PATCH",
          formData,
          token
        );
        setAddress((prev) =>
          prev.map((a) => (a.id === res.updated?.id ? res.updated : a))
        );
        toast.success("Address updated successfully!");
      } else {
        const res = await apiCore<SingleAddressResponse>(
          "/address",
          "POST",
          formData,
          token
        );
        const added = res.address!;
        setAddress((prev) => [...prev, added]);

        // If no billing address is selected, set this new one as billing
        if (!selectedBillingAddressId) {
          setSelectedBillingAddressId(added.id);
        }
        // If not using billing as delivery AND no delivery address is selected, set this new one as delivery.
        if (!useBillingAsDelivery && !selectedDeliveryAddressId) {
          setSelectedDeliveryAddressId(added.id);
        }
        toast.success("Address created successfully!");
      }
      setShowModal(false);
      setEditingAddress(null);
    } catch (err: any) {
      toast.error("Failed to save address: " + err.message);
      console.error(err);
    }
  };

  // Fetches available coupons from the backend
  const fetchCoupons = async () => {
    if (!token) {
      toast.error("Please log in to fetch coupons.");
      return;
    }
    try {
      const response = await apiCore<CouponApiResponse>(
        "/coupon",
        "GET",
        undefined,
        token
      );
      if (response.success) {
        setAvailableCoupons(response.data);
      } else {
        toast.error("Failed to fetch coupons.");
      }
    } catch (error: any) {
      toast.error("Error fetching coupons: " + error.message);
      console.error("Error fetching coupons:", error);
    }
  };

  // Copies coupon code to clipboard (kept for potential future use or if CheckCircle logic needs it)
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  // Applies a selected coupon
  const handleApplyCoupon = async (coupon: Coupon) => {
    if (!token) {
      toast.error("Please log in to apply coupons.");
      return;
    }
    if (cartLoading) {
      toast.error("Please wait, cart information is still loading.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty. Add items before applying a coupon.");
      return;
    }
    if (typeof cartId !== "number" || cartId <= 0) {
      toast.error(
        "Invalid Cart ID. Please ensure items are in your cart and it's loaded."
      );
      console.error("Attempted to apply coupon with invalid cartId:", cartId);
      return;
    }

    try {
      const payload = {
        code: coupon.code,
        cartId: cartId,
      };
      const response = await apiCore<CouponRedeemResponse>(
        "/coupon/redeem",
        "POST",
        payload,
        token
      );
      if (response.success) {
        setAppliedCoupon(coupon); // Store the full coupon object
        setDiscountAmount(response.discountAmount); // Use discount from API response
        setFinalTotalAmount(response.updatedTotalAmount); // Use total from API response
        toast.success(`Coupon "${coupon.name}" applied successfully!`);
        setShowCouponSection(false); // Hide coupon list after application
      } else {
        toast.error(response.message || "Failed to apply coupon.");
        setDiscountAmount(0); // Reset discount on failure
        setAppliedCoupon(null);
        setFinalTotalAmount(initialSubtotal + shippingCharges); // Recalculate to original total
      }
    } catch (error: any) {
      toast.error(
        "Error applying coupon: " + (error.message || "Unknown error")
      );
      console.error("Error applying coupon:", error);
      setDiscountAmount(0); // Reset discount on error
      setAppliedCoupon(null);
      setFinalTotalAmount(initialSubtotal + shippingCharges); // Recalculate to original total
    }
  };

  // Removes the currently applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalTotalAmount(initialSubtotal + shippingCharges); // Reset total
  };

  // Handles placing the order
  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return; // Prevent multiple clicks

    if (!selectedBillingAddressId)
      return toast.error("Please select a billing address.");
    if (!selectedDeliveryAddressId)
      return toast.error("Please select a delivery address.");
    if (items.length === 0)
      return toast.error(
        "Your cart is empty. Please add items to place an order."
      );
    if (!token) {
      router.push("/login");
      return;
    }
    if (cartLoading || addressIsLoading) {
      toast.error("Please wait until necessary data loads.");
      return;
    }
    if (typeof cartId !== "number" || cartId <= 0) {
      toast.error(
        "Cannot place order: Cart ID is missing or invalid. Please ensure your cart is loaded."
      );
      return;
    }

    setIsPlacingOrder(true); // Start animation

    const payload: LoggedInOrderPayload = {
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.sellingPrice,
        variantId: item.variantId || null,
      })),
      discountAmount: discountAmount,
      totalAmount: finalTotalAmount,
      paymentMethod,
      addressId: selectedDeliveryAddressId, // This is the delivery address
      billingAddressId: selectedBillingAddressId, // This is the billing address
      ...(appliedCoupon && { couponCode: appliedCoupon.code }), // Conditionally send coupon code
    };

    try {
      const order = await apiCore<OrderResponse>(
        "/order",
        "POST",
        payload,
        token
      );
      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/thank-you?orderId=${order.id || ""}`);
    } catch (err: any) {
      toast.error(err.message || "There was an error placing your order.");
      console.error(err);
    } finally {
      setIsPlacingOrder(false); // Stop animation
    }
  };

  // Helper function to render address list (delivery or billing)
  const renderAddressList = (
    addresses: LocalAddressItem[],
    selected: string | null,
    onSelect: (id: string) => void,
    type: "Delivery" | "Billing"
  ) => (
    <div className="space-y-3">
      {addresses.length === 0 && !addressIsLoading ? (
        <div
          onClick={openCreateModal}
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-36 text-gray-500 hover:border-[#213E5A] hover:text-[#213E5A] transition-colors"
        >
          <div className="text-4xl mb-1">+</div>
          <div className="font-semibold text-sm">
            Create First {type} Address
          </div>
        </div>
      ) : (
        <>
          {addresses.map((a) => (
            <div
              key={a.id}
              onClick={() => onSelect(a.id)}
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                selected === a.id
                  ? "border-[#213E5A] bg-[#e6f0f7] shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 text-base">
                    {a.fullName}
                  </p>
                  <p className="text-sm text-gray-700">{a.phone}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {a.addressLine}, {a.landmark && `${a.landmark}, `}
                    {a.city}, {a.state} - {a.pincode}
                  </p>
                </div>
                <div className="space-x-1 flex-shrink-0 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(a);
                    }}
                    className="py-1 px-2 text-[#213E5A] hover:text-[#1a324a] text-xs rounded-md cursor-pointer" // Added cursor-pointer
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(a.id);
                    }}
                    className="py-1 px-2 text-red-500 hover:text-red-600 text-xs rounded-md cursor-pointer" // Added cursor-pointer
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={openCreateModal}
            className="mt-3 text-[#213E5A] hover:text-[#1a324a] font-medium text-sm py-1.5 px-3 rounded-md border border-[#213E5A] hover:border-[#1a324a] cursor-pointer" // Added cursor-pointer
          >
            + Add New {type} Address
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="font-sans flex flex-col lg:flex-row gap-8 p-8 bg-[#F3F6F7] min-h-screen max-w-7xl mx-auto">
      {/* Custom CSS for loading animation */}
      <style jsx>{`
        /* Cart type loader */
        .cart-loader {
          width: 50px;
          height: 40px;
          position: relative;
          overflow: hidden;
          background: transparent;
        }

        .cart-loader::before {
          /* Cart body - outline */
          content: "";
          position: absolute;
          width: 30px;
          height: 20px;
          border: 2px solid white; /* White outline */
          border-radius: 3px;
          top: 10px;
          left: 5px;
          transform: skewX(-15deg);
          box-sizing: border-box; /* Include padding and border in the element's total width and height */
        }

        .cart-loader::after {
          /* Cart handle - outline */
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid white; /* White outline */
          top: 0;
          left: 28px;
          background: none;
          box-sizing: border-box;
        }

        .cart-loader .wheel {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white; /* Color of the wheels */
          position: absolute;
          bottom: 0;
          animation: wheel-spin 0.8s linear infinite;
        }

        .cart-loader .wheel.left {
          left: 8px;
        }

        .cart-loader .wheel.right {
          left: 28px;
        }

        @keyframes wheel-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .cart-loader .product {
          width: 8px; /* Slightly smaller product */
          height: 8px;
          background: rgba(255, 255, 255, 0.7); /* A subtle white "product" */
          position: absolute;
          top: 15px; /* Adjust position within the empty cart */
          left: 10px;
          animation: product-bounce 0.8s ease-in-out infinite;
          border-radius: 2px; /* Slightly rounded corners for product */
        }

        @keyframes product-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .cart-loader.running {
          animation: cart-run 0.8s linear infinite;
        }

        @keyframes cart-run {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(10px);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Billing Address Selection & Delivery Address Selection & Payment Method */}
      <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Billing Information
        </h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Select Billing Address
        </h3>
        {addressIsLoading ? (
          <p className="text-gray-600">Loading addresses...</p>
        ) : (
          addressHasError && <p className="text-red-500">{addressHasError}</p>
        )}
        {renderAddressList(
          address,
          selectedBillingAddressId,
          (id) => {
            setSelectedBillingAddressId(id);
            if (useBillingAsDelivery) {
              setSelectedDeliveryAddressId(id);
            }
          },
          "Billing"
        )}

        <div className="mt-8 pt-5 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Delivery Information
          </h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useBillingAsDelivery"
              checked={useBillingAsDelivery}
              onChange={handleToggleUseBillingAsDelivery}
              className="h-4 w-4 text-[#213E5A] focus:ring-[#213E5A] border-gray-300 rounded cursor-pointer" // Added cursor-pointer
            />
            <label
              htmlFor="useBillingAsDelivery"
              className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer" // Added cursor-pointer
            >
              Same as billing address
            </label>
          </div>

          {!useBillingAsDelivery && (
            <>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Select Delivery Address
              </h3>
              {addressIsLoading ? (
                <p className="text-gray-600">Loading addresses...</p>
              ) : (
                addressHasError && (
                  <p className="text-red-500">{addressHasError}</p>
                )
              )}
              {renderAddressList(
                address,
                selectedDeliveryAddressId,
                setSelectedDeliveryAddressId,
                "Delivery"
              )}
            </>
          )}
        </div>

        <div className="mt-8 pt-5 border-t border-gray-200">
          <label
            htmlFor="payment-method"
            className="block mb-2 font-semibold text-gray-700 text-sm"
          >
            Select Payment Method:
          </label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "COD" | "RAZORPAY")
            }
            className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] appearance-none text-sm cursor-pointer" // Added cursor-pointer
          >
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="RAZORPAY">Pay Online (Razorpay)</option>
          </select>
        </div>
      </div>

      {/* Cart Summary & Order Summary */}
      <div className="w-full lg:w-1/2 flex flex-col gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Product Summary
          </h2>
          {cartLoading ? (
            <p className="text-gray-600">Loading cart...</p>
          ) : cartError ? (
            <p className="text-red-500">{cartError}</p>
          ) : items.length === 0 ? (
            <p className="text-gray-600">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.cartItemId}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg shadow-sm bg-white"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    className="w-18 h-18 object-cover rounded-md border border-gray-100"
                  />
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {item.name}
                        </p>
                        {item.variant?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Variant: {item.variant.name}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-3">
                        ₹{(item.quantity * item.sellingPrice).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center mt-3 space-x-1">
                      <button
                        onClick={() => decrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity <= 1}
                        className="p-0.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-colors cursor-pointer" // Added cursor-pointer
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-1.5 py-0.5 font-medium text-gray-800 border border-gray-300 rounded-md text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementItemQuantity(item.cartItemId)}
                        className="p-0.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer" // Added cursor-pointer
                      >
                        <Plus size={14} />
                      </button>

                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="ml-auto p-0.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" // Added cursor-pointer
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Back to Shopping Button */}
          <Link
            href="/shop"
            className="mt-6 block w-full text-center bg-[#213E5A] text-white py-2 rounded-lg hover:bg-[#1a324a] transition-colors font-semibold text-sm cursor-pointer" // Updated background, text color, and added cursor-pointer
          >
            Back to Shopping
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Order Summary
          </h2>
          <div className="flex justify-between text-gray-700 py-1.5 border-b border-gray-200 text-base">
            <span>Subtotal:</span>
            <span className="font-semibold">₹{initialSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 py-1.5 border-b border-gray-200 text-base">
            <span>Shipping:</span>
            <span className="font-semibold">₹{shippingCharges.toFixed(2)}</span>
          </div>

          {/* Display discount if applied */}
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-700 py-1.5 border-b border-gray-200 text-base">
              <span>Discount ({appliedCoupon?.discount}%):</span>
              <span className="font-semibold">
                - ₹{discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between font-bold text-gray-900 text-lg pt-3 mt-1">
            <span>Total:</span>
            <span>₹{finalTotalAmount.toFixed(2)}</span>
          </div>

          {/* Applied Coupon Display */}
          {appliedCoupon && (
            <div className="mt-5 p-3 bg-[#D4EDDA] border border-[#AED6B4] text-[#155724] rounded-md text-sm">
              <p className="font-semibold">Coupon Applied:</p>
              <p>
                {appliedCoupon.name} (
                <span className="font-mono font-bold">
                  {appliedCoupon.code}
                </span>
                ) - {appliedCoupon.discount}% Off
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Expires:{" "}
                {new Date(appliedCoupon.expiresAt).toLocaleDateString()}
              </p>
              <button
                onClick={handleRemoveCoupon}
                className="mt-2 text-sm text-red-600 hover:underline py-0.5 px-1 rounded-md cursor-pointer" // Added cursor-pointer
              >
                Remove Coupon
              </button>
            </div>
          )}

          {/* Show/Hide Coupons Button */}
          {!appliedCoupon && (
            <button
              onClick={() => {
                if (cartLoading) {
                  toast.error("Please wait, cart information is loading.");
                  return;
                }
                setShowCouponSection(!showCouponSection);
                if (!showCouponSection) fetchCoupons(); // Fetch coupons when section is opened
              }}
              className="mt-5 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm cursor-pointer" // Added cursor-pointer
            >
              {showCouponSection ? "Hide Coupons" : "Apply Coupon"}
            </button>
          )}

          {/* Available Coupons List (Conditional Rendering) */}
          {showCouponSection && !appliedCoupon && (
            <div className="mt-5 pt-3 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 text-base">
                Available Coupons:
              </h3>
              {availableCoupons.length === 0 ? (
                <p className="text-gray-600 text-sm">No coupons available.</p>
              ) : (
                <ul className="space-y-2">
                  {availableCoupons.map((coupon) => (
                    <li
                      key={coupon.id}
                      className="flex items-center justify-between border border-gray-200 p-3 rounded-lg bg-white shadow-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {coupon.name} - {coupon.discount}% Off
                        </p>
                        <p className="font-mono text-gray-600 text-xs mt-0.5">
                          Code: <span className="font-bold">{coupon.code}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Expires:{" "}
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyCoupon(coupon)}
                        className="text-sm bg-[#E0F7FA] text-[#00796B] py-1 px-3 rounded-full hover:bg-[#B2EBF2] transition-colors font-medium cursor-pointer" // Added cursor-pointer
                      >
                        Apply
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Place Order Button with Unique Loading Animation */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || items.length === 0 || !token}
            className={`mt-6 w-full relative flex items-center justify-center bg-[#213E5A] text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              isPlacingOrder
                ? "cursor-not-allowed opacity-70"
                : "hover:bg-[#1a324a] cursor-pointer"
            }`}
          >
            {isPlacingOrder ? (
              <div className="flex items-center">
                <div className="cart-loader running mr-3">
                  <div className="product"></div> {/* Product inside cart */}
                  <div className="wheel left"></div>
                  <div className="wheel right"></div>
                </div>
                <span>Placing Order...</span>
              </div>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>

      {/* Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="addressLine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line (House No., Street Name)
                </label>
                <textarea
                  id="addressLine"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="landmark"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[#213E5A] focus:border-[#213E5A]"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium cursor-pointer" // Added cursor-pointer
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#213E5A] text-white rounded-md hover:bg-[#1a324a] transition-colors text-sm font-medium cursor-pointer" // Added cursor-pointer
                >
                  {editingAddress ? "Save Changes" : "Add Address"}
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
