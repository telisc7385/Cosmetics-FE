// api/ApiCore.ts

// 1. Make apiCore generic to expect a specific return type
export const apiCore = async <T>(
  url: string, // This parameter is still named 'url' as in your provided code
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', // PATCH included
  body?: unknown,
  token?: string | null // FIX: Allow token to be string | null | undefined
): Promise<T> => {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
console.log(body,"body")
  // Provide a fallback if NEXT_PUBLIC_BASE_URL is not set, but strongly recommend setting it
  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_BASE_URL is not set. Falling back to default: https://cosmaticadmin.twilightparadox.com");
    baseUrl = "https://cosmaticadmin.twilightparadox.com";
  }

  // --- START: URL Construction Logic ---
  // Ensure baseUrl does not end with a slash
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }

  // Ensure the 'url' parameter (which should be a path) starts with a slash
  // If 'url' already contains the full base URL, this logic needs to adapt,
  // but based on your previous examples, 'url' should be something like '/order/detail/47'
  const finalUrlPath = url.startsWith('/') ? url : `/${url}`;

  const fullUrl = `${baseUrl}${finalUrlPath}`; // Correctly form the full URL
  // --- END: URL Construction Logic ---


  const headers: Record<string, string> = {};

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) { // Handle PATCH for Content-Type
    headers["Content-Type"] = "application/json";
  }

  // Only add Authorization header if token is a non-empty string
  // Changed from `Token ${token}` to `Bearer ${token}` based on your screenshot's evidence.
  // If your backend specifically requires "Token", revert this line.
  if (token && typeof token === 'string' && token.trim() !== '') {
    headers["Authorization"] = `Token ${token}`; // IMPORTANT CHANGE HERE
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    next: { revalidate: 3600 },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) { // Handle PATCH for body
    requestOptions.body = JSON.stringify(body);
  }

  try {
    console.log(`[API Call] ${method} ${fullUrl}`); // Log the full URL for debugging
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
        errorData.message = res.statusText; // Fallback if parsing fails
      }

      console.error(
        `[ Server ] API error: ${res.status} "${errorData.message?.slice(0, 200) || res.statusText}" for ${fullUrl}`
      );
      throw new Error(
        `API error ${res.status}: ${fullUrl} - ${errorData.message?.slice(0, 100) || res.statusText}`
      );
    }

    if (contentType?.includes("application/json")) {
      return await res.json() as T;
    } else {
      console.warn(`[ Server ] Non-JSON response for ${fullUrl}: ${res.status}. Returning null.`);
      return null as T; // Be cautious if T is not nullable
    }
  } catch (error) {
    console.error(`[ Server ] Fetch failed for ${fullUrl}:`, error);
    throw error;
  }
};

// All your existing interfaces should either be here or in a common types file.
// I'm keeping them here for completeness as you provided them in this file's context.

// CartItem interface moved to types/cart.ts for better organization, but defined here for reference
// It should be imported from '@/types/cart' in your slices.
export interface CartItem {
  cartItemId: number;
  id: number; // This is often the productId, check your backend schema
  productId?: number; // Explicit productId if different from 'id'
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId?: number | null; // Can be number, null (no variant), or undefined (not specified)
  variant?: ProductVariant | null; // Full variant object
  product?: any; // Full product object
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
    productId?: number; // Can be productId or id from CartItem
    variantId?: number; // Should be number if present, or undefined
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: "COD" | "RAZORPAY";
}

// Logged-in Checkout Types - CORRECTED TO USE 'addressId'
export interface LoggedInOrderPayload {
  items: {
    productId: number;
    variantId?: number | null;
    quantity: number;
    price: number;
  }[];
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  addressId: string; // This is the delivery address
  billingAddressId: string; // <--- THIS IS THE ONLY CHANGE NEEDED FOR THE TYPE ERROR
}


// UPDATED: Address and AddressInput Interfaces to match your requested structure - REMOVED 'country'
export interface Address {
  id: string; // Assuming string ID from backend
  fullName: string; // Changed from full_name
  phone: string; // Changed from phone_number
  pincode: string; // Changed from zipcode
  state: string;
  city: string;
  addressLine: string; // Changed from address
  landmark?: string; // New optional field
  // country: string; // REMOVED as per request
}

export type AddressInput = Omit<Address, "id">; // For creating/updating, ID is not needed in input

// *** FIX: ADDED LocalAddressItem interface here ***
export interface LocalAddressItem extends Address {
  addressType?: "HOME" | "WORK" | "BOTH" | "BILLING" | "SHIPPING"; // Changed address_type to camelCase
  isDefault?: boolean; // Changed is_default to camelCase
}


// UPDATED: Response Interfaces using the new Address type
export interface SingleAddressResponse {
  address: LocalAddressItem; // The address object itself
  message?: string;
  updated: any;
}

export interface FetchAddressesResponse {
  address: LocalAddressItem[]; // Array of addresses
  message?: string;
}

// NEWLY ADDED: OrderResponse interface
export interface OrderResponse {
  id: string; // The ID of the newly placed order
  message?: string; // A success message from the backend
  // You can add other fields here that your backend returns after creating an order, e.g.:
  // totalAmount: number;
  // status: string;
  // orderNumber?: string;
}

// Interfaces for fetching order details (used in thank-ou page)
export interface OrderItemDetail {
  id: string; // Product ID or Variant ID from the order detail
  name: string;
  quantity: number;
  price: number; // Price per unit at the time of order
  image: string;
  variantId?: string; // Optional variant ID for ordered item
  // Add other fields you expect for an order item from the /order/detail API
}

export interface OrderDetailResponse {
  id: string; // The order ID
  total_amount: number; // Assuming backend still returns snake_case for order details
  payment_method: string;
  order_date: string;
  billing_address: Address; // Now uses the new Address interface
  shipping_address: Address; // Now uses the new Address interface
  items: OrderItemDetail[]; // Array of items in the order
  // Add other order-specific fields like status, delivery_date etc.
}

export interface CartItemFromAPI {
  id: number; // This is the cart item ID
  cartId: number;
  productId: number | null; // Can be null if it's purely a variant
  variantId: number | null; // This can be null from the API
  quantity: number;
  createdAt: string;
  product: { // This would be populated if it's a direct product (no variant)
    id: number;
    name: string;
    description: string;
    sellingPrice: number;
    basePrice: number;
    images: { image: string }[]; // Assuming image structure for direct products
  } | null;
  variant: { // This would be populated if it's a product variant
    id: number;
    productId: number;
    name: string | null; // This is the variant's specific name (e.g., "Red")
    SKU: string;
    description: string | null;
    specification: Record<string, any>; // Or a more specific type if known
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
    product: { // The parent product information for the variant
      name: string;
      description: string;
    };
  } | null;
}