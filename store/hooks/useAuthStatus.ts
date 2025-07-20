// src/hooks/useAuthStatus.ts
import { useAppSelector } from "@/store/hooks/hooks"; // Adjust path as needed
import { selectToken } from "@/store/slices/authSlice"; // Adjust path as needed

export const useAuthStatus = () => {
  const token = useAppSelector(selectToken);
  return {
    isLoggedIn: !!token, // True if token exists
    token,
  };
};