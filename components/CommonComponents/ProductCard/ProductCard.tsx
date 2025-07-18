"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import { Product, ProductVariant } from "@/types/product";
import toast from "react-hot-toast";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { MdTune } from "react-icons/md";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { addCartItem } = useLoggedInCart();

  // ✅ Prevent rendering if product is inactive
  if (!product.isActive) return null;

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
      quantity: 1,
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
      } catch (error) {
        toast.error("Failed to add product to cart.");
        return error;
      }
    } else {
      dispatch(
        addToCart({
          ...itemPayload,
          cartItemId: Date.now() * -1 - Math.floor(Math.random() * 1000),
          productId: product.id,
        })
      );
    }
  };

  const isOutOfStock =
    product.variants && product.variants.length > 0
      ? selectedVariant?.stock === 0
      : product.stock === 0;

  return (
    <div
      className="group bg-white rounded-2xl border border-pink-100 shadow-sm transition-shadow duration-300 w-full max-w-[250px] mx-auto overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative h-52 bg-pink-50"
      >
        <Image
          src={currentMainImageSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 ease-in-out scale-100 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-sm">
          {product.priceDifferencePercent}% OFF
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col text-left">
        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-[13px] text-gray-800 font-semibold mb-1 group-hover:text-[#213C66] transition-colors line-clamp-2 min-h-[34px]">
            {product.name}
          </h3>
        </Link>

        {/* Price + Button */}
        <div className="flex justify-between items-start mt-2 mb-1">
          {/* Price */}
          <div className="flex flex-col">
            {!isNaN(currentBasePrice) && currentBasePrice > 0 ? (
              <span className="text-sm font-bold text-[#007C85]">
                ₹{currentSellingPrice.toFixed(2)}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Price Unavailable</span>
            )}

            {!isNaN(currentSellingPrice) &&
              currentSellingPrice > currentBasePrice && (
                <span className="text-xs text-gray-400 line-through mt-0.5">
                  ₹{currentBasePrice.toFixed(2)}
                </span>
              )}
          </div>

          {/* Action Button */}
          {product.variants && product.variants.length > 0 ? (
            <Link href={`/product/${product.slug}`}>
              <button className="text-[11px] flex items-center gap-1 px-3 py-1.5 bg-[#213C66] text-white rounded-full hover:bg-[#213C66] transition">
                <MdTune className="text-xs" />
                Select {/* ✅ Changed from 'Options' to 'Select' */}
              </button>
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`text-[11px] flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#213C66] text-white hover:bg-[#213C66]"
              }`}
            >
              <HiOutlineShoppingBag className="text-xs" />
              Add
            </button>
          )}
        </div>

        {/* Stock Info */}
        {isOutOfStock && (
          <p className="text-[10px] text-red-600 font-medium text-right mt-1">
            Out of Stock
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
