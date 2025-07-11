import { Product } from "./product";

export interface SubSubCategory {
  id: number;
  name: string;
}

export interface SubCategory {
  id: number;
  name: string;
  subsubcategories?: SubSubCategory[];
}

export interface Category {
  products: Product[];
  id: number;
  name: string;
  isDeleted?: boolean;
  subcategories?: SubCategory[];
  imageUrl: string;         // ✅ Already required, no change here
  banner?: string;          // ✅ Add this optional banner field
  description?: string;     // ✅ Add if you’re using `category.description` in any component
}
