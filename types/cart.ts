// types/cart.ts

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

export interface CartItem {
  cartItemId: number;
  id: number; // Changed to strictly number as per your API response for product/variant ID
  name: string;
  quantity: number;
  sellingPrice: number;
  basePrice?: number; // Base price might not always be present or needed on frontend for display
  image: string;
  variantId?: number | null; // *** ADDED 'null' TO THE TYPE HERE ***
  variant?: ProductVariant | null; // Optional, full variant object if needed, can be null
  product?: any; // Optional, full product object if needed (for non-variant items), can be null
}

// Assuming ProductVariant is defined elsewhere or directly in this file
// If ProductVariant needs to allow 'null' for properties like 'name' or 'description',
// ensure those are also updated as 'string | null'. Your current Postman implies this.
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
    // Add other relevant product fields if they exist here
  };
}