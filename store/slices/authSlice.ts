// store/slices/authSlice.ts
import { AuthCustomer, User } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface AuthState {
  user?: User; // This 'user' property is currently unused in your reducers, 'customer' holds the logged-in user data.
  items?: string[];
  customer: AuthCustomer | null; // This is where the logged-in user's data is stored
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
  user: undefined, // Keeping this as undefined as it's not populated by loginSuccess
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ customer: AuthCustomer; token: string }>) {
      state.customer = action.payload.customer;
      state.token = action.payload.token;
      // If you intend to use 'state.user', you would populate it here, e.g.:
      // state.user = action.payload.customer as User; // Assuming AuthCustomer is compatible with User
    },
    logout(state) {
      state.customer = null;
      state.token = null;
      // state.user = undefined; // Clear user on logout if it was populated
    },

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
// Export selectUser to get the customer object (which contains user details)
export const selectUser = (state: RootState) => state.auth.customer;

export default authSlice.reducer;
