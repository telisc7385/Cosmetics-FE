import { apiCore } from "./ApiCore";

export interface NavbarItem {
  id: number;
  sequence_number: number;
  name: string;
  link: string;
  is_active: boolean;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

interface NavbarApiResponse {
  success: boolean;
  result: NavbarItem[];
}

export const getNavbarData = async (): Promise<NavbarApiResponse> => {
  return await apiCore("/header", "GET");
};
