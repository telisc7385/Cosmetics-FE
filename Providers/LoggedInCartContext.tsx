// Providers/LoggedInCartContext.ts
// This file defines the actual React Context object.

import { createContext } from "react";
import { CartItem } from "@/types/cart"; // Make sure this path is correct

// Define the interface for the context value
// This MUST match the `contextValue` object you pass to the provider.
interface LoggedInCartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addCartItem: (item: Omit<CartItem, "cartItemId">) => Promise<void>;
  incrementItemQuantity: (cartItemId: number) => Promise<void>;
  decrementItemQuantity: (cartItemId: number) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>; // Changed from syncCart to refetchCart to match your provider
}

// Create the context object
// It's initialized with 'undefined' because the actual value will be provided by the Provider.
const LoggedInCartContext = createContext<LoggedInCartContextType | undefined>(
  undefined
);

// Export the context object as a DEFAULT export
export default LoggedInCartContext;
