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
  stock: number; // ADDED: Stock property
  isNewArrival: boolean;
  createdById: number;
  deletedById: number | null;
  updatedById: number;
  categoryId: number;
  subcategoryId: number | null;
  length: string;
  width: string;
  weight: string;
  slug: string; // This property is correctly defined here
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
  base_price: number; // Changed to number assuming it's numeric in practice
  id: number;
  productId: number;
  name: string | null;
  SKU: string;
  description: string | null;
  specification: Record<string, any>;
  selling_price: number;
  base_and_selling_price_difference_in_percent: number;
  stock: number; // ADDED: Stock property
  colour_code: string;
  is_selected: boolean;
  is_active: boolean;
  is_new_arrival: boolean;
  created_by: number;
  low_stock_threshold: number;
  createdAt: string;
  isDeleted: boolean;
  images: ProductVariantImage[];
  product: {
    // This refers to the parent product's essential details
    name: string;
    description: string;
    id: number;
    slug?: string; // It's a good idea to add slug here too if variant's product includes it
  };
}

export interface CartItemFromAPI {
  id: number | string; // This is the cart item ID, allowing string from API for robustness
  cartId: number | string; // Allowing string from API for robustness
  productId: number | string | null; // Allowing string from API for robustness
  variantId: number | string | null; // Allowing string from API for robustness
  quantity: number;
  createdAt: string;
  product: Product | null;
  variant: ProductVariant | null;
}

export interface CartItem {
  productId: number | undefined;
  cartItemId: number; // Ensured to be number after parsing
  id: number; // Product ID (ensured to be number after parsing)
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId?: number | null; // Keeps as number or null, optional
  variant?: ProductVariant | null;
  product?: Product | null;
  stock: number; // ADDED: Consolidated stock property
  slug?: string | null; // Allow slug to be string or null
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
  id?: string | number;
  [key: string]: any;
};

export interface CartItemInput {
  id: number; // Product ID
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number;
  image: string;
  variantId?: number | null;
  variant?: ProductVariant | null;
  product?: Product | null;
  stock: number; // ADDED: Stock property when inputting to cart
  slug?: string | null; // <--- **This is the only line changed here**
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
  cartId: number | null;
}