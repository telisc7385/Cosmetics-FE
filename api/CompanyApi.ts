// File: /api/CompanyApi.ts

import { apiCore } from "./ApiCore";

export interface CompanySettings {
  id: string;
  country: string;
  currency: string;
  currency_symbol: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  facebook_icon: string;
  facebook_link: string;
  instagram_icon: string;
  instagram_link: string;
  twitter_icon: string;
  twitter_link: string;
  linkedin_icon: string;
  linkedin_link: string;
  product_low_stock_threshold: number;
  minimum_order_quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettingsApiResponse {
  result: CompanySettings[];
}

export const getCompanySettings = async (): Promise<CompanySettingsApiResponse> => {
  return await apiCore("/company-settings", "GET");
};
