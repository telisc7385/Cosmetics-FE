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
} from "@/api/ApiCore";
import { Minus, Plus, Trash2, CheckCircle } from "lucide-react";
// import Link from "next/link"; // Removed: 'Link' is defined but never used.

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
  const [showModal, setShowModal] = useState(false); // 'showModal' is now used in the JSX below
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
      } catch (err: unknown) {
        const error = err as Error;
        setAddressHasError("Failed to fetch addresses: " + error.message);
        console.error(error);
      } finally {
        setAddressIsLoading(false);
      }
    }
    fetchAddresses();
  }, [token]);

  // Effect to store selected address IDs and checkbox state in local storage
  useEffect(() => {
    // Always store selected billing ID
    if (selectedBillingAddressId) {
      localStorage.setItem(
        "selectedBillingAddressId",
        selectedBillingAddressId
      );
    } else {
      localStorage.removeItem("selectedBillingAddressId");
    }

    // Store the checkbox state
    localStorage.setItem("useBillingAsDelivery", String(useBillingAsDelivery));

    // If "use billing as delivery" is checked, ensure delivery address mirrors billing.
    if (useBillingAsDelivery && selectedBillingAddressId) {
      setSelectedDeliveryAddressId(selectedBillingAddressId);
      localStorage.removeItem("selectedDeliveryAddressId"); // Remove independent delivery ID
    } else if (!useBillingAsDelivery) {
      // Only store independent delivery ID if not using billing as delivery
      if (selectedDeliveryAddressId) {
        localStorage.setItem(
          "selectedDeliveryAddressId",
          selectedDeliveryAddressId
        );
      } else {
        localStorage.removeItem("selectedDeliveryAddressId");
      }
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
      // Adjusted `apiCore` call to use `unknown` and then type check for specific error messages
      const result = await apiCore<
        { message: string } | { error: string } // Expected response types
      >(`/address/${id}`, "DELETE", undefined, token);

      // Check if the result indicates an error message
      if ("error" in result && typeof result.error === "string") {
        throw new Error(result.error);
      }

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
    } catch (err: unknown) {
      const error = err as { message?: string } | Error; // Type assertion for potential error objects
      if (error.message && error.message.includes("P2003")) {
        toast.error(
          "This address cannot be deleted as it is associated with existing orders. Please contact support."
        );
      } else {
        toast.error(
          "Failed to delete address: " + (error.message || "Unknown error")
        );
      }
      console.error(error);
    }
  };

  // Handles changes in the address form
  const handleFormChange = (
    // 'handleFormChange' is now used in the AddressModal JSX
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if ((name === "phone" || name === "pincode") && !/^\d*$/.test(value))
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles submission of the address form (create/update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    // 'handleFormSubmit' is now used in the AddressModal JSX
    e.preventDefault();
    if (!token) return toast.error("You must be logged in to save addresses.");

    const { fullName, phone, pincode, city, state, addressLine } = formData;
    if (!fullName || !phone || !pincode || !city || !state || !addressLine)
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
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Failed to save address: " + error.message);
      console.error(error);
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
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Error fetching coupons: " + err.message);
      console.error("Error fetching coupons:", err);
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
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Error applying coupon: " + (err.message || "Unknown error"));
      console.error("Error applying coupon:", err);
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
      console.error("Attempted to place order with invalid cartId:", cartId);
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
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "There was an error placing your order.");
      console.error(error);
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
                      {/* Decrement button */}
                      <button
                        onClick={() => decrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity <= 1} // Disable if quantity is 1 or less
                        className="p-0.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-1.5 py-0.5 font-medium text-gray-800 border border-gray-300 rounded-md text-xs">
                        {item.quantity}
                      </span>
                      {/* Increment button - Disabled if quantity equals or exceeds stock */}
                      <button
                        onClick={() => incrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity >= item.stock} // Disable if quantity reaches available stock
                        className="p-0.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="ml-auto p-0.5 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {item.quantity >= item.stock && item.stock > 0 && (
                      <p className="text-red-500 text-xs mt-1">
                        Max quantity reached ({item.stock} in stock)
                      </p>
                    )}
                    {item.stock === 0 && (
                      <p className="text-red-500 text-xs mt-1">Out of stock</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Back to Shopping button added here, after the list of items */}
          <button
            onClick={() => router.push("/shop")} // Assuming '/shop' is the shopping page
            className={`
                       mt-6 w-full py-3 rounded-md font-semibold transition-all duration-200
                       bg-[#1F3958] text-white
                       hover:bg-white hover:text-[#1F3958] hover:border hover:border-[#1F3958] cursor-pointer
            `}
          >
            Back to Shopping
          </button>
          <hr className="my-6 border-gray-200" />
          <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
            <span>Subtotal:</span>
            <span>₹{initialSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
            <span>Shipping:</span>
            <span>₹{shippingCharges.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between items-center text-sm text-green-600 mt-2">
              <span>
                <CheckCircle size={18} className="inline mr-2" />
                Coupon ({appliedCoupon.code} - {appliedCoupon.discount}% off):
              </span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <hr className="my-6 border-gray-200" />
          <div className="flex justify-between items-center text-xl font-bold text-gray-900">
            <span>Total:</span>
            <span>₹{finalTotalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Coupons</h2>
          {!appliedCoupon ? (
            <button
              onClick={() => {
                setShowCouponSection(!showCouponSection);
                if (!showCouponSection) fetchCoupons(); // Fetch coupons only when expanding
              }}
              className="w-full text-[#213E5A] hover:bg-[#e6f0f7] py-2 px-4 rounded-md border border-[#213E5A] transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {showCouponSection ? "Hide Available Coupons" : "Apply Coupon"}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex justify-between items-center">
              <span>
                <CheckCircle size={18} className="inline mr-2" />
                Coupon Applied:{" "}
                <span className="font-semibold">{appliedCoupon.code}</span>
              </span>
              <button
                onClick={handleRemoveCoupon}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {showCouponSection && !appliedCoupon && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              {availableCoupons.length === 0 ? (
                <p className="text-gray-600">No coupons available.</p>
              ) : (
                <ul className="space-y-3">
                  {availableCoupons.map((coupon) => (
                    <li
                      key={coupon.id}
                      className="border border-gray-200 rounded-md p-3 bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {coupon.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Code: <span className="font-mono">{coupon.code}</span>{" "}
                          | Discount: {coupon.discount}%
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires:{" "}
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {copiedCouponCode === coupon.code ? (
                          <span className="text-green-500">Copied!</span>
                        ) : (
                          <button
                            onClick={() => handleCopyCoupon(coupon.code)}
                            className="text-sm text-[#213E5A] hover:underline"
                          >
                            Copy
                          </button>
                        )}
                        <button
                          onClick={() => handleApplyCoupon(coupon)}
                          className="bg-[#213E5A] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#1a324a] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={
            items.length === 0 ||
            isPlacingOrder ||
            !selectedBillingAddressId ||
            !selectedDeliveryAddressId
          }
          className="w-full bg-[#213E5A] text-white py-4 rounded-lg text-lg font-bold hover:bg-[#1a324a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-3"
        >
          {isPlacingOrder && (
            <div className="cart-loader">
              <div className="wheel left"></div>
              <div className="wheel right"></div>
              <div className="product"></div>
            </div>
          )}
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </button>
      </div>

      {/* Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md md:max-w-lg lg:max-w-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
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
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
                  maxLength={10}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
                    required
                  />
                </div>
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="addressLine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address Line (House No., Building, Street)
                </label>
                <textarea
                  id="addressLine"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-[#213E5A] focus:border-[#213E5A]"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#213E5A] text-white rounded-md hover:bg-[#1a324a] transition-colors"
                >
                  {editingAddress ? "Update Address" : "Save Address"}
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
