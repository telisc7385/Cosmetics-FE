// store/slices/cartSlice.ts
"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/cart"; // Import CartItem from central location

interface CartState {
  items: CartItem[];
}

// Function to get initial state from localStorage
const getInitialState = (): CartState => {
  if (typeof window !== 'undefined') {
    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Ensure parsed items are an array and conform to CartItem type
        if (Array.isArray(parsedCart)) {
          const validItems: CartItem[] = parsedCart.map((item: any) => {
            // Ensure cartItemId is a number; generate if missing or invalid
            const cartItemId = typeof item.cartItemId === 'number' && !isNaN(item.cartItemId)
                               ? item.cartItemId
                               : Date.now() * -1 - Math.random(); // Generate a unique negative ID for guest
            
            // Ensure product ID and name are present
            if (typeof item.id !== 'number' || typeof item.name !== 'string') {
              console.warn("cartSlice: Skipping malformed item from localStorage:", item);
              return null; // Filter out later
            }

            // Construct CartItem, ensuring number types for prices and quantity
            return {
              cartItemId: cartItemId,
              id: item.id,
              name: item.name,
              quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1,
              sellingPrice: typeof item.sellingPrice === 'number' && !isNaN(item.sellingPrice) ? item.sellingPrice : 0,
              basePrice: typeof item.basePrice === 'number' && !isNaN(item.basePrice) ? item.basePrice : 0,
              image: typeof item.image === 'string' ? item.image : "/placeholder.jpg",
              variantId: typeof item.variantId === 'number' ? item.variantId : undefined,
            };
          }).filter(Boolean) as CartItem[]; // Filter out nulls

          return { items: validItems };
        }
      } catch (e) {
        console.error("cartSlice: Failed to parse guest cart from localStorage:", e);
      }
    }
  }

  return { items: [] };
};

const cartSlice = createSlice({
  name: "cart",
  initialState: getInitialState(),
  reducers: {
    // addToCart now expects a CartItem with a cartItemId (even if temporary for guest)
    addToCart: (state, action: PayloadAction<CartItem>) => {
      console.log("cartSlice: addToCart action received. Payload:", action.payload);
      if (!Array.isArray(state.items)) {
        console.warn("cartSlice: state.items was not an array, initializing to [].");
        state.items = [];
      }

      // Find existing item by product ID and variant ID (if applicable)
      // This is for combining quantities of the same product for guests
      const existing = state.items.find((item) => {
        return item.id === action.payload.id &&
               (action.payload.variantId ? item.variantId === action.payload.variantId : true);
      });

      if (existing) {
        existing.quantity += action.payload.quantity;
        console.log("cartSlice: Updated quantity for existing item. New state.items:", state.items);
      } else {
        // Ensure the payload has a cartItemId for new items
        if (typeof action.payload.cartItemId !== 'number') {
            console.warn("cartSlice: addToCart received item without valid cartItemId, generating one.", action.payload);
            action.payload.cartItemId = Date.now() * -1 - Math.random(); // Fallback if somehow missed
        }
        state.items.push(action.payload);
        console.log("cartSlice: Added new item. New state.items:", state.items);
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestCart', JSON.stringify(state.items));
        console.log("cartSlice: Guest cart saved to localStorage.");
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => { // Accepts cartItemId
      console.log("cartSlice: removeFromCart action received. Cart Item ID:", action.payload);
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      state.items = state.items.filter((item) => item.cartItemId !== action.payload);
      console.log("cartSlice: Removed item. New state.items:", state.items);
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestCart', JSON.stringify(state.items));
        console.log("cartSlice: Guest cart saved to localStorage after removal.");
      }
    },

    incrementQuantity: (state, action: PayloadAction<number>) => { // Accepts cartItemId
      console.log("cartSlice: incrementQuantity action received. Cart Item ID:", action.payload);
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      const item = state.items.find((item) => item.cartItemId === action.payload);
      if (item) {
        item.quantity += 1;
        console.log("cartSlice: Incremented quantity. New state.items:", state.items);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestCart', JSON.stringify(state.items));
        console.log("cartSlice: Guest cart saved to localStorage after increment.");
      }
    },

    decrementQuantity: (state, action: PayloadAction<number>) => { // Accepts cartItemId
      console.log("cartSlice: decrementQuantity action received. Cart Item ID:", action.payload);
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      const item = state.items.find((item) => item.cartItemId === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) { // This handles removal if quantity is 0 or less
          console.log("cartSlice: Item quantity is 0 or less, removing item.");
          state.items = state.items.filter(
            (cartItem) => cartItem.cartItemId !== action.payload
          );
        }
        console.log("cartSlice: Decremented quantity. New state.items:", state.items);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestCart', JSON.stringify(state.items));
        console.log("cartSlice: Guest cart saved to localStorage after decrement.");
      }
    },

    clearCart: (state) => {
      console.log("cartSlice: clearCart action received.");
      state.items = [];
      console.log("cartSlice: Cart cleared. New state.items:", state.items);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('guestCart');
        console.log("cartSlice: Guest cart cleared from localStorage.");
      }
    },

    // setCart is typically used to load a cart (e.g., from backend after login)
    // For guest cart, it might be used to explicitly replace the whole cart, e.g., on merge.
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      console.log("cartSlice: setCart action received. Payload:", action.payload);
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      } else {
        console.error("setCart: Payload for setCart was not an array. Received:", action.payload);
        state.items = [];
      }
      console.log("cartSlice: Cart set. New state.items:", state.items);
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestCart', JSON.stringify(state.items));
        console.log("cartSlice: Guest cart saved to localStorage after setCart.");
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export default cartSlice.reducer;