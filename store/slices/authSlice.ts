import { AuthCustomer, User } from "@/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
 
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
      state.customer = action.payload.customer;
      state.token = action.payload.token;
    },
    logout(state) {
      state.customer = null;
      state.token = null;
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
 
export default authSlice.reducer;
 