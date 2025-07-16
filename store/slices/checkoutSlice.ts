// store/checkoutSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/api/ApiCore'; // Adjust import path based on your project structure

// Define the shape of the applied coupon in your state
interface AppliedCouponState {
  code: string;
  discountAmount: number;
  // You might want to store more details here if needed for UI, e.g., discountType, description
}

interface CheckoutState {
  cartItems: CartItem[]; // Assuming you load cart items into this slice
  appliedCoupon: AppliedCouponState | null;
  subtotal: number; // Raw total before discount
  totalAmount: number; // Final total after discount
  isLoading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  cartItems: [], // Initialize with an empty array or load from a selector/initial dispatch
  appliedCoupon: null,
  subtotal: 0,
  totalAmount: 0,
  isLoading: false,
  error: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    // Action to set cart items, typically fetched from an API
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.cartItems = action.payload;
      state.subtotal = action.payload.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
      // Recalculate totalAmount whenever cartItems change
      if (state.appliedCoupon) {
        // Re-apply discount if a coupon is active
        const discount = Math.min(state.appliedCoupon.discountAmount, state.subtotal); // Ensure discount doesn't exceed subtotal
        state.totalAmount = state.subtotal - discount;
      } else {
        state.totalAmount = state.subtotal;
      }
    },
    // Action to store the successfully applied coupon details
    applyCouponSuccess: (state, action: PayloadAction<AppliedCouponState>) => {
      state.appliedCoupon = action.payload;
      // Recalculate total amount
      const discount = Math.min(action.payload.discountAmount, state.subtotal); // Ensure discount doesn't exceed subtotal
      state.totalAmount = state.subtotal - discount;
      state.error = null;
    },
    // Action to clear the applied coupon (e.g., after order placement or if removed)
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
      state.totalAmount = state.subtotal; // Reset total to subtotal
      state.error = null;
    },
    // Action for setting loading state
    setCheckoutLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Action for setting error messages
    setCheckoutError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    // You might also want actions to update quantities, remove items, etc.
    // updateCartItemQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => { /* ... */ }
  },
});

export const {
  setCartItems,
  applyCouponSuccess,
  clearAppliedCoupon,
  setCheckoutLoading,
  setCheckoutError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;