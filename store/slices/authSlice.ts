// store/slices/authSlice.ts
import { AuthCustomer, User } from "@/types/auth"; // Corrected import path
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface AuthState {
  user?: User; // General 'User' type if you use it elsewhere
  items?: string[]; // Assuming this is an optional array of strings, or remove if unused
  customer: AuthCustomer | null; // Stores the logged-in user's detailed data
  token: string | null;

  // State for password reset flow (as per your original code)
  resetLoading: boolean;
  resetError: string | null;
  resetStep: number;
  resetSuccess: boolean;
}

const initialState: AuthState = {
  customer: null,
  token: null,
  resetLoading: false,
  resetError: null,
  resetStep: 1,
  resetSuccess: false,
  items: undefined, // Default to undefined or an empty array []
  user: undefined,  // Default to undefined
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ customer: AuthCustomer; token: string }>) {
      // Explicitly set customer properties from the payload.
      // Use fallbacks to empty string/null if the API might not always return all fields
      // to satisfy the non-optional types in AuthCustomer.
      state.customer = {
        id: action.payload.customer.id,
        email: action.payload.customer.email,
        firstName: action.payload.customer.firstName || '',
        lastName: action.payload.customer.lastName || '',
        imageUrl: action.payload.customer.imageUrl || null,
        phone: action.payload.customer.phone || '',
        role: action.payload.customer.role || 'user', // Default 'user' role
        bio: action.payload.customer.bio || null,
        username: action.payload.customer.username, // username is optional, no fallback needed
      };
      state.token = action.payload.token;
    },
    logout(state) {
      state.customer = null;
      state.token = null;
    },
    updateProfile(state, action: PayloadAction<Partial<AuthCustomer>>) {
      if (state.customer) {
        // This spreads the existing customer data and then
        // overrides it with any provided fields in action.payload.
        state.customer = { ...state.customer, ...action.payload };
      }
    },

    // --- Reset Password Flow Reducers (Kept as is from your provided code) ---
    resetRequestStart(state) {
      state.resetLoading = true;
      state.resetError = null;
    },
    resetRequestSuccess(state) {
      state.resetLoading = false;
      state.resetStep = 2;
    },
    resetRequestFailure(state, action: PayloadAction<string>) {
      state.resetLoading = false;
      state.resetError = action.payload;
    },
    verifyOtpStart(state) {
      state.resetLoading = true;
      state.resetError = null;
    },
    verifyOtpSuccess(state) {
      state.resetLoading = false;
      state.resetStep = 3;
    },
    verifyOtpFailure(state, action: PayloadAction<string>) {
      state.resetLoading = false;
      state.resetError = action.payload;
    },
    resetPasswordStart(state) {
      state.resetLoading = true;
      state.resetError = null;
    },
    resetPasswordSuccess(state) {
      state.resetLoading = false;
      state.resetSuccess = true;
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.resetLoading = false;
      state.resetError = action.payload;
    },
    resetPasswordFlowReset(state) {
      state.resetLoading = false;
      state.resetError = null;
      state.resetStep = 1;
      state.resetSuccess = false;
    },
  },
});

export const {
  loginSuccess,
  logout,
  updateProfile,
  resetRequestStart,
  resetRequestSuccess,
  resetRequestFailure,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  resetPasswordFlowReset,
} = authSlice.actions;

export const selectToken = (state: RootState) => state.auth.token;
export const selectIsLoggedIn = (state: RootState) => state.auth.token !== null;
export const selectUser = (state: RootState) => state.auth.customer; // Selector for the customer details
export default authSlice.reducer;