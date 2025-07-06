// Providers/LoggedInCartContext.ts
import { CartItem, CartItemInput } from "@/types/cart"; // Import CartItemInput
import { createContext } from "react";

export interface LoggedInCartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addCartItem: (itemToAdd: CartItemInput) => Promise<void>; // Updated parameter type
  removeCartItem: (cartItemId: number) => Promise<void>;
  incrementItemQuantity: (cartItemId: number) => Promise<void>;
  decrementItemQuantity: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  cartId: number | null; // Updated to number | null
}

const LoggedInCartContext = createContext<LoggedInCartContextType | undefined>(
  undefined
);

export default LoggedInCartContext;
