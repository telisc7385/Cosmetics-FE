// types/category.ts
import type { Product } from "./product";

export interface SubSubCategory {
  id: number;
  name: string;
}

export interface SubCategory {
  slug: string; // Changed from any to string for type consistency
  title?: string; // Changed from React.ReactNode to string | undefined
  id: number;
  name: string;
  subsubcategories?: SubSubCategory[];
}

export interface Category {
  slug: string;
  title?: string; // Changed from React.ReactNode to string | undefined
  products: Product[];
  id: number;
  name: string;
  isDeleted?: boolean;
  publicId?: string;
  createdAt?: string;
  sequence_number?: number;
  is_active?: boolean;
  subcategories?: SubCategory[];
  seo_title?: string;
  seo_description?: string;
  imageUrl: string;
  banner?: string;
  description?: string;
  parent?: number | null;
}
