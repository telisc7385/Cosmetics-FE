// components/ClientsideComponent/ProductCard/ProductCard.tsx
"use client";
 
import { useState, useEffect } from "react";
import Image from "next/image";
import CartButton from "@/components/CommonComponents/CartButton/CartButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { selectToken } from "@/store/slices/authSlice";
import { useLoggedInCart } from "@/Providers/LoggedInCartProvider";
import { CartItem } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product"; // Ensure these are imported from your central types file
import Link from "next/link";
import router from "next/router";

 
interface Props {
  product: Product; // Now uses the imported Product type
}
 
const ProductCard = ({ product }: Props) => {
  // Find the first and second general product images (used as fallback/initial)
  const firstGeneralImage = product.images.find(
    (img) => img.sequence === 1
  )?.image;
  const secondGeneralImage = product.images.find(
    (img) => img.sequence === 2
  )?.image;
 
  const [hovered, setHovered] = useState(false);
  // State for the main displayed image
  const [mainDisplayImage, setMainDisplayImage] = useState<string>("");
  // State for the currently selected variant
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
 
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const loggedInCart = useLoggedInCart();
 
  useEffect(() => {
    // Determine the initial main display image and selected variant
    let initialImage = firstGeneralImage || "/placeholder.jpg";
    let initialVariant: ProductVariant | null = null;
 
    if (product.variants && product.variants.length > 0) {
      // Find the initially selected variant if available
      const defaultSelectedVariant = product.variants.find(
        (v) => v.is_selected
      );
      if (defaultSelectedVariant && defaultSelectedVariant.images.length > 0) {
        initialImage = defaultSelectedVariant.images[0].url; // Use first image of the selected variant
        initialVariant = defaultSelectedVariant;
      } else if (product.variants[0].images.length > 0) {
        // Fallback: use the first image of the first variant if no variant is_selected
        initialImage = product.variants[0].images[0].url;
        initialVariant = product.variants[0];
      }
    }
 
    setMainDisplayImage(initialImage);
    setSelectedVariant(initialVariant);
  }, [product, firstGeneralImage]); // Re-run if product data changes
 
  // Function to handle variant selection
  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // Set the main display image to the first image of the selected variant
    if (variant.images && variant.images.length > 0) {
      setMainDisplayImage(variant.images[0].url);
    } else {
      setMainDisplayImage(firstGeneralImage || "/placeholder.jpg"); // Fallback
    }
    setHovered(false); // Reset hover effect when a variant is explicitly selected
  };
 
  const handleAddToCart = async (product: Product) => {
    // Use selected variant's details if a variant is chosen, otherwise use base product details
    const itemForAPI: Omit<CartItem, "cartItemId"> = {
      id: product.id, // This is the product's base ID
      name: product.name,
      quantity: 1,
      sellingPrice: selectedVariant
        ? selectedVariant.selling_price
        : parseFloat(product.sellingPrice),
      basePrice: parseFloat(product.basePrice), // Variants don't have basePrice directly per Postman, use product's basePrice
      image: mainDisplayImage || "/placeholder.jpg", // Use the currently displayed image (which is the variant image if selected)
      variantId: selectedVariant?.id, // Pass the ID of the selected variant
    };
 
    console.log("ProductCard: Item being prepared for cart:", itemForAPI);
 
    if (token) {
      console.log(
        "ProductCard: Logged-in user initiating add with item data:",
        itemForAPI
      );
      await loggedInCart.addCartItem(itemForAPI);
      console.log(
        "ProductCard: Logged-in addCartItem call finished and UI optimistically updated."
      );
    } else {
      console.log(
        "ProductCard: Guest user adding product to Redux cart with item data:",
        itemForAPI
      );
      const guestCartItem: CartItem = {
        ...itemForAPI,
        cartItemId: Date.now() * -1 - Math.random(),
      };
      dispatch(addToCart(guestCartItem));
    }
    router.push("/cart");
  };
 
  // Determine the image for the main product display based on hover or selected variant
  const currentMainImageSrc =
    selectedVariant && selectedVariant.images.length > 0
      ? mainDisplayImage
      : hovered && secondGeneralImage
      ? secondGeneralImage
      : firstGeneralImage || "/placeholder.jpg";
 
  return (
    <Link href={`/product/${product.slug}`} className="block">
    <div className="group relative w-full max-w-[250px] mx-auto rounded-lg overflow-hidden shadow-md border border-pink-100 bg-white/70 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:scale-[1.015]">
      <div className="relative z-10 pb-4">
        {/* Main Product Image Area */}
        <div
          className="bg-[#F3F6F7] px-3 pt-3 pb-2 rounded-t-lg"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="overflow-hidden rounded-md h-[130px] flex justify-center items-center">
            <Image
              src={currentMainImageSrc}
              alt={product.name}
              width={160}
              height={160}
              className={`object-contain transition-transform duration-500 ${
                hovered && secondGeneralImage && !selectedVariant
                  ? "scale-110"
                  : "scale-100"
              }`}
            />
          </div>
        </div>
 
        {/* Horizontal Round Variant Thumbnails */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex justify-center gap-2 px-3 pt-2">
            {product.variants.map(
              (variant) =>
                variant.images &&
                variant.images.length > 0 && (
                  <Image
                    key={variant.id}
                    src={variant.images[0].url} // Display first image of each variant as thumbnail
                    alt={`Variant ${variant.id}`}
                    width={40}
                    height={40}
                    className={`cursor-pointer rounded-full border-2 ${
                      selectedVariant?.id === variant.id
                        ? "border-purple-500"
                        : "border-gray-200"
                    } hover:border-purple-400 transition-all duration-200 object-cover`}
                    onClick={() => handleVariantSelect(variant)}
                  />
                )
            )}
          </div>
        )}
 
        {/* Product Name */}
        <h3 className="mt-2 px-3 text-sm font-semibold text-center text-pink-800 line-clamp-2">
          {product.name}
        </h3>
 
        {/* Price Information */}
        <div className="mt-1 flex justify-center gap-2 items-center">
          <span className="text-base font-bold text-pink-600">
            ₹
            {selectedVariant
              ? selectedVariant.selling_price.toFixed(2)
              : parseFloat(product.sellingPrice).toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 line-through">
            ₹{parseFloat(product.basePrice).toFixed(2)}{" "}
            {/* Always use product's basePrice */}
          </span>
        </div>
 
        {/* Add to Cart Button */}
        <div className="mt-3 flex justify-center px-3">
          <CartButton onClick={() => handleAddToCart(product)} />
        </div>
      </div>
      </div>
      </Link>
  );
};
 
export default ProductCard;