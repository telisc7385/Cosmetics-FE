// ProductCard.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import { Product, ProductVariant } from "@/types/product"; // Assuming Product and ProductVariant types are correctly imported from here
import toast from "react-hot-toast"; // Keep toast import, for other errors if needed
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { MdTune } from "react-icons/md";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { addCartItem } = useLoggedInCart();

  const firstGeneralImage = product.images.find(
    (img) => img.sequence === 1
  )?.image;
  const secondGeneralImage = product.images.find(
    (img) => img.sequence === 2
  )?.image;

  const [hovered, setHovered] = useState(false);
  const [mainDisplayImage, setMainDisplayImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  useEffect(() => {
    let initialImage = firstGeneralImage || "/placeholder.jpg";
    let initialVariant: ProductVariant | null = null;

    if (product.variants && product.variants.length > 0) {
      const defaultSelectedVariant = product.variants.find(
        (v) => v.is_selected
      );
      if (defaultSelectedVariant && defaultSelectedVariant.images.length > 0) {
        initialImage = defaultSelectedVariant.images[0].url;
        initialVariant = defaultSelectedVariant;
      } else if (product.variants[0].images.length > 0) {
        initialImage = product.variants[0].images[0].url;
        initialVariant = product.variants[0];
      }
    }

    setMainDisplayImage(initialImage);
    setSelectedVariant(initialVariant);
  }, [product, firstGeneralImage]);

  const currentMainImageSrc =
    selectedVariant && selectedVariant.images.length > 0
      ? mainDisplayImage
      : hovered && secondGeneralImage
      ? secondGeneralImage
      : firstGeneralImage || "/placeholder.jpg";

  const currentSellingPrice = Number(
    selectedVariant?.selling_price || product.sellingPrice || 0
  );

  const currentBasePrice = Number(
    selectedVariant?.base_price || product.basePrice || 0
  );

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const itemStock =
      product.variants && product.variants.length > 0
        ? selectedVariant?.stock ?? 0
        : product.stock ?? 0;

    const itemPayload = {
      id: product.id,
      name: product.name,
      quantity: 1, // Product card adds 1 at a time
      sellingPrice: currentSellingPrice,
      basePrice: currentBasePrice,
      image: firstGeneralImage || "/placeholder.jpg",
      variantId: selectedVariant?.id || null,
      variant: selectedVariant,
      product: product,
      stock: itemStock,
    };

    if (itemStock === 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    if (isLoggedIn) {
      try {
        await addCartItem(itemPayload);
        // REMOVED: toast.success(`${product.name} added to cart!`);
      } catch (error) {
        toast.error("Failed to add product to cart.");
        return error;
      }
    } else {
      dispatch(
        addToCart({
          ...itemPayload,
          cartItemId: Date.now() * -1 - Math.floor(Math.random() * 1000),
        })
      );
      // REMOVED: toast.success(`${product.name} added to cart!`);
    }
  };

  const isOutOfStock =
    product.variants && product.variants.length > 0
      ? selectedVariant?.stock === 0
      : product.stock === 0;

  return (
    <div
      className="relative group rounded-md overflow-hidden p-2 w-[160px] sm:w-[200px] bg-gradient-to-br from-[#dae6f1] to-white shadow-md hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {product.priceDifferencePercent > 0 && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded z-10">
          {product.priceDifferencePercent}% OFF
        </div>
      )}

      {/* Link only for image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative w-full h-36 rounded-md overflow-hidden bg-white">
          <Image
            src={currentMainImageSrc}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-col mt-2 px-1">
        {/* Product Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-xs font-semibold text-black line-clamp-2 min-h-[32px]">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-row items-baseline gap-1 justify-center mt-1">
          {!isNaN(currentBasePrice) && currentBasePrice > 0 ? (
            <div className="text-base font-bold text-[#213E5A]">
              ₹{currentBasePrice.toFixed(2)}
            </div>
          ) : (
            <div className="text-base font-semibold text-gray-500">
              Price Unavailable
            </div>
          )}

          {!isNaN(currentSellingPrice) &&
            currentSellingPrice > currentBasePrice &&
            currentSellingPrice > 0 && (
              <div className="text-xs text-gray-400 line-through">
                ₹{currentSellingPrice.toFixed(2)}
              </div>
            )}
        </div>

        {/* Buttons - centered below the price */}
        <div className="flex justify-center mt-2 w-full">
          {product.variants && product.variants.length > 0 ? (
            <Link href={`/product/${product.slug}`}>
              <button className="flex items-center gap-1 bg-[#213E5A] text-white text-[11px] px-2 py-1.5 rounded-full">
                <MdTune className="text-sm" /> Variant
              </button>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center gap-1 bg-[#213E5A] text-white text-[11px] px-4 py-1.5 rounded-full ${
                isOutOfStock
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <HiOutlineShoppingBag className="text-sm" /> Add
            </button>
          )}
        </div>

        {isOutOfStock && (
          <p className="text-[11px] text-red-600 text-center mt-1 font-medium">
            Out of Stock
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
