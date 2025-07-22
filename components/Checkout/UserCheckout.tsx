// src/app/checkout/page.tsx (or pages/checkout.tsx)
"use client";

import React, { JSX, useEffect, useState, useCallback } from "react";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken, selectUser } from "@/store/slices/authSlice";
import Link from "next/link";
import {
  apiCore,
  LoggedInOrderPayload, // This interface needs to be updated in your ApiCore.ts
  OrderResponse,
  LocalAddressItem,
  FetchAddressesResponse,
  SingleAddressResponse,
  AddressInput,
} from "@/api/ApiCore";
import { FaTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "@/components/Modal";
import { CartItem } from "@/types/cart"; // Import CartItem type
import { AbandonedItem, getAbendentItems } from "@/api/AbendentDiscountApi";
import { FiTrash2 } from "react-icons/fi";

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
  coupons: Coupon[];
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
type AddressCreationIntent = "BILLING" | "SHIPPING" | "HOME" | "WORK";

// UPDATED: Define types for data passed from CartPage to Checkout
interface VerifiedPincodeDetails {
  pincode: string;
  city: string;
  state: string;
  shippingRate?: number;
  taxPercentage?: number;
  taxType?: string;
}

interface CheckoutDataFromCart {
  subtotal: number;
  shippingRate: number;
  taxableAmount: number; // New: subtotal + shippingRate
  taxAmount: number; // New: tax calculated on taxableAmount
  taxPercentage: number;
  taxType: string; // New: tax type from CartPage
  total: number; // This 'total' is the final total from CartPage (after tax, before coupon)
  cartItems: CartItem[]; // Changed from any[] to CartItem[]
  verifiedPincodeDetails: VerifiedPincodeDetails | null;
}

// --- Pincode Input Component for Address Forms ---
interface PincodeInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void; // To trigger validation on blur
  isVerifiedAndDisabled: boolean; // From CartPage, for shipping address
  verifiedPincodeFromCart: string | undefined; // Pincode from CartPage verification
  cityValue: string;
  stateValue: string;
  setCity: (city: string) => void;
  setState: (state: string) => void;
  disabled?: boolean; // General disable prop
  setLocalPincodeValidationMessage: (message: string | null) => void; // Callback to set message in parent
}

const PincodeInput: React.FC<PincodeInputProps> = ({
  value,
  onChange,
  onBlur,
  isVerifiedAndDisabled,
  verifiedPincodeFromCart,
  cityValue,
  stateValue,
  setCity,
  setState,
  disabled = false,
  setLocalPincodeValidationMessage,
}) => {
  const [internalValidationMessage, setInternalValidationMessage] = useState<
    string | null
  >(null);

  const validatePincode = useCallback(
    async (pincode: string) => {
      if (!pincode || pincode.length !== 6) {
        const msg = "Enter a valid 6-digit pincode.";
        setInternalValidationMessage(msg);
        setLocalPincodeValidationMessage(msg);
        return false;
      }

      setInternalValidationMessage(null);
      setLocalPincodeValidationMessage(null); // Clear parent's message too
    },
    [
      verifiedPincodeFromCart,
      setCity,
      setState,
      setLocalPincodeValidationMessage,
    ]
  );

  // Trigger validation on blur
  const handleBlur = () => {
    if (!isVerifiedAndDisabled && !disabled) {
      // Only validate if not autofilled/disabled
      validatePincode(value);
    }
    onBlur(); // Call parent's onBlur
  };

  // If pincode is verified and disabled, ensure no local validation message
  useEffect(() => {
    if (isVerifiedAndDisabled || disabled) {
      setInternalValidationMessage(null);
      setLocalPincodeValidationMessage(null);
    }
  }, [isVerifiedAndDisabled, disabled, setLocalPincodeValidationMessage]);

  // Re-validate if value changes and it's not disabled
  useEffect(() => {
    if (value && value.length === 6 && !isVerifiedAndDisabled && !disabled) {
      validatePincode(value);
    } else if (!value || value.length !== 6) {
      setInternalValidationMessage(null); // Clear message if pincode is incomplete
      setLocalPincodeValidationMessage(null);
    }
  }, [
    value,
    isVerifiedAndDisabled,
    disabled,
    validatePincode,
    setLocalPincodeValidationMessage,
  ]);

  return (
    <div className="mb-4">
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
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        disabled={isVerifiedAndDisabled || disabled} // Disable if autofilled, externally disabled, or checking
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm  focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 ${isVerifiedAndDisabled || disabled
            ? "bg-gray-100 cursor-not-allowed"
            : ""
          }`}
        maxLength={6}
      />
      {internalValidationMessage && (
        <p className="mt-1 text-sm text-red-600">{internalValidationMessage}</p>
      )}

      {/* {value &&
        !internalValidationMessage &&
        !isVerifiedAndDisabled && (
          <div className="mt-1 text-sm text-green-600">
            City: {cityValue}, State: {stateValue}
          </div>
        )} */}
    </div>
  );
};

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
  const customer = useAppSelector(selectUser);

  // Use the updated CheckoutDataFromCart interface
  const [checkoutData, setCheckoutData] = useState<CheckoutDataFromCart | null>(
    null
  );

  // Recalculate subtotal based on current cart items
  const currentSubtotal = React.useMemo(() => {
    return (items || []).reduce(
      (sum, item) => sum + item.quantity * item.sellingPrice,
      0
    );
  }, [items]);

  const [showCouponSection, setShowCouponSection] = useState<boolean>(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [finalTotalAmount, setFinalTotalAmount] = useState<number>(0); // This will be updated below
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [abandentApplied, setAbandentApplied] = useState<boolean>(false);
  const [abandentDiscountAmount, setAbandentDiscountAmount] =
    useState<number>(0);

  const searchParams = useSearchParams();
  const abandonedStatus = searchParams.get("abandoned");

  // checkout calculation
  const shippingRate = checkoutData?.shippingRate || 0;
  const taxableAmount =
    currentSubtotal + shippingRate - discountAmount - abandentDiscountAmount; // Calculation from CartPage
  const taxPercentage = checkoutData?.taxPercentage || 0;
  const taxAmount = taxableAmount * (taxPercentage / 100); // Calculation from CartPage
  const taxType = checkoutData?.taxType || "";

  // Calculate final total amount based on new logic
  useEffect(() => {
    let calculatedTotal = taxableAmount + taxAmount; // Start with taxable amount + tax
    if (appliedCoupon && discountAmount > 0) {
      // calculatedTotal -= discountAmount;

      setAbandentApplied(false);
    }
    // else {
    //    // calculatedTotal -= abandentDiscountAmount;
    // }

    setFinalTotalAmount(Math.max(0, calculatedTotal));
  }, [
    taxableAmount,
    taxAmount,
    appliedCoupon,
    discountAmount,
    abandentDiscountAmount,
  ]);

  useEffect(() => {
    if (abandonedStatus === "true" || abandonedStatus !== null) {
      setAbandentApplied(true);
    }
  }, [abandonedStatus]);

  useEffect(() => {
    if (abandentApplied) {
      if (!items || !Array.isArray(items)) return;
      if (!abendonedItems || !Array.isArray(abendonedItems)) return;
      let totalDiscount = 0;
      items.forEach((cartItem) => {
        const matched = abendonedItems.find(
          (item) =>
            item.product === cartItem.id || item.variant === cartItem?.variantId
        );
        if (matched) {
          const unitPrice = cartItem.sellingPrice;
          console.log("unitPrice", unitPrice);
          const itemDiscount =
            (unitPrice * matched.discount_for_single_unit * matched.quantity) /
            100;
          totalDiscount += itemDiscount;
          console.log("itemDiscount", itemDiscount);
        }
        console.log("matched", matched);
      });

      console.log("items", items);
      console.log("abendonedItems", abendonedItems);

      setAbandentDiscountAmount(totalDiscount);
    } else {
      setAbandentDiscountAmount(0);
    }
  }, [abandentApplied, items]);

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
  const [abendonedItems, setAbendonedItems] = useState<AbandonedItem[] | null>(
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
  const [addressCreationIntent, setAddressCreationIntent] =
    useState<AddressCreationIntent | null>(null);
  const [pincodeValidationMessage, setPincodeValidationMessage] = useState<
    string | null
  >(null);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");

  // Load checkout data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCheckoutData = localStorage.getItem(
        "orderSummaryForCheckout"
      );
      if (storedCheckoutData) {
        const parsedData: CheckoutDataFromCart = JSON.parse(storedCheckoutData);
        setCheckoutData(parsedData);
      } else {
        toast.error("Cart data not found. Please go back to cart.");
        router.push("/cart"); // Redirect if no cart data
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchAbbendentItems = async () => {
      if (customer && token) {
        const response = await getAbendentItems(
          String(token),
          Number(customer.id)
        );
        setAbendonedItems(response?.items);
        console.log("response", response);
      }
    };
    fetchAbbendentItems();
  }, [customer, token]);

  // Fetch addresses on token or initial load
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

  // Persist selected addresses and useBillingAsDelivery to localStorage
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
      localStorage.removeItem("selectedDeliveryAddressId"); // Clear separate delivery ID if same as billing
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
    setAddressCreationIntent(intent); // Set intent for conditional autofill/disable

    // Autofill pincode/city/state for SHIPPING address if verified data exists
    if (intent === "SHIPPING" && checkoutData?.verifiedPincodeDetails) {
      setFormData((prev) => ({
        ...prev,
        pincode: checkoutData.verifiedPincodeDetails!.pincode,
        city: checkoutData.verifiedPincodeDetails!.city,
        state: checkoutData.verifiedPincodeDetails!.state,
      }));
    }
    setPincodeValidationMessage(null); // Clear any previous validation messages
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
    setAddressCreationIntent(null); // Not creating, so no specific intent
    setPincodeValidationMessage(null); // Clear any previous validation messages
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
    if (name === "pincode") {
      setPincodeValidationMessage(null); // Clear main validation message on input change
    }
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

    // Pincode validation using the mockPincodeCheck
    let isPincodeValid = true;
    let currentPincodeValidationMessage: string | null = null;

    // Additional check for SHIPPING address if pincode was verified on cart page
    if (
      isPincodeValid &&
      (type === "SHIPPING" || type === "HOME" || type === "WORK") &&
      checkoutData?.verifiedPincodeDetails?.pincode
    ) {
      if (pincode !== checkoutData.verifiedPincodeDetails.pincode) {
        isPincodeValid = false;
        currentPincodeValidationMessage = `Shipping pincode must match the verified delivery pincode (${checkoutData.verifiedPincodeDetails.pincode}).`;
      }
    }

    if (!isPincodeValid) {
      setPincodeValidationMessage(currentPincodeValidationMessage);
      toast.error(
        currentPincodeValidationMessage || "Pincode validation failed."
      );
      return;
    } else {
      setPincodeValidationMessage(null); // Clear message if validation passes
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
          if (res.updated) {
            setAddress((prev) =>
              prev.map((a) => (a.id === res.updated?.id ? res.updated : a))
            );
            return "Address updated successfully!";
          } else {
            throw new Error("Failed to update address.");
          }
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
        setAvailableCoupons(response.coupons);
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

        // Discount should only apply on subtotal price
        const calculatedDiscountAmount =
          currentSubtotal * (coupon.discount / 100);
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
    if (!checkoutData) {
      toast.error(
        "Order summary data is missing. Please go back to cart and re-verify pincode."
      );
      return;
    }

    setIsPlacingOrder(true);

    // Format the address objects into strings for the payload
    const formattedBillingAddress = `${billingAddressObj.addressLine}, ${billingAddressObj.landmark ? billingAddressObj.landmark + ", " : ""
      }${billingAddressObj.city}, ${billingAddressObj.state} - ${billingAddressObj.pincode
      }`;
    const formattedShippingAddress = `${deliveryAddressObj.addressLine}, ${deliveryAddressObj.landmark ? deliveryAddressObj.landmark + ", " : ""
      }${deliveryAddressObj.city}, ${deliveryAddressObj.state} - ${deliveryAddressObj.pincode
      }`;

    // Construct the payload with the updated logic for items
    const payload: LoggedInOrderPayload = {
      items: items.map((item) => {
        // Create a temporary object for the item payload
        const itemPayload: {
          quantity: number;
          price: number;
          productId?: number;
          variantId?: number | null;
        } = {
          quantity: item.quantity,
          price: item.sellingPrice,
        };

        // Conditional logic: if a variant exists, use variantId. Otherwise, use productId.
        if (item.variantId || item.variant?.id) {
          itemPayload.variantId = item.variantId || item.variant?.id;
          // IMPORTANT: Do NOT include productId if variantId is present,
          // assuming your backend expects exclusivity.
        } else {
          itemPayload.productId = item.productId || item.product?.id || item.id;
        }
        return itemPayload;
      }),
      addressId: Number(deliveryAddressObj.id), // Ensure addressId is a NUMBER
      totalAmount: Number(finalTotalAmount),
      paymentMethod,
      discountAmount: Number(discountAmount),
      ...(appliedCoupon && { discountCode: appliedCoupon.code }), // Include discountCode if a coupon is applied
      abandentDiscountAmount,
      billingAddress: formattedBillingAddress,
      shippingAddress: formattedShippingAddress,
      cartId: cartId, // CartId is now always expected as a number by this payload (if it was optional, remove this line)
      subtotal: Number(currentSubtotal), // Use currentSubtotal
      taxAmount: Number(taxAmount), // Use calculated taxAmount
      appliedTaxRate: taxPercentage, // Use calculated taxPercentage
      taxType: taxType, // Use calculated taxType
      isTaxInclusive: false, // As per your order summary response
      shippingRate: Number(shippingRate), // Use calculated shippingRate
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
      if (paymentMethod === "RAZORPAY") {
        try {
          // 1. Create order in backend first
          const order = await apiCore<OrderResponse>(
            "/order",
            "POST",
            payload,
            token
          );

          const razorpayOrderId = order.razorpayOrderId;
          const internalOrderId = order.id;

          // 2. Load Razorpay script
          const loadScript = (src: string): Promise<boolean> => {
            return new Promise((resolve) => {
              const script = document.createElement("script");
              script.src = src;
              script.onload = () => resolve(true);
              script.onerror = () => resolve(false);
              document.body.appendChild(script);
            });
          };

          const scriptLoaded = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
          );

          if (!scriptLoaded) {
            toast.error("Failed to load Razorpay. Please try again.");
            setIsPlacingOrder(false);
            return;
          }

          const options = {
            key: "rzp_live_s1XxBl5X5Jx4lU",
            amount: Math.round(payload.totalAmount * 100),
            currency: "INR",
            name: "consmo",
            description: "Thank you for your purchase",
            order_id: razorpayOrderId,
            handler: function () {
              router.push(`/thank-you?orderId=${internalOrderId}`);
            },
            prefill: {
              name: billingAddressObj.fullName,
              email: customer?.email || "",
            },
            modal: {
              ondismiss: function () {
                toast.error("Payment cancelled.");
                setIsPlacingOrder(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error) {
          toast.error("Failed to start payment.");
          console.error("Razorpay Error:", error);
          setIsPlacingOrder(false);
        }
      } else {
        // For COD, directly place the order via API
        const order = await apiCore<OrderResponse>(
          "/order",
          "POST",
          payload, // Pass the OBJECT, apiCore will stringify it
          token
        );
        toast.success("Order placed successfully!");
        clearCart(); // Clear cart after successful order placement
        router.push(
          `/thank-you?orderId=${order.id || ""
          }`
        );
      }
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
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${selected === a.id
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart</h2>

          {cartLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="cart-loader running">
                <div className="wheel left"></div>
                <div className="wheel right"></div>
                <div className="product"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading cart items...</p>
            </div>
          ) : cartError ? (
            <div className="text-red-500 text-center py-5">
              Error loading cart: {cartError}
            </div>
          ) : items.length === 0 ? (
            <div className="text-gray-600 text-center py-5 flex flex-col justify-center">
              Your cart is empty.
            </div>
          ) : (
            <>
              <div className=" max-h-96 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-white rounded-lg p-2 sm:p-6 lg:py-3 lg:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 shadow-sm mb-4 relative"
                  >
                    {/* Common Left Section (Image and main text container) */}
                    <div className="flex items-start sm:items-center w-full sm:w-auto mb-1 sm:mb-0">
                      {item.slug ? (
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex-shrink-0 mr-4 sm:mr-6 flex flex-col items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-md cursor-pointer sm:w-28 sm:h-28"
                          />
                          {/* Stock under image for mobile/tablet/laptop */}
                          <p className="text-xs text-gray-500 mt-1">
                            Stock: {item.stock}
                          </p>
                        </Link>
                      ) : (
                        <div className="mr-4 sm:mr-6 flex-shrink-0 flex flex-col items-center">
                          {" "}
                          {/* Reduced font size here */}
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-md sm:w-28 sm:h-28"
                          />
                          {/* Stock under image for mobile/tablet/laptop */}
                          <p className="text-xs text-gray-500 mt-1">
                            Stock: {item.stock}
                          </p>
                        </div>
                      )}

                      {/* Mobile View Specific Layout - visible only on 'sm' breakpoint and below */}
                      <div className="flex flex-col justify-between h-full w-full sm:hidden">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            {item.slug ? (
                              <Link href={`/product/${item.slug}`} className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                                  {item.name}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
                                {item.name}
                              </h3>
                            )}
                          </div>

                          {/* Price with quantity and total aligned in one row */}
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-700">
                              Price: ₹{item.sellingPrice.toFixed(2)} / item{" "}
                              <span className="text-xs text-gray-500">
                                x {item.quantity}
                              </span>
                            </p>
                            <p className="text-xs text-gray-900 whitespace-nowrap font-semibold">
                              ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full mt-3">
                          <div className="flex items-center space-x-1 border border-gray-300 rounded-md py-0.5 px-1">
                            <button
                              onClick={() => incrementItemQuantity(item.cartItemId)}
                              className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                            >
                              -
                            </button>
                            <span className="font-medium text-sm w-4 text-center text-[#213E5A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => decrementItemQuantity(item.cartItemId)}
                              className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-sm"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeCartItem(item.cartItemId)}
                            className="text-red-500 hover:text-red-700 font-medium p-1 rounded-full transition-colors cursor-pointer"
                            aria-label={`Remove ${item.name}`}
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Tablet/Laptop View Specific Layout for Title, Stock, and Quantity - hidden on 'sm' breakpoint and below */}
                      <div className="hidden sm:flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            {item.slug ? (
                              <Link href={`/product/${item.slug}`} className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-[#007BFF] transition-colors cursor-pointer">
                                  {item.name}
                                </h3>
                              </Link>
                            ) : (
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                                {item.name}
                              </h3>
                            )}
                          </div>

                          {/* Price per item with x{quantity} */}
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ₹{item.sellingPrice.toFixed(2)} / item{" "}
                            <span className="text-sm text-gray-500">
                              x {item.quantity}
                            </span>
                          </p>

                          {item.variantId && (
                            <p className="text-xs text-gray-400">
                              {/* Variant ID: {item.variantId} */}
                            </p>
                          )}

                          {/* Increment/Decrement for Tablet/Laptop */}
                          <div className="w-20 flex items-center border border-gray-300 rounded-md py-0.5 mt-2">
                            <button
                              onClick={() => decrementItemQuantity(item.cartItemId)}
                              className="w-7 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-base"
                            >
                              -
                            </button>
                            <span className="font-medium text-base w-6 text-center text-[#213E5A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => incrementItemQuantity(item.cartItemId)}
                              className="w-7 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer text-base"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tablet/Laptop View: Trash icon and Price - positioned to the right */}
                    <div className="hidden sm:flex flex-col items-end gap-4">
                      {/* Trash button for larger screens (sm and up) - absolute positioning */}
                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-medium p-1 rounded-full transition-colors cursor-pointer"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>

                      <div className="text-lg font-semibold text-gray-900 w-20 text-right mt-auto">
                        ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Always visible Back to Shop button */}
          <div className="flex justify-center">
            <Link href="/shop">
              <button className="bg-[#213E5A] text-white border border-[#213E5A] px-6 py-2 rounded-md transition-all duration-200 hover:bg-white hover:text-[#213E5A] hover:border-[#213E5A]">
                Back to Shop
              </button>
            </Link>
          </div>

          {/* Subtotal section (always shown if items exist) */}
          {items.length > 0 && (
            <div className="flex justify-between items-center mt-4 pt-2 border-t">
              <span className="font-semibold text-gray-800">Subtotal:</span>
              <span className="font-semibold text-gray-900">
                ₹{currentSubtotal.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Coupon Section */}
        <div className="bg-white p-3 rounded-lg shadow-md">
          <h2
            className="text-lg font-bold text-gray-800 mb-4 cursor-pointer flex justify-between items-center"
            onClick={() => {
              setShowCouponSection(!showCouponSection);
              if (!showCouponSection) fetchCoupons(); // Fetch coupons when opening
            }}
          >
            {abendonedItems && abendonedItems?.length > 0
              ? "Apply Coupon or Abandoned Cart Discount"
              : "Apply Your Coupon Now"}

            <span>{showCouponSection ? "▲" : "▼"}</span>
          </h2>
          {showCouponSection && (
            <div className="mt-4">
              {availableCoupons?.length === 0 ? (
                <p className="text-gray-600 text-sm">No coupons available.</p>
              ) : (
                <div className="space-y-3">
                  {availableCoupons?.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="border border-gray-200 rounded-md p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {coupon.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Code:{" "}
                          <span className="font-mono text-[#213E5A]">
                            {coupon.code}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Discount: {coupon.discount}%
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className={`text-sm px-3 py-1 rounded-md ${copiedCouponCode === coupon.code
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                        >
                          {copiedCouponCode === coupon.code
                            ? "Copied!"
                            : "Copy"}
                        </button>
                        <button
                          onClick={() => handleApplyCoupon(coupon)}
                          disabled={appliedCoupon?.id === coupon.id}
                          className="bg-[#213E5A] text-white text-sm px-3 py-1 rounded-md hover:bg-[#1a324a] disabled:opacity-50"
                        >
                          {appliedCoupon?.id === coupon.id
                            ? "Applied"
                            : "Apply"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {abendonedItems && abendonedItems?.length > 0 && (
                <div className="border border-gray-200 rounded-md p-3 flex justify-between items-center my-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Abandoned Cart Discount
                    </p>
                    <p className="text-xs text-gray-500">
                      Discount: {abendonedItems?.[0]?.discount_given_in_percent}
                      %
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => (
                        setAbandentApplied(!abandentApplied),
                        setShowCouponSection(!showCouponSection),
                        handleRemoveCoupon()
                      )}
                      // disabled={abandentApplied}
                      className="bg-[#213E5A] text-white text-sm px-3 py-1 rounded-md hover:bg-[#1a324a] disabled:opacity-50"
                    >
                      {abandentApplied ? "Applied" : "Apply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {appliedCoupon && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
              <p className="text-green-700 font-semibold text-sm">
                Coupon &quot;{appliedCoupon.code}&quot; applied!
              </p>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          )}
          {abandentApplied && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
              <p className="text-green-700 font-semibold text-sm">
                Abandoned Cart Discount applied!
              </p>
              <button
                onClick={() => (
                  setAbandentApplied(!abandentApplied),
                  setShowCouponSection(!showCouponSection)
                )}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-3 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between pb-2">
              <span className="text-gray-700 font-semibold">Subtotal</span>
              <span className="font-medium text-gray-900">
                ₹{currentSubtotal.toFixed(2)}
              </span>
            </div>

            {abandentDiscountAmount > 0 && (
              <div className="flex justify-between pb-2">
                <span className="text-gray-700">Abandent Discount</span>
                <span className="font-medium text-red-600">
                  - ₹{abandentDiscountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {discountAmount > 0 && appliedCoupon && (
              <div className="flex justify-between pb-2">
                <span className="text-gray-700">
                  Discount ({appliedCoupon.discount}%)
                </span>
                <span className="font-medium text-red-600">
                  - ₹{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">Shipping Charges</span>
              <span className="font-medium text-gray-900">
                ₹{shippingRate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-gray-700 font-semibold">
                Taxable Amount
              </span>
              <span className="font-semibold text-gray-900">
                ₹{taxableAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-700">{taxType} Tax ({taxPercentage}%)</span>
              <span className="font-medium text-gray-900">
                ₹{taxAmount.toFixed(2)}
              </span>
            </div>
            {/* Display Total before discount */}
            {/* <div className="flex justify-between pb-2">
              <span className="text-gray-700 font-semibold">
                Total (before discount)
              </span>
              <span className="font-semibold text-gray-900">
                ₹{(taxableAmount + taxAmount).toFixed(2)}
              </span>
            </div> */}

            <div className="flex justify-between pt-4 border-t-2 border-gray-300">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{finalTotalAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={
              isPlacingOrder ||
              !selectedBillingAddressId ||
              !selectedDeliveryAddressId ||
              items.length === 0
            }
            className={`w-full py-3 mt-6 text-white font-semibold rounded-md transition-colors ${!isPlacingOrder &&
                selectedBillingAddressId &&
                selectedDeliveryAddressId &&
                items.length > 0
                ? "bg-[#1A324A] hover:bg-[#142835]"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>

      {showModal && (
        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          onClose={() => setShowModal(false)}
        >
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A] "
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A]"
                maxLength={10}
                required
              />
            </div>

            <PincodeInput
              value={formData.pincode}
              onChange={handleFormChange}
              onBlur={() => { }} // PincodeInput handles its own blur
              isVerifiedAndDisabled={
                (addressCreationIntent === "SHIPPING" ||
                  editingAddress?.type === "SHIPPING") &&
                !!checkoutData?.verifiedPincodeDetails?.pincode &&
                formData.pincode === checkoutData.verifiedPincodeDetails.pincode // Only disable if it matches the verified one
              }
              verifiedPincodeFromCart={
                addressCreationIntent === "SHIPPING" ||
                  editingAddress?.type === "SHIPPING"
                  ? checkoutData?.verifiedPincodeDetails?.pincode
                  : undefined
              }
              cityValue={formData.city}
              stateValue={formData.state}
              setCity={(city) => setFormData((prev) => ({ ...prev, city }))}
              setState={(state) => setFormData((prev) => ({ ...prev, state }))}
              setLocalPincodeValidationMessage={setPincodeValidationMessage} // Pass callback
              disabled={
                editingAddress?.type === "SHIPPING" &&
                !!checkoutData?.verifiedPincodeDetails?.pincode &&
                formData.pincode === checkoutData.verifiedPincodeDetails.pincode
              }
            />

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
                disabled={
                  (addressCreationIntent === "SHIPPING" ||
                    editingAddress?.type === "SHIPPING") &&
                  !!checkoutData?.verifiedPincodeDetails?.pincode &&
                  formData.pincode ===
                  checkoutData.verifiedPincodeDetails.pincode
                }
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A] ${(addressCreationIntent === "SHIPPING" ||
                    editingAddress?.type === "SHIPPING") &&
                    !!checkoutData?.verifiedPincodeDetails?.pincode &&
                    formData.pincode ===
                    checkoutData.verifiedPincodeDetails.pincode
                    ? "bg-gray-100 cursor-not-allowed text-[#213E5A]"
                    : ""
                  }`}
                required
              />
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
                disabled={
                  (addressCreationIntent === "SHIPPING" ||
                    editingAddress?.type === "SHIPPING") &&
                  !!checkoutData?.verifiedPincodeDetails?.pincode &&
                  formData.pincode ===
                  checkoutData.verifiedPincodeDetails.pincode
                }
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A] ${(addressCreationIntent === "SHIPPING" ||
                    editingAddress?.type === "SHIPPING") &&
                    !!checkoutData?.verifiedPincodeDetails?.pincode &&
                    formData.pincode ===
                    checkoutData.verifiedPincodeDetails.pincode
                    ? "bg-gray-100 cursor-not-allowed text-[#213E5A]"
                    : ""
                  }`}
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
              <textarea
                id="addressLine"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleFormChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A]"
                required
              ></textarea>
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A]"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-[#213E5A]"
                required
              >
                <option value="BILLING">BILLING</option>
                <option value="SHIPPING">SHIPPING</option>
              </select>
            </div>
            {pincodeValidationMessage && (
              <p className="text-red-600 text-sm">{pincodeValidationMessage}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#213E5A] hover:bg-[#1a324a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#213E5A]"
            >
              {editingAddress ? "Update Address" : "Save Address"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UserCheckout;
