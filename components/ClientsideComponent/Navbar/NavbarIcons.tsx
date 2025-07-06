"use client";

import React from "react";
import Link from "next/link";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { selectCartItems as selectGuestCartItems } from "@/store/slices/cartSlice";

import UserAvatar from "@/components/UserAvatar/UserAvatar";
import { CartItem } from "@/types/cart";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";

const NavbarIcons = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const guestCartItems = useAppSelector(selectGuestCartItems);
  const loggedInCart = useLoggedInCart();

  // Safe fallback to empty array
  const currentCartItems: CartItem[] =
    (isLoggedIn ? loggedInCart.items : guestCartItems) || [];

  const totalCartQuantity = currentCartItems.reduce(
    (total: number, item: CartItem) => total + item.quantity,
    0
  );

  const isLoadingCart = isLoggedIn && loggedInCart.loading;
  void isLoadingCart; // 👈 Prevent unused variable warning

  void FiHeart; // 👈 Prevent unused import warning

  return (
    <div className="flex items-center gap-4 text-black">
      <div className="flex items-center text-xs font-semibold">
        <UserAvatar />
      </div>

      {/* Wishlist Icon is commented out for now */}
      {/* 
      <div className="flex flex-col items-center text-xs font-semibold">
        <FiHeart size={20} />
      </div> 
      */}

      <Link
        href="/cart"
        className="relative flex flex-col items-center text-xs font-semibold hover:text-purple-600 transition"
      >
        <FiShoppingBag size={20} />
        {totalCartQuantity > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {totalCartQuantity}
          </span>
        )}
      </Link>
    </div>
  );
};

export default NavbarIcons;
