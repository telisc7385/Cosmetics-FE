// src/app/payment/page.tsx (or pages/payment.tsx)
"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoggedInOrderPayload } from "@/api/ApiCore"; // Assuming LoggedInOrderPayload is defined here or needs to be passed

// Declare the global Razorpay object
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Define Razorpay options interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  description: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
    email?: string;
    contact?: string; // Optional contact field
  };
  modal: {
    ondismiss: () => void;
  };
  notes?: { [key: string]: string }; // Optional notes
}

// Define Razorpay success response interface
interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Define Razorpay instance interface (minimal, as we only call .open())
interface RazorpayInstance {
  open: () => void;
}

// UPDATED: Define PaymentDetails to include payloadForBackend
type PaymentDetails = {
  amount: number;
  orderId: string;
  description: string;
  prefillName: string;
  prefillEmail: string;
  payloadForBackend: LoggedInOrderPayload; // Include the full order payload
};

const PaymentMethodPage = () => {
  const router = useRouter();
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const loadScript = (src: string) => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const openRazorPay = useCallback(
    async (details: PaymentDetails) => {
      setPaymentLoading(true);
      setPaymentError(null);

      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
        setPaymentError(
          "Payment gateway could not load. Please check your internet connection."
        );
        toast.error("Payment gateway failed to load.");
        setPaymentLoading(false);
        return;
      }

      // Razorpay expects amount in smallest currency unit (e.g., paise for INR)
      const amountInLowerUnit = details.amount; // Already in lower unit from UserCheckout
      if (isNaN(amountInLowerUnit) || amountInLowerUnit < 100) {
        // Razorpay minimum is 100 paise (1 INR)
        setPaymentError("Invalid payment amount.");
        toast.error("Invalid payment amount.");
        setPaymentLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: "rzp_test_3dClQitMzHGeds", // Replace with your actual Razorpay Key ID
        amount: amountInLowerUnit,
        currency: "INR",
        name: "Your Store Name", // Your business name
        order_id: details.orderId, // Order ID from your backend
        description: details.description,

        handler: function (response: RazorpaySuccessResponse) {
          // This function is called on successful payment
          toast.success("Payment Successful! Redirecting to thank you page.");
          console.log("Payment Response:", response);

          // In a real app, you would send this response along with payloadForBackend to your backend for verification
          // For now, we'll simulate sending it and redirect
          const finalOrderPayload = {
            ...details.payloadForBackend,
            paymentMethod: "RAZORPAY",
            paymentTransactionId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          // Simulate API call to backend to finalize order
          // In a real application, you would make an actual API call here
          console.log(
            "Simulating backend order finalization with payload:",
            finalOrderPayload
          );
          // Example: apiCore("/order/finalize-razorpay", "POST", finalOrderPayload, token);

          // Clear cart after successful order placement (simulated)
          // You might need to dispatch clearCart from Redux or call a context function
          // if (typeof window !== 'undefined') {
          //   localStorage.removeItem('cartItems'); // Or whatever your cart storage key is
          // }

          router.push(
            `/thankyou?orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}`
          );
        },
        prefill: {
          name: details.prefillName,
          email: details.prefillEmail,
        },
        modal: {
          ondismiss: function () {
            // This function is called if the user closes the modal without completing payment
            setPaymentLoading(false);
            setPaymentError("Payment was cancelled by the user.");
            toast.error("Payment cancelled.");
          },
        },
      };

      try {
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        console.error("Error opening Razorpay:", err);
        setPaymentError("Failed to open payment gateway.");
        toast.error("Failed to open payment gateway.");
        setPaymentLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPaymentDetails = localStorage.getItem("paymentDetails");
      if (storedPaymentDetails) {
        const details: PaymentDetails = JSON.parse(storedPaymentDetails);
        openRazorPay(details);
        localStorage.removeItem("paymentDetails"); // Clear details after use
      } else {
        setPaymentError(
          "Payment details not found. Please go back to checkout."
        );
        toast.error("Payment details missing.");
        setPaymentLoading(false);
        router.push("/checkout"); // Redirect if no payment details
      }
    }
  }, [openRazorPay, router]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 text-center">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Processing Payment...
      </h1>
      {paymentLoading && (
        <p className="text-gray-600">
          Please wait while we redirect you to the payment gateway.
        </p>
      )}
      {paymentError && (
        <div className="text-red-600">
          <p>{paymentError}</p>
          <button
            onClick={() => router.push("/checkout")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Back to Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodPage;
