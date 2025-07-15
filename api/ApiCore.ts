// api/ApiCore.ts

// 1. Make apiCore generic to expect a specific return type
export const apiCore = async <T>(
  url: string, // This parameter is still named 'url' as in your provided code
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', // PATCH included
  body?: unknown,
  token?: string | null // FIX: Allow token to be string | null | undefined
): Promise<T> => {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log("Body received in apiCore:", body); // Added for initial inspection

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

  // Crucial for JSON payloads: Set Content-Type header if there's a body for POST/PUT/PATCH
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
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

  // Stringify the body only if it's meant to be a JSON payload for relevant methods
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestOptions.body = JSON.stringify(body);
    console.log("JSON Payload being sent (stringified in apiCore):", requestOptions.body); // Added for debugging
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
        `[ Server ] API error: ${res.status} "${errorData.message?.slice(0, 200) || res.statusText}" for ${fullUrl}`,
        errorData // Log full error data for more context
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

// CartItem interface updated: productId is now mandatory, variantId is mandatory but can be null
export interface CartItem {
  cartItemId: number;
  id: number; // This is often the productId for simplicity, or the cart item's unique ID
  productId: number; // **Made mandatory**: The actual product ID
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId: number | null; // **Made mandatory, but can be null**: The actual variant ID, or null if no variant
  variant?: ProductVariant | null; // Full variant object (optional as it might not always be fetched)
  product?: any; // Full product object (optional as it might not always be fetched)
  slug?: string; // Added slug for navigation
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

// MODIFIED: Logged-in Checkout Types to send string addresses AND new fields
export interface LoggedInOrderPayload {
  items: {
    productId: number;
    quantity: number;
    price: number;
    variantId?: number | null; // Still optional here, as the backend might not always require it
  }[];
  addressId: number; // NEW: Added as per your exact payload. Assuming this refers to the selected delivery address ID.
  totalAmount: number;
  paymentMethod: string;
  discountAmount: number;
  discountCode?: string; // NEW: Added as per your exact payload (optional if not always present)
  billingAddress: string;
  shippingAddress: string;
  cartId?: number; // Keep cartId as optional, confirm with backend if always required
  subtotal: number; // NEW: Added as per your exact payload
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

export type AddressType = "HOME" | "WORK" | "BILLING" | "SHIPPING";

export type AddressInput = Omit<Address, "id"> & {
  type: AddressType; // Explicitly defining the allowed types
};


// *** MODIFIED: LocalAddressItem interface to use 'type' and include other fields from your response ***
export interface LocalAddressItem extends Address {
  type: AddressType; // Use 'type' from backend response
  isDefault: boolean; // Based on your sample, it's a boolean
  userId: number; // Added userId based on your new reference
  createdAt: string; // Added createdAt
  updatedAt: string; // Added updatedAt
}


// UPDATED: Response Interfaces using the new Address type
export interface SingleAddressResponse {
  address: LocalAddressItem; // The address object itself
  message?: string;
  updated?: LocalAddressItem; // Changed from 'any' to LocalAddressItem if backend returns it
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
    // FIX APPLIED HERE: Changed `image` to `url` to match other image interfaces
    images: { id: number; url: string; publicId?: string; }[];
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