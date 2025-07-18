"use client";

import React from "react";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
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

  const currentCartItems: CartItem[] =
    (isLoggedIn ? loggedInCart.items : guestCartItems) || [];

  const totalCartQuantity = currentCartItems.reduce(
    (total: number, item: CartItem) => total + item.quantity,
    0
  );

  const isLoadingCart = isLoggedIn && loggedInCart.loading;
  void isLoadingCart;

  return (
    <div className="flex items-center gap-2 text-black md:gap-2 md:justify-start justify-between w-full">
      {/* 👇 Wrapper for mobile layout alignment */}
      <div className="flex items-center justify-between w-full md:w-auto md:gap-2 gap-2">
        <div className="flex items-center text-xs font-semibold">
          <UserAvatar />
        </div>

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
    </div>
  );
};

export default NavbarIcons;
