"use client";

import React, { JSX, useEffect, useState } from "react";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider"; // Ensure this path is correct
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import Link from "next/link";
import {
  apiCore,
  LoggedInOrderPayload,
  OrderResponse,
  LocalAddressItem,
  FetchAddressesResponse,
  SingleAddressResponse,
  AddressInput,
} from "@/api/ApiCore"; // Ensure ApiCore types are correctly defined
import { Minus, Plus, Trash2 } from "lucide-react";
import { FaTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";

// Coupon types from your /coupon API response
interface Coupon {
  id: number;
  name: string;
  code: string;
  discount: number; // This is the discount percentage (e.g., 10 for 10%)
  expiresAt: string; // ISO string format
  // Other fields like userId, cartId, used, createdAt, user, cart are not directly used in frontend logic here.
}

interface CouponApiResponse {
  success: boolean;
  data: Coupon[];
}

// Type for the /coupon/redeem API response
// These MUST be the actual calculated monetary values from your backend
interface CouponRedeemResponse {
  success: boolean;
  message: string;
  data: {
    couponCode: string;
    discount: number; // The actual calculated discount amount in currency (e.g., 50.00)
  };
}

const UserCheckout = () => {
  const {
    items,
    error: cartError,
    loading: cartLoading,
    incrementItemQuantity,
    decrementItemQuantity,
    removeCartItem,
    clearCart,
    cartId,
  } = useLoggedInCart();
  const router = useRouter();
  const token = useAppSelector(selectToken);

  // Calculate subtotal from current cart items.
  const initialSubtotal = (items || []).reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  const shippingCharges: number = 0;

  // State for coupons and amounts
  const [showCouponSection, setShowCouponSection] = useState<boolean>(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalTotalAmount, setFinalTotalAmount] = useState<number>(
    Number(initialSubtotal) + Number(shippingCharges)
  );
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false); // State for order placement animation

  // Recalculate final total if subtotal, shipping, or coupon status changes.
  useEffect(() => {
    // If there's an applied coupon and a discount amount, use them.
    // Otherwise, calculate total based on subtotal and shipping.
    if (appliedCoupon && discountAmount > 0) {
      setFinalTotalAmount(
        Number(initialSubtotal) + Number(shippingCharges) - discountAmount
      );
    } else {
      setFinalTotalAmount(Number(initialSubtotal) + Number(shippingCharges));
    }
  }, [initialSubtotal, shippingCharges, appliedCoupon, discountAmount]);

  // State for address management
  const [address, setAddress] = useState<LocalAddressItem[]>([]);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<
    string | null
  >(null);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<
    string | null
  >(null);
  const [useBillingAsDelivery, setUseBillingAsDelivery] =
    useState<boolean>(true);
  const [addressIsLoading, setAddressIsLoading] = useState<boolean>(true);
  const [addressHasError, setAddressHasError] = useState<string | null>(null);

  // State for address modal
  const [showModal, setShowModal] = useState<boolean>(false);
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

          const storedUseBillingAsDelivery = localStorage.getItem(
            "useBillingAsDelivery"
          );
          const initialUseBillingAsDelivery =
            storedUseBillingAsDelivery === "true";
          setUseBillingAsDelivery(initialUseBillingAsDelivery);

          if (initialUseBillingAsDelivery && initialBillingId) {
            setSelectedDeliveryAddressId(initialBillingId);
          } else {
            const storedSelectedDeliveryId = localStorage.getItem(
              "selectedDeliveryAddressId"
            );
            const defaultDeliveryAddr =
              fetchedAddresses.find((a) => a.isDefault) || fetchedAddresses[0];
            const initialDeliveryId =
              storedSelectedDeliveryId &&
              fetchedAddresses.some((a) => a.id === storedSelectedDeliveryId)
                ? storedSelectedDeliveryId
                : defaultDeliveryAddr?.id;
            setSelectedDeliveryAddressId(initialDeliveryId || null);
          }
        } else {
          setSelectedBillingAddressId(null);
          setSelectedDeliveryAddressId(null);
          setUseBillingAsDelivery(true);
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
    if (selectedBillingAddressId) {
      localStorage.setItem(
        "selectedBillingAddressId",
        selectedBillingAddressId
      );
    } else {
      localStorage.removeItem("selectedBillingAddressId");
    }

    localStorage.setItem("useBillingAsDelivery", String(useBillingAsDelivery));

    if (useBillingAsDelivery && selectedBillingAddressId) {
      setSelectedDeliveryAddressId(selectedBillingAddressId);
      localStorage.removeItem("selectedDeliveryAddressId");
    } else if (!useBillingAsDelivery) {
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
  const handleToggleUseBillingAsDelivery = (): void => {
    const newToggleState = !useBillingAsDelivery;
    setUseBillingAsDelivery(newToggleState);
    if (newToggleState) {
      setSelectedDeliveryAddressId(selectedBillingAddressId);
    }
  };

  // Opens the modal for creating a new address
  const openCreateModal = (): void => {
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
  const openEditModal = (addr: LocalAddressItem): void => {
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
  const deleteAddress = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    if (!token) {
      toast.error("You must be logged in to delete addresses.");
      return;
    }
    try {
      const result = await apiCore<{ message: string } | { error: string }>(
        `/address/${id}`,
        "DELETE",
        undefined,
        token
      );

      if ("error" in result && typeof result.error === "string") {
        throw new Error(result.error);
      }

      const remainingAddresses = address.filter((a) => a.id !== id);
      setAddress(remainingAddresses);

      if (selectedBillingAddressId === id) {
        const newBillingId =
          remainingAddresses.length > 0 ? remainingAddresses[0].id : null;
        setSelectedBillingAddressId(newBillingId);
      }

      if (!useBillingAsDelivery && selectedDeliveryAddressId === id) {
        const newDeliveryId =
          remainingAddresses.length > 0 ? remainingAddresses[0].id : null;
        setSelectedDeliveryAddressId(newDeliveryId);
      }

      toast.success("Address deleted successfully!");
    } catch (err: unknown) {
      const error = err as { message?: string } | Error;
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    // Allow only digits for phone and pincode
    if ((name === "phone" || name === "pincode") && !/^\d*$/.test(value))
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles submission of the address form (create/update)
  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to save addresses.");
      return;
    }

    const { fullName, phone, pincode, city, state, addressLine } = formData;
    if (!fullName || !phone || !pincode || !city || !state || !addressLine) {
      toast.error("Please fill all required address fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      if (editingAddress) {
        const res = await apiCore<SingleAddressResponse>(
          `/address/${editingAddress.id}`,
          "PATCH",
          formData,
          token
        );
        // Map over previous addresses to update the one that was edited
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
        const added = res.address!; // Assuming `address` property holds the new address
        setAddress((prev) => [...prev, added]);

        // If no billing address is selected, set the new one as default
        if (!selectedBillingAddressId) {
          setSelectedBillingAddressId(added.id);
        }
        // If not using billing as delivery and no delivery address is selected, set new one as default
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
  const fetchCoupons = async (): Promise<void> => {
    if (!token) {
      toast.error("Please log in to fetch coupons.");
      return;
    }
    // Only fetch if cartId is available and valid
    if (typeof cartId !== "number" || cartId <= 0) {
      toast.error(
        "Cannot fetch coupons: Invalid Cart ID. Please ensure your cart is loaded."
      );
      console.error("Attempted to fetch coupons with invalid cartId:", cartId);
      return;
    }

    try {
      // For GET request, send cartId as a query parameter
      const response = await apiCore<CouponApiResponse>(
        "/coupon",
        "POST", // Use GET method as specified
        {cartid:cartId}, // No request body for GET with query parameters
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

  // Copies coupon code to clipboard
  const handleCopyCoupon = (code: string): void => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

  // Applies a selected coupon
  const handleApplyCoupon = async (coupon: Coupon): Promise<void> => {
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
      // Expecting backend to return actual calculated discount and total amounts
      const response = await apiCore<CouponRedeemResponse>(
        "/coupon/redeem",
        "POST",
        payload,
        token
      );

      if (response.success) {
        setAppliedCoupon(coupon); // Store the full coupon object

        // CRITICAL: Use response.data.discount for the actual calculated discount amount.
        setDiscountAmount(Number(response.data.discount));

        // Recalculate final total based on the new discount
        setFinalTotalAmount(
          Number(initialSubtotal) + Number(shippingCharges) - Number(response.data.discount)
        );

        toast.success(`Coupon "${coupon.name}" applied successfully!`);
        setShowCouponSection(false); // Hide coupon list after successful application
      } else {
        // Handle API-specific messages for failed coupon application
        toast.error(response.message || "Failed to apply coupon.");
        setDiscountAmount(0); // Reset discount on failure
        setAppliedCoupon(null);
        // Recalculate total to ensure it reflects current subtotal if coupon failed.
        setFinalTotalAmount(Number(initialSubtotal) + Number(shippingCharges));
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Error applying coupon: " + (err.message || "Unknown error"));
      console.error("Error applying coupon:", err);
      setDiscountAmount(0); // Reset discount on error
      setAppliedCoupon(null);
      // Recalculate total to ensure it reflects current subtotal if error
      setFinalTotalAmount(Number(initialSubtotal) + Number(shippingCharges));
    }
  };

  // Removes the currently applied coupon
  const handleRemoveCoupon = (): void => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    // When coupon is removed, revert total to subtotal + shipping.
    setFinalTotalAmount(Number(initialSubtotal) + Number(shippingCharges));
  };

  // Handles placing the order
  const handlePlaceOrder = async (): Promise<void> => {
    if (isPlacingOrder) return; // Prevent multiple clicks

    if (!selectedBillingAddressId) {
      toast.error("Please select a billing address.");
      return;
    }
    if (!selectedDeliveryAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items to place an order.");
      return;
    }
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
      // Ensure discountAmount and finalTotalAmount are sent as numbers to the backend
      discountAmount: Number(discountAmount),
      totalAmount: Number(finalTotalAmount),
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
      clearCart(); // Clear cart after successful order
      router.push(`/thank-you?orderId=${order.id || ""}`); // Redirect to thank you page
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
  ): JSX.Element => (
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
                  <p className="font-semibold text-[#213E5A] text-base">
                    {a.fullName}
                  </p>
                  <p className="text-sm text-[#213E5A]">{a.phone}</p>
                  <p className="text-sm text-[#213E5A] mt-1">
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
                    className="py-1 px-2 text-[#213E5A] hover:text-[#1a324a] text-xs rounded-md cursor-pointer"
                  >
                    <CiEdit className="text-blue-500 size-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(a.id);
                    }}
                    className="py-1 px-2 text-red-500 hover:text-red-600 text-xs rounded-md cursor-pointer"
                  >
                    <FaTrashAlt className="text-red-500 size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={openCreateModal}
            className="mt-3 text-[#213E5A] hover:text-[#1a324a] font-medium text-sm py-1.5 px-3 rounded-md border border-[#213E5A] hover:border-[#1a324a] cursor-pointer"
          >
            + Add New {type} Address
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="font-sans flex flex-col lg:flex-row gap-8 p-3 sm:p-8 bg-[#F3F6F7] min-h-screen max-w-7xl mx-auto">
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
      <div className="w-full lg:w-1/2 bg-white p-3 rounded-lg shadow-md">
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
              className="h-4 w-4 text-[#213E5A] focus:ring-[#213E5A] border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="useBillingAsDelivery"
              className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer"
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
            className="w-full text-[#213E5A] border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] appearance-none text-sm cursor-pointer"
          >
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="RAZORPAY">Pay Online (Razorpay)</option>
          </select>
        </div>
      </div>

      {/* Cart Summary & Order Summary */}
      <div className="w-full lg:w-1/2 flex flex-col gap-8">
        <div className="bg-white p-3 rounded-lg shadow-md">
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
                  {/* Link for Image */}
                  <Link href={`/product/${item.slug}`} className="block">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={72}
                      height={72}
                      className="w-18 h-18 object-cover rounded-md border border-gray-100"
                    />
                  </Link>
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        {/* Link for Product Title */}
                        <Link href={`/product/${item.slug}`} className="block">
                          <p className="text-base font-semibold text-gray-900 hover:text-[#213E5A] transition-colors">
                            {item.name}
                          </p>
                        </Link>
                        {item.variant?.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            Variant: {item.variant.name}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap ml-3">
                        ₹
                        {/* Ensure item.quantity and item.sellingPrice are numbers before multiplication */}
                        {(
                          (item.quantity || 0) * (item.sellingPrice || 0)
                        ).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center mt-3 space-x-1">
                      <button
                        onClick={() => incrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity >= item.stock}
                        className="p-0.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="px-1.5 py-0.5 font-medium text-gray-800 border border-gray-300 rounded-md text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => decrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity <= 1}
                        className="p-0.5 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="ml-auto p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coupon Section */}
        <div className="bg-white p-3 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Coupons</h2>
          {!appliedCoupon ? (
            <button
              onClick={() => {
                setShowCouponSection(!showCouponSection);
                if (!showCouponSection) {
                  fetchCoupons(); // Fetch coupons when the section is expanded
                }
              }}
              className="w-full bg-[#213E5A] text-white py-2 rounded-md hover:bg-[#1a324a] transition-colors font-semibold"
            >
              {showCouponSection ? "Hide Coupons" : "Apply Coupon"}
            </button>
          ) : (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
              <div>
                <p className="font-semibold text-green-700">
                  Applied: {appliedCoupon.name} ({appliedCoupon.code})
                </p>
                <p className="text-sm text-green-600">
                  Discount: ₹{discountAmount.toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="ml-3 py-1 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          {showCouponSection && (
            <div className="mt-4 border-t pt-4 border-gray-200">
              {availableCoupons.length === 0 ? (
                <p className="text-gray-600">No available coupons at the moment.</p>
              ) : (
                <ul className="space-y-3">
                  {availableCoupons.map((coupon) => (
                    <li
                      key={coupon.id}
                      className="border border-gray-200 rounded-lg p-3 flex justify-between items-center bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{coupon.name}</p>
                        <p className="text-sm text-gray-600">Code: {coupon.code}</p>
                        <p className="text-sm text-gray-600">
                          Discount: {coupon.discount}%
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className={`py-1 px-3 text-xs rounded-md transition-colors ${
                            copiedCouponCode === coupon.code
                              ? "bg-blue-500 text-white"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {copiedCouponCode === coupon.code ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleApplyCoupon(coupon)}
                          className="py-1 px-3 bg-[#213E5A] text-white text-xs rounded-md hover:bg-[#1a324a] transition-colors"
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

        {/* Order Summary */}
        <div className="bg-white p-3 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Order Summary
          </h2>
          <div className="space-y-2 text-gray-700 text-base">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">₹{initialSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="font-medium">₹{shippingCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-700">
              <span>Coupon Discount:</span>
              <span className="font-medium">- ₹{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>₹{finalTotalAmount.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || items.length === 0 || !selectedDeliveryAddressId || !selectedBillingAddressId}
            className={`mt-6 w-full py-3 rounded-md font-bold text-white transition-colors flex items-center justify-center gap-2 ${
              isPlacingOrder || items.length === 0 || !selectedDeliveryAddressId || !selectedBillingAddressId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#213E5A] hover:bg-[#1a324a]"
            }`}
          >
            {isPlacingOrder ? (
              <>
                <div className="cart-loader running">
                  <div className="wheel left"></div>
                  <div className="wheel right"></div>
                  <div className="product"></div>
                </div>
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>

      {/* Address Modal (remains unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              &times;
            </button>
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
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                  maxLength={6}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
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
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="addressLine"
                  className="block text-sm font-medium text-gray-700 mb-1"
                  >
                  Address Line (House No., Building, Street, Area)
                </label>
                <textarea
                  id="addressLine"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#213E5A] text-white py-2 rounded-md hover:bg-[#1a324a] transition-colors font-semibold"
              >
                {editingAddress ? "Update Address" : "Add Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCheckout;