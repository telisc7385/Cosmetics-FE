// types/cart.ts

export interface ProductImage {
  id: number;
  image: string; // URL for main product images
  sequence: number;
  productId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariantImage {
  id: number;
  url: string;
  publicId: string;
  createdAt: string;
  variantId: number;
  sequence_number: number;
  is_active: boolean;
}

export interface ProductCategory {
  products: any; // Consider a more specific type like Product[] if you have a summary type
  id: number;
  sequence_number: number;
  name: string;
  createdAt: string;
  isDeleted: boolean;
  banner: string;
  imageUrl: string;
  publicId: string;
}

export interface Product {
  ratingCount: number | null;
  rating: number | null;
  imageUrl: string;
  productId?: number;
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  name: string;
  description: string;
  SKU: string;
  basePrice: string; // Still string from API, will be parsed
  sellingPrice: string; // Still string from API, will be parsed
  priceDifferencePercent: number;
  stock: number;
  isNewArrival: boolean;
  createdById: number;
  deletedById: number | null;
  updatedById: number;
  categoryId: number;
  subcategoryId: number | null;
  length: string;
  width: string;
  weight: string;
  slug: string;
  sequenceNumber: number;
  seoTitle: string;
  seoKeyword: string;
  seoDescription: string;
  productDetails: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  specifications: any[];
  category: ProductCategory;
  subcategory: any | null;
}

export interface ProductVariant {
  base_price: any; // Keeping 'any' as per your original request, but 'number' is often preferred if consistently numeric
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
  images: ProductVariantImage[]; // Using the top-level ProductVariantImage interface
  product: { // This refers to the parent product's essential details
    name: string;
    description: string;
    id: number; // Added id here as it was in your previous CartItemFromAPI.variant.product
    // Add other relevant product fields if they exist here (e.g., basePrice)
  };
}

export interface CartItemFromAPI {
  id: number; // This is the cart item ID
  cartId: number;
  productId: number | null; // Can be null if it's purely a variant
  variantId: number | null; // This can be null from the API
  quantity: number;
  createdAt: string;
  product: Product | null; // Using the top-level Product interface
  variant: ProductVariant | null; // Using the top-level ProductVariant interface
}

export interface CartItem {
  cartItemId: number;
  id: number; // Product ID (or main product ID if it's a variant)
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number; // Base price might not always be present or needed on frontend for display
  image: string;
  variantId?: number | null; // Optional, explicitly allowing 'null'
  variant?: ProductVariant | null; // Optional, full variant object, can be null
  product?: Product | null; // Optional, full product object, can be null (changed from 'any')
}

export type CartApiResponse = {
  data?: {
    id?: string | number;
    cart_items?: CartItemFromAPI[];
    [key: string]: any;
  };
  cart?: {
    id?: string | number;
    items?: CartItemFromAPI[];
    [key: string]: any;
  };
  items?: CartItemFromAPI[]; // Fallback for some API response structures
  id?: string | number; // Fallback for some API response structures
  [key: string]: any;
};

// **THE ONLY CHANGE HERE: Made variantId optional to allow 'undefined'**
export interface CartItemInput {
  id: number; // Product ID
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId?: number | null; // Changed from `number | null` to `number | null | undefined` by making it optional
  variant?: ProductVariant | null;
  product?: Product | null;
}

export interface LoggedInCartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addCartItem: (itemToAdd: CartItemInput) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  incrementItemQuantity: (cartItemId: number) => Promise<void>;
  decrementItemQuantity: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  cartId: number | null; // This is the change that directly addresses the TypeScript error.
}