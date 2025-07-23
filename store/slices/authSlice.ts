// store/slices/authSlice.ts
import { AuthCustomer, User } from "@/types/auth"; // Assuming AuthCustomer and User are defined here
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import toast from "react-hot-toast"; // Import toast here

interface AuthState {
  user?: User;
  items?: string[];
  customer: AuthCustomer | null;
  token: string | null;

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
  items: undefined,
  user: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ customer: AuthCustomer; token: string }>) {
      state.customer = {
        id: action.payload.customer.id,
        email: action.payload.customer.email,
        firstName: action.payload.customer.firstName || '',
        lastName: action.payload.customer.lastName || '',
        imageUrl: action.payload.customer.imageUrl || null,
        phone: action.payload.customer.phone || '',
        role: action.payload.customer.role || 'user',
        bio: action.payload.customer.bio || null,
        username: action.payload.customer.username,
      };
      state.token = action.payload.token;
    },
    // MODIFIED: logout reducer now accepts an optional message
    logout(state, action: PayloadAction<{ message?: string } | undefined>) {
      state.customer = null;
      state.token = null;
      // Show toast only if a message is provided in the payload
      if (action.payload?.message) {
        toast.error(action.payload.message);
      }
    },
    updateProfile(state, action: PayloadAction<Partial<AuthCustomer>>) {
      if (state.customer) {
        state.customer = { ...state.customer, ...action.payload };
      }
    },

    // --- Reset Password Flow Reducers (No changes) ---
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
  logout, // Export logout
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
export const selectUser = (state: RootState) => state.auth.customer;
export default authSlice.reducer;