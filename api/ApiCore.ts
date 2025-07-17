// api/ApiCore.ts

export const apiCore = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  token?: string | null
): Promise<T> => {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log("Body received in apiCore:", body);

  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_BASE_URL is not set. Falling back to default: https://cosmaticadmin.twilightparadox.com");
    baseUrl = "https://cosmaticadmin.twilightparadox.com";
  }

  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
  const finalUrlPath = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${baseUrl}${finalUrlPath}`;

  const headers: Record<string, string> = {};
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    headers["Content-Type"] = "application/json";
  }
  if (token && typeof token === 'string' && token.trim() !== '') {
    headers["Authorization"] = `Token ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    next: { revalidate: 3600 },
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestOptions.body = JSON.stringify(body);
    console.log("JSON Payload being sent (stringified in apiCore):", requestOptions.body);
  }

  try {
    console.log(`[API Call] ${method} ${fullUrl}`);
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
        `[ Server ] API error: ${res.status} "${errorData.message?.slice(0, 200) || res.statusText}" for ${fullUrl}`,
        errorData
      );
      throw new Error(
        `API error ${res.status}: ${fullUrl} - ${errorData.message?.slice(0, 100) || res.statusText}`
      );
    }

    if (contentType?.includes("application/json")) {
      return await res.json() as T;
    } else {
      console.warn(`[ Server ] Non-JSON response for ${fullUrl}: ${res.status}. Returning null.`);
      // Depending on your API's non-JSON responses, you might want to return an empty object or throw an error.
      // For now, keeping it as `null as T` to match the previous behavior, but be aware of this.
      return null as T;
    }
  } catch (error) {
    console.error(`[ Server ] Fetch failed for ${fullUrl}:`, error);
    throw error;
  }
};

// --- Interfaces ---

export interface ProductImage {
  id: number;
  url: string;
  publicId?: string;
  createdAt?: string;
  variantId?: number;
  sequence_number?: number;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sellingPrice: number;
  basePrice: number;
  images: ProductImage[];
}

export interface CartItem {
  cartItemId: number;
  id: number;
  productId: number;
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId: number | null;
  variant?: ProductVariant | null;
  product?: Product;
  slug?: string;
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
  images: ProductImage[];
  product: {
    name: string;
    description: string;
  };
}

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
  discountCode?: string;
}

export interface LoggedInOrderPayload {
  items: {
    productId: number;
    quantity: number;
    price: number;
    variantId?: number | null;
  }[];
  addressId: number;
  totalAmount: number;
  paymentMethod: string;
  discountAmount: number;
  discountCode?: string;
  billingAddress: string;
  shippingAddress: string;
  cartId?: number;
  subtotal: number;
  // Added these properties as per the UserCheckout component's payload
  taxAmount: number;
  appliedTaxRate: number;
  taxType: string;
  isTaxInclusive: boolean;
  shippingRate: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  addressLine: string;
  landmark?: string;
}

export type AddressType = "HOME" | "WORK" | "BILLING" | "SHIPPING";

export type AddressInput = Omit<Address, "id"> & {
  type: AddressType;
};

export interface LocalAddressItem extends Address {
  type: AddressType;
  isDefault: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SingleAddressResponse {
  address: LocalAddressItem;
  message?: string;
  updated?: LocalAddressItem;
}

export interface FetchAddressesResponse {
  address: LocalAddressItem[];
  message?: string;
}

export interface OrderResponse {
  id: string;
  message?: string;
  razorpayOrderId:string
}

export interface OrderItemDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  variantId?: string;
}

export interface OrderDetailResponse {
  id: string;
  total_amount: number;
  payment_method: string;
  order_date: string;
  billing_address: Address;
  shipping_address: Address;
  items: OrderItemDetail[];
}

export interface CartItemFromAPI {
  id: number;
  cartId: number;
  productId: number | null;
  variantId: number | null;
  quantity: number;
  createdAt: string;
  product: {
    id: number;
    name: string;
    description: string;
    sellingPrice: number;
    basePrice: number;
    images: ProductImage[];
  } | null;
  variant: {
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
    images: ProductImage[];
    product: {
      name: string;
      description: string;
    };
  } | null;
}

export interface Category {
  id: number;
  name: string;
  title?: string;
  image?: string;
  parent?: number | null;
}

// Updated Coupon Interface to match UserCheckout.tsx
export interface Coupon {
  id: number;
  name: string; // Added 'name' property
  code: string;
  discount: number; // Changed from discountValue to discount
  expiresAt: string; // Changed from expirationDate to expiresAt
  createdAt: string;
  show_on_homepage: boolean; // Added
  redeemCount: number; // Added
  maxRedeemCount: number; // Added
  // Removed: discountType, minPurchase, maxDiscountAmount, isActive, usageLimitPerUser, totalUsageLimit, description, updatedAt
}

// Interface for coupon validation response from backend
export interface CouponValidationResponse {
  isValid: boolean;
  discountAmount: number;
  appliedCouponDetails?: Coupon; // Optional: include full coupon details if valid
  message?: string; // e.g., "Coupon applied successfully", "Invalid coupon"
}
