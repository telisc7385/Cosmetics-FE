
"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import UserCheckout from "@/components/Checkout/UserCheckout";
import GuestCheckout from "@/components/Checkout/GuestCheckout";


const CheckoutPage = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {isLoggedIn ? <UserCheckout /> : <GuestCheckout />}
    </main>
  );
};

export default CheckoutPage;
