import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { fetchCategories } from "@/api/fetchCategories"
import type { Category } from "@/types/category" // Ensure Subcategory is imported if defined
import CategoryInfo from "@/components/ServersideComponent/CategoryInfo/CategoryInfo"

type Props = {
  params: Promise<{ id: string }>;
};


// Helper function to find category or subcategory by ID
async function findCategoryOrSubcategory(id: string): Promise<Category | null> {
  try {
    const { categories } = await fetchCategories()

    let foundItem: any

    // First, try to find in main categories
    foundItem = categories.find((cat) => cat.id.toString() === id)

    // If not found in main categories, search in subcategories
    if (!foundItem) {
      for (const category of categories) {
        const sub = category.subcategories?.find((subcat) => subcat.id.toString() === id)
        if (sub) {
          foundItem = sub
          break // Found in subcategories, stop searching
        }
      }
    }

    if (!foundItem) {
      return null
    }

    // If a subcategory was found, transform it into a Category-like object
    // as the CategoryInfo component expects a Category type.
    // Note: Subcategories in your JSON don't have seo_title/description,
    // so we'll default them.
    if ("categoryId" in foundItem) {
      // Check if it's a Subcategory
      const subcategory = foundItem as any
      return {
        id: subcategory.id,
        name: subcategory.name,
        banner: subcategory.banner,
        imageUrl: subcategory.imageUrl,
        publicId: subcategory.publicId,
        createdAt: subcategory.createdAt,
        isDeleted: subcategory.isDeleted,
        sequence_number: subcategory.sequence_number,
        is_active: true, // Assuming active if found
        seo_title: `${subcategory.name}: Shop Now | Glam Cosmetics`, // Default SEO title for subcategory
        seo_description: `Explore products in ${subcategory.name} at Glam Cosmetics.`, // Default SEO description for subcategory
        subcategories: [], // Subcategories don't have nested subcategories in this context
        products: [], // Still no product data from fetchCategories
      }
    } else {
      // It's a main category, return as is
      return foundItem as Category
    }
  } catch (error) {
    console.error("❌ Error finding category or subcategory:", error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const category = await findCategoryOrSubcategory(id)

  if (!category) {
    return {} // Return empty metadata if category/subcategory not found
  }

  return {
    title: category.seo_title || category.name || "Category",
    description: category.seo_description || `Shop products in ${category.name}`,
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const categoryData = await findCategoryOrSubcategory(id)

  if (!categoryData) {
    return notFound()
  }

  // IMPORTANT: The `fetchCategories` helper (and its provided JSON response)
  // does not include product data. `initialProducts` will be an empty array.
  // If products are required, you'll need a separate fetch for them.
  const products: any[] = [] // Initialize as empty array

  const category: Category = {
    ...categoryData,
    products: products, // Ensure products array is always present
  }

  console.log("Fetching category/subcategory data for ID:", categoryData)

  return (
    <div className="pt-4">
      <CategoryInfo
        category={category}
        initialProducts={products} // This will be an empty array
        initialPage={1}
        totalPagesFromServer={1} // Assuming 1 page if no product data is fetched
      />
    </div>
  )
}
