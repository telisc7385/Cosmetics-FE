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

  return (
    <div className="flex items-center gap-4 text-black">
      <div className="flex  items-center text-xs font-semibold">
        <UserAvatar />
      </div>

      <div className="flex flex-col items-center text-xs font-semibold">
        <FiHeart size={20} />

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
  );
};

export default NavbarIcons;



// "use client";

// import React from "react";
// import Link from "next/link";
// import { FiHeart, FiShoppingBag } from "react-icons/fi";
// import { useAppSelector } from "@/store/hooks/hooks";
// import { selectIsLoggedIn } from "@/store/slices/authSlice";
// import { selectCartItems as selectGuestCartItems } from "@/store/slices/cartSlice";

// import UserAvatar from "@/components/UserAvatar/UserAvatar";
// import { CartItem } from "@/types/cart"; // Ensure this import path is correct
// import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider"; // Ensure this import path is correct

// // Helper function to render an icon with text
// interface IconLinkProps {
//   href?: string;
//   icon: React.ElementType; // Represents the icon component (e.g., FiHeart, FiShoppingBag)
//   text: string;
//   quantity?: number; // Optional for cart item count
//   // Add any other props like onClick, className if needed for reusability
// }

// const IconItem: React.FC<IconLinkProps> = ({ href, icon: Icon, text, quantity }) => {
//   const content = (
//     <>
//       <Icon size={20} />
//       <span>{text}</span>
//       {quantity !== undefined && quantity > 0 && (
//         <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
//           {quantity}
//         </span>
//       )}
//     </>
//   );

//   const classes = "relative flex flex-col items-center text-xs font-semibold hover:text-purple-600 transition";

//   return href ? (
//     <Link href={href} className={classes}>
//       {content}
//     </Link>
//   ) : (
//     <div className={classes}>
//       {content}
//     </div>
//   );
// };


// const NavbarIcons: React.FC = () => {
//   const isLoggedIn = useAppSelector(selectIsLoggedIn);
//   const guestCartItems = useAppSelector(selectGuestCartItems);
//   const loggedInCart = useLoggedInCart();

//   // Determine which cart to use
//   const currentCartItems: CartItem[] = isLoggedIn ? loggedInCart.items : guestCartItems;

//   // Calculate total cart quantity, handling potential null/undefined for safety
//   const totalCartQuantity = currentCartItems?.reduce(
//     (total, item) => total + (item?.quantity || 0), // Safely access item.quantity
//     0
//   ) || 0; // Fallback to 0 if currentCartItems is null/undefined

//   // Optional: If you need to show a loading state for the cart count,
//   // you can integrate isLoadingCart here, e.g., by rendering a spinner
//   // or a placeholder instead of the quantity.
//   // const isLoadingCart = isLoggedIn && loggedInCart.loading;

//   return (
//     <div className="flex items-center gap-10 text-black"> {/* Increased gap for better spacing */}
//       {/* User Avatar - assumed to handle its own display based on login status */}
//       <div>
//         <UserAvatar />
//       </div>

//       {/* Wishlist Icon */}
//       <IconItem icon={FiHeart} text="Wishlist" href="/wishlist" /> {/* Added href for wishlist link */}

//       {/* Bag/Cart Icon */}
//       <IconItem icon={FiShoppingBag} text="Bag" href="/cart" quantity={totalCartQuantity} />
//     </div>
//   );
// };

// export default NavbarIcons;