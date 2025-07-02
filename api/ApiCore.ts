// api/ApiCore.ts
 
// 1. Make apiCore generic to expect a specific return type
export const apiCore = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  token?: string | null // FIX: Allow token to be string | null | undefined
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://cosmaticadmin.twilightparadox.com";
  const fullUrl = `${baseUrl}${url}`;
 
  const headers: Record<string, string> = {};
 
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    headers["Content-Type"] = "application/json";
  }
 
  // Only add Authorization header if token is a non-empty string
  if (token && typeof token === 'string' && token.trim() !== '') {
    headers["Authorization"] = `Token ${token}`;
  }
 
  const requestOptions: RequestInit = {
    method,
    headers,
    next: { revalidate: 3600 },
  };
 
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.body = JSON.stringify(body);
  }
 
  try {
    const res = await fetch(fullUrl, requestOptions);
 
    const contentType = res.headers.get("Content-Type");
 
    if (!res.ok) {
      let errorData: any = {};
      try {
        if (contentType?.includes("application/json")) {
          errorData = await res.json();
        } else {
          errorData.message = await res.text();
        }
      } catch (e) {
        errorData.message = res.statusText;
      }
 
      console.error(
        `[ Server ] API error: ${res.status} "${errorData.message?.slice(0, 200) || res.statusText}"`
      );
      throw new Error(
        `API error ${res.status}: ${fullUrl} - ${errorData.message?.slice(0, 100) || res.statusText}`
      );
    }
 
    if (contentType?.includes("application/json")) {
      return await res.json() as T;
    } else {
      console.warn(`[ Server ] Non-JSON response for ${fullUrl}: ${res.status}. Returning null.`);
      // IMPORTANT: If T is expected to be a non-nullable object, returning null here
      // might still lead to runtime errors or require careful handling where apiCore is called.
      // Consider throwing an error or creating a default empty object if JSON is strictly required.
      return null as T;
    }
  } catch (error) {
    console.error(`[ Server ] Fetch failed for ${fullUrl}:`, error);
    throw error;
  }
};
 
// All your existing interfaces should either be here or in a common types file.
// I'm keeping them here for completeness as you provided them in this file's context.
 
export interface CartItem {
  cartItemId: number;
  id: number;
  productId?: number;
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId?: number | null;
  variant?: ProductVariant | null;
  product?: any;
}
 
export interface ProductVariant {
  id: number;
  productId: number;
  name: string | null;
  SKU: string;
  description: string | null;
  specification: Record<string, any>;
  selling_price: number;
  base_and_selling_price_difference_in_percent: number;
  stock: number;
  colour_code: string;
  is_selected: boolean;
  is_active: boolean;
  is_new_arrival: boolean;
  created_by: number;
  low_stock_threshold: number;
  createdAt: string;
  isDeleted: boolean;
  images: {
    id: number;
    url: string;
    publicId: string;
    createdAt: string;
    variantId: number;
    sequence_number: number;
    is_active: boolean;
  }[];
  product: {
    name: string;
    description: string;
  };
}
 
// Guest Checkout Types
export interface GuestOrderPayload {
  email: string;
  address: AddressInput;
  items: {
    productId?: number;
    variantId?: number;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: "COD" | "RAZORPAY";
}
 
// Logged-in Checkout Types
export interface LoggedInOrderPayload {
  items: {
    productId: number;
    variantId?: number;
    quantity: number;
    price: number;
  }[];
  discountAmount: number;
  addressId: string; // Changed to string as per LocalAddressItem.id
  totalAmount: number;
  paymentMethod: string;
  billingAddressId?: string; // Changed to string
}
 
// For Address Form
export interface Address {
  id: string; // Assuming string ID from backend
  full_name: string; // Changed from fullName
  phone_number: string; // Changed from phone
  zipcode: string; // Changed from pincode
  state: string;
  city: string;
  address: string; // Changed from addressLine (assuming this is the main line 1)
  locality: string; // Added for area/locality
  country: string; // Added, as it's in your form components
}
 
export type AddressInput = Omit<Address, "id">;
 
 
// NEW: Response Interfaces (ensure these are NOT generic and are defined only once)
export interface LocalAddressItem extends Address {
    address_type?: "HOME" | "WORK" | "BOTH" | "BILLING" | "SHIPPING"; // Added for more flexibility and consistent with backend
    is_default?: boolean;
}
 
 
export interface OrderResponse {
    id: string; // Order ID
    message?: string; // Common in API responses
    // ... other order details you expect from the API response
    // e.g., status, totalAmount, paymentStatus, etc.
}
 
export interface SingleAddressResponse {
    address: LocalAddressItem;
    message?: string;
}
 
export interface FetchAddressesResponse {
    addresses: LocalAddressItem[];
    message?: string;
}
 