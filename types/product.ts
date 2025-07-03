export interface ProductImage {
  id: number;
  image: string; // URL for main product images
  sequence: number;
  productId: number;
  createdAt?: string; // Optional, as not always directly used in front-end logic
  updatedAt?: string; // Optional
}
 
export interface ProductVariantImage {
  id: number;
  url: string; // URL for variant images
  publicId: string;
  createdAt: string;
  variantId: number;
  sequence_number: number;
  is_active: boolean;
}
 
export interface ProductVariant {
  id: number;
  productId: number;
  name: string | null;
  SKU: string;
  description: string | null;
  specification: {}; // Or a more specific type
  selling_price: number;
  // base_price: number; // Removed: Not present in your Postman ProductVariant response
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
  images: ProductVariantImage[]; // Variant-specific images
  product: { // Added for more complete variant data, often includes parent product info
    name: string;
    description: string;
  };
}
 
export interface ProductCategory {
  products: any;
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
  imageUrl: string
  productId:number
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  name: string;
  description: string;
  SKU: string;
  basePrice: string; // From main product object, as seen in Postman
  sellingPrice: string; // From main product object, as seen in Postman
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
  productDetails: any; // Or specific type
  images: ProductImage[]; // General product images
  variants?: ProductVariant[]; // Optional variants array
  specifications: any[]; // Or specific type
  category: ProductCategory;
  subcategory: any | null; // Or specific type
}