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
  AddressInput, // Import the updated CartItem interface
} from "@/api/ApiCore"; // Ensure ApiCore types are correctly defined
import { Minus, Plus, Trash2 } from "lucide-react";
import { FaTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";

// Coupon types based on your /coupon/user-coupon API response
interface Coupon {
  id: number;
  name: string;
  code: string;
  discount: number; // This is the discount value (e.g., 15 for 15%)
  expiresAt: string; // ISO string format
  createdAt: string;
  show_on_homepage: boolean;
  redeemCount: number;
  maxRedeemCount: number;
}

interface CouponApiResponse {
  success: boolean;
  data: Coupon[];
}

interface CouponRedeemResponse {
  success: boolean;
  message: string;
  data: {
    couponCode: string;
  };
}

// Define AddressType for clear distinction for the modal's context
type AddressCreationIntent = "BILLING" | "SHIPPING" | "HOME" | "WORK"; // Updated to use backend 'type' values

const UserCheckout = () => {
  const {
    items, // items should now conform to the updated CartItem interface
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

  const initialSubtotal = React.useMemo(() => {
    return (items || []).reduce(
      (sum, item) => sum + item.quantity * item.sellingPrice,
      0
    );
  }, [items]);

  const shippingCharges: number = 0;

  const [showCouponSection, setShowCouponSection] = useState<boolean>(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalTotalAmount, setFinalTotalAmount] = useState<number>(0);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  useEffect(() => {
    let calculatedTotal = initialSubtotal + shippingCharges;
    if (appliedCoupon && discountAmount > 0) {
      calculatedTotal -= discountAmount;
    }
    setFinalTotalAmount(Math.max(0, calculatedTotal));
  }, [initialSubtotal, shippingCharges, appliedCoupon, discountAmount]);

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
    type: "HOME", // Default type when creating a new address
  });
  const [, setAddressCreationIntent] = useState<AddressCreationIntent | null>(
    null
  );

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");

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
          // Initialize billing address selection - filter by type 'BILLING'
          const storedSelectedBillingId = localStorage.getItem(
            "selectedBillingAddressId"
          );
          const billingAddresses = fetchedAddresses.filter(
            (a) => a.type === "BILLING"
          );
          const defaultBillingAddr =
            billingAddresses.find((a) => a.isDefault) || billingAddresses[0];
          const initialBillingId =
            storedSelectedBillingId &&
            billingAddresses.some((a) => a.id === storedSelectedBillingId)
              ? storedSelectedBillingId
              : defaultBillingAddr?.id;
          setSelectedBillingAddressId(initialBillingId || null);

          const storedUseBillingAsDelivery = localStorage.getItem(
            "useBillingAsDelivery"
          );
          const initialUseBillingAsDelivery =
            storedUseBillingAsDelivery === "true";
          setUseBillingAsDelivery(initialUseBillingAsDelivery);

          // Initialize delivery address selection - filter by type 'SHIPPING' or 'HOME'/'WORK'
          if (initialUseBillingAsDelivery && initialBillingId) {
            setSelectedDeliveryAddressId(initialBillingId);
          } else {
            const storedSelectedDeliveryId = localStorage.getItem(
              "selectedDeliveryAddressId"
            );
            // Consider addresses with type 'SHIPPING', 'HOME', or 'WORK' as delivery options
            const deliveryAddresses = fetchedAddresses.filter(
              (a) =>
                a.type === "SHIPPING" || a.type === "HOME" || a.type === "WORK"
            );
            const defaultDeliveryAddr =
              deliveryAddresses.find((a) => a.isDefault) ||
              deliveryAddresses[0];
            const initialDeliveryId =
              storedSelectedDeliveryId &&
              deliveryAddresses.some((a) => a.id === storedSelectedDeliveryId)
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

  const handleToggleUseBillingAsDelivery = (): void => {
    const newToggleState = !useBillingAsDelivery;
    setUseBillingAsDelivery(newToggleState);
    if (newToggleState) {
      setSelectedDeliveryAddressId(selectedBillingAddressId);
    } else {
      setSelectedDeliveryAddressId(null);
    }
  };

  const openCreateModal = (intent: AddressCreationIntent): void => {
    setFormData({
      fullName: "",
      phone: "",
      pincode: "",
      state: "",
      city: "",
      addressLine: "",
      landmark: "",
      type: intent, // Set the type directly based on intent
    });
    setEditingAddress(null);
    setAddressCreationIntent(intent);
    setShowModal(true);
  };

  const openEditModal = (addr: LocalAddressItem): void => {
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      state: addr.state,
      city: addr.city,
      addressLine: addr.addressLine,
      landmark: addr.landmark || "",
      type: addr.type, // Preserve existing type when editing
    });
    setEditingAddress(addr);
    setAddressCreationIntent(null);
    setShowModal(true);
  };

  const deleteAddress = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    if (!token) {
      toast.error("You must be logged in to delete addresses.");
      return;
    }

    await toast.promise(
      (async () => {
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

        // Adjust selected addresses if the deleted one was selected
        if (selectedBillingAddressId === id) {
          const newBillingId =
            remainingAddresses.filter((a) => a.type === "BILLING").length > 0
              ? remainingAddresses.filter((a) => a.type === "BILLING")[0].id
              : null;
          setSelectedBillingAddressId(newBillingId);
        }

        if (
          !useBillingAsDelivery &&
          selectedDeliveryAddressId === id &&
          remainingAddresses.filter(
            (a) =>
              a.type === "SHIPPING" || a.type === "HOME" || a.type === "WORK"
          ).length > 0
        ) {
          const newDeliveryId =
            remainingAddresses.filter(
              (a) =>
                a.type === "SHIPPING" || a.type === "HOME" || a.type === "WORK"
            )[0]?.id || null;
          setSelectedDeliveryAddressId(newDeliveryId);
        } else if (useBillingAsDelivery && selectedBillingAddressId === id) {
          setSelectedDeliveryAddressId(null);
        }
        return "Address deleted successfully!";
      })(),
      {
        loading: "Deleting address...",
        success: (message) => message,
        error: (err) => {
          const error = err as { message?: string } | Error;
          if (error.message && error.message.includes("P2003")) {
            return "This address cannot be deleted as it is associated with existing orders. Please contact support.";
          }
          return (
            "Failed to delete address: " + (error.message || "Unknown error")
          );
        },
      }
    );
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    if ((name === "phone" || name === "pincode") && !/^\d*$/.test(value))
      return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) {
      toast.error("You must be logged in to save addresses.");
      return;
    }

    const { fullName, phone, pincode, city, state, addressLine, type } =
      formData;
    if (
      !fullName ||
      !phone ||
      !pincode ||
      !city ||
      !state ||
      !addressLine ||
      !type
    ) {
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

    await toast.promise(
      (async () => {
        if (editingAddress) {
          // UPDATE existing address
          const res = await apiCore<SingleAddressResponse>(
            `/address/${editingAddress.id}`,
            "PATCH",
            formData,
            token
          );
          setAddress((prev) =>
            prev.map((a) => (a.id === res.updated?.id ? res.updated : a))
          );
          return "Address updated successfully!";
        } else {
          // CREATE new address
          const res = await apiCore<SingleAddressResponse>(
            "/address",
            "POST",
            formData,
            token
          );
          const added = res.address!;
          setAddress((prev) => [...prev, added]);

          // Automatically select the new address based on its type
          if (added.type === "BILLING") {
            setSelectedBillingAddressId(added.id);
            if (useBillingAsDelivery) {
              setSelectedDeliveryAddressId(added.id);
            }
          } else if (
            added.type === "SHIPPING" ||
            added.type === "HOME" ||
            added.type === "WORK"
          ) {
            setSelectedDeliveryAddressId(added.id);
            setUseBillingAsDelivery(false);
          }
          return "Address created successfully!";
        }
      })(),
      {
        loading: editingAddress ? "Updating address..." : "Creating address...",
        success: (message) => message,
        error: (err) => {
          const error = err as Error;
          return "Failed to save address: " + error.message;
        },
      }
    );
    setShowModal(false);
    setEditingAddress(null);
    setAddressCreationIntent(null);
  };

  const fetchCoupons = async (): Promise<void> => {
    if (!token) {
      toast.error("Please log in to fetch coupons.");
      return;
    }
    if (typeof cartId !== "number" || cartId <= 0) {
      toast.error(
        "Cannot fetch coupons: Invalid Cart ID. Please ensure your cart is loaded."
      );
      console.error("Attempted to fetch coupons with invalid cartId:", cartId);
      return;
    }

    try {
      const response = await apiCore<CouponApiResponse>(
        `/coupon/user-coupon`,
        "POST",
        { cartId: cartId },
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

  const handleCopyCoupon = (code: string): void => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCouponCode(null), 2000);
  };

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
      const response = await apiCore<CouponRedeemResponse>(
        "/coupon/redeem",
        "POST",
        payload,
        token
      );

      if (response.success) {
        setAppliedCoupon(coupon);

        const calculatedDiscountAmount =
          initialSubtotal * (coupon.discount / 100);
        setDiscountAmount(Number(calculatedDiscountAmount.toFixed(2)));

        toast.success(`Coupon "${coupon.name}" applied successfully!`);
        setShowCouponSection(false);
      } else {
        toast.error(response.message || "Failed to apply coupon.");
        setDiscountAmount(0);
        setAppliedCoupon(null);
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error("Error applying coupon: " + (err.message || "Unknown error"));
      console.error("Error applying coupon:", err);
      setDiscountAmount(0);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = (): void => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (isPlacingOrder) return;

    // Retrieve the actual address objects based on selected IDs
    const billingAddressObj = address.find(
      (a) => a.id === selectedBillingAddressId
    );
    const deliveryAddressObj = address.find(
      (a) => a.id === selectedDeliveryAddressId
    );

    if (!billingAddressObj) {
      toast.error("Please select a valid billing address.");
      return;
    }
    if (!deliveryAddressObj) {
      toast.error("Please select a valid delivery address.");
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
    // Ensure cartId is valid before proceeding
    if (typeof cartId !== "number" || cartId <= 0) {
      toast.error(
        "Cannot place order: Cart ID is missing or invalid. Please ensure your cart is loaded."
      );
      console.error("Attempted to place order with invalid cartId:", cartId);
      return;
    }

    setIsPlacingOrder(true);

    // Format the address objects into strings for the payload
    const formattedBillingAddress = `${billingAddressObj.addressLine}, ${
      billingAddressObj.landmark ? billingAddressObj.landmark + ", " : ""
    }${billingAddressObj.city}, ${billingAddressObj.state} - ${
      billingAddressObj.pincode
    }`;
    const formattedShippingAddress = `${deliveryAddressObj.addressLine}, ${
      deliveryAddressObj.landmark ? deliveryAddressObj.landmark + ", " : ""
    }${deliveryAddressObj.city}, ${deliveryAddressObj.state} - ${
      deliveryAddressObj.pincode
    }`;

    // Construct the payload with the EXACT NEW STRUCTURE provided
    const payload: LoggedInOrderPayload = {
      items: items.map((item) => ({
        // Use item.productId directly as it's now mandatory on CartItem
        // Fallback to item.product?.id or item.id if productId might still be an issue with your actual data source
        productId: item.productId || item.product?.id || item.id, // Ensure productId is a number
        quantity: item.quantity,
        price: item.sellingPrice,
        // Use item.variantId directly as it's now mandatory on CartItem (can be null)
        // Fallback to item.variant?.id if variantId might still be an issue with your actual data source
        variantId: item.variantId || item.variant?.id || null, // Ensure variantId is number or null
      })),
      addressId: Number(deliveryAddressObj.id), // Ensure addressId is a NUMBER
      totalAmount: Number(finalTotalAmount),
      paymentMethod,
      discountAmount: Number(discountAmount),
      ...(appliedCoupon && { discountCode: appliedCoupon.code }), // Include discountCode if a coupon is applied
      billingAddress: formattedBillingAddress,
      shippingAddress: formattedShippingAddress,
      cartId: cartId, // CartId is now always expected as a number by this payload (if it was optional, remove this line)
      subtotal: Number(initialSubtotal), // Include subtotal
    };

    // --- CRUCIAL DEBUGGING LOGS (Keep these!) ---
    console.log("Order Payload BEFORE sending to apiCore:", payload);
    try {
      // This log attempts to stringify to catch serialization issues *before* apiCore
      console.log(
        "Attempting to JSON.stringify payload for verification:",
        JSON.stringify(payload)
      );
    } catch (e) {
      console.error(
        "Error stringifying payload (potential circular reference or invalid data):",
        e
      );
      toast.error("Internal error: Could not prepare order data.");
      setIsPlacingOrder(false);
      return;
    }
    // --- END CRUCIAL DEBUGGING LOGS ---

    try {
      const order = await apiCore<OrderResponse>(
        "/order",
        "POST",
        payload, // Pass the OBJECT, apiCore will stringify it
        token
      );
      toast.success("Order placed successfully!");
      clearCart();
      router.push(
        // Pass formatted addresses for thank-you page if needed
        `/thank-you?orderId=${
          order.id || ""
        }&billingAddress=${encodeURIComponent(
          formattedBillingAddress
        )}&shippingAddress=${encodeURIComponent(formattedShippingAddress)}`
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "There was an error placing your order.");
      console.error(error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Helper function to render address list (delivery or billing)
  const renderAddressList = (
    addressesToRender: LocalAddressItem[],
    selected: string | null,
    onSelect: (id: string) => void,
    type: "Billing" | "Delivery" // Type for display purposes
  ): JSX.Element => (
    <div className="space-y-3">
      {addressesToRender.length === 0 && !addressIsLoading ? (
        <div
          onClick={() =>
            openCreateModal(type === "Billing" ? "BILLING" : "SHIPPING")
          } // Pass backend 'type' for creation
          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-36 text-gray-500 hover:border-[#213E5A] hover:text-[#213E5A] transition-colors"
        >
          <div className="text-4xl mb-1">+</div>
          <div className="font-semibold text-sm">
            Create First {type} Address
          </div>
        </div>
      ) : (
        <>
          {addressesToRender.map((a) => (
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
                  {/* Display address type */}
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {a.type}
                  </span>
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
                    className="py-1 px-2 text-red-500 hover:text-red-700 text-xs rounded-md cursor-pointer"
                  >
                    <FaTrashAlt className="text-red-500 size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              openCreateModal(type === "Billing" ? "BILLING" : "SHIPPING")
            } // Pass backend 'type' for creation
            className="mt-3 text-[#213E5A] hover:text-[#1a324a] font-medium text-sm py-1.5 px-3 rounded-md border border-[#213E5A] hover:border-[#1a324a] cursor-pointer"
          >
            + Add New {type} Address
          </button>
        </>
      )}
    </div>
  );

  // Filter addresses based on their 'type' for display
  const billingAddresses = address.filter((a) => a.type === "BILLING");
  const deliveryAddresses = address.filter(
    (a) => a.type === "SHIPPING" || a.type === "HOME" || a.type === "WORK"
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
          billingAddresses, // Pass filtered billing addresses
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
                deliveryAddresses, // Pass filtered delivery addresses
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
                          <p className="text-sm text-gray-600">
                            Variant: {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-800 font-medium mt-1">
                          ₹{item.sellingPrice.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <button
                          onClick={() => removeCartItem(item.cartItemId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                        <p className="text-base font-bold text-gray-900 mt-2">
                          ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-start mt-2">
                      <button
                        onClick={() => decrementItemQuantity(item.cartItemId)}
                        disabled={item.quantity <= 1}
                        className="p-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-3 text-lg font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementItemQuantity(item.cartItemId)}
                        className="p-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{initialSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>₹{shippingCharges.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Coupon ({appliedCoupon.code}):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-3 mt-3">
              <span>Total:</span>
              <span>₹{finalTotalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowCouponSection(!showCouponSection)}
              className="text-[#213E5A] hover:underline text-sm mb-3"
            >
              {showCouponSection ? "Hide Coupons" : "Have a coupon code?"}
            </button>
            {showCouponSection && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Available Coupons:
                </h3>
                {availableCoupons.length === 0 ? (
                  <p className="text-sm text-gray-600">No coupons available.</p>
                ) : (
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {availableCoupons.map((coupon) => (
                      <li
                        key={coupon.id}
                        className="flex justify-between items-center bg-white p-3 rounded-md border border-gray-200"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {coupon.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Code:{" "}
                            <span className="font-mono bg-gray-100 p-1 rounded">
                              {coupon.code}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Discount: {coupon.discount}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyCoupon(coupon.code)}
                            className={`py-1 px-2 rounded-md text-xs transition-colors ${
                              copiedCouponCode === coupon.code
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {copiedCouponCode === coupon.code
                              ? "Copied!"
                              : "Copy"}
                          </button>
                          {appliedCoupon?.id === coupon.id ? (
                            <button
                              onClick={handleRemoveCoupon}
                              className="py-1 px-2 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApplyCoupon(coupon)}
                              className="py-1 px-2 bg-[#213E5A] text-white rounded-md text-xs hover:bg-[#1a324a]"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={fetchCoupons}
                  className="mt-3 text-[#213E5A] hover:underline text-sm"
                >
                  Refresh Coupons
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={
              isPlacingOrder ||
              items.length === 0 ||
              cartLoading ||
              addressIsLoading ||
              !selectedBillingAddressId ||
              !selectedDeliveryAddressId
            }
            className="w-full bg-[#213E5A] text-white py-3 rounded-lg mt-6 text-lg font-semibold hover:bg-[#1a324a] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPlacingOrder && (
              <div className="cart-loader running">
                <div className="wheel left"></div>
                <div className="wheel right"></div>
                <div className="product"></div>
              </div>
            )}
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>

      {/* Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  maxLength={10}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="addressLine"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Line
                </label>
                <input
                  type="text"
                  id="addressLine"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="landmark"
                  className="block text-sm font-medium text-gray-700"
                >
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleFormChange}
                    maxLength={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#213E5A] focus:border-[#213E5A] text-sm"
                  required
                >
                  <option value="HOME">HOME</option>
                  <option value="WORK">WORK</option>
                  <option value="BILLING">BILLING</option>
                  <option value="SHIPPING">SHIPPING</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#213E5A] text-white py-2 px-4 rounded-md hover:bg-[#1a324a] transition-colors text-sm"
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
