import { CartItem } from "@/types/cart";
import { createContext } from "react";
interface LoggedInCartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addCartItem: (item: Omit<CartItem, "cartItemId">) => Promise<void>;
  incrementItemQuantity: (cartItemId: number) => Promise<void>;
  decrementItemQuantity: (cartItemId: number) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>; 
}


const LoggedInCartContext = createContext<LoggedInCartContextType | undefined>(
  undefined
);


export default LoggedInCartContext;