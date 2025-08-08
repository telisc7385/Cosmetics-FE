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
      className="group bg-gradient-to-br from-white via-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-[260px] mx-auto overflow-hidden flex flex-col "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative h-[180px] md:h-[200px] bg-white overflow-hidden"
      >
        <Image
          src={currentMainImageSrc}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 ease-in-out scale-100 group-hover:scale-105"
        />
        {product.priceDifferencePercent < 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow-md uppercase tracking-wide">
            {product.priceDifferencePercent.toFixed(0)}% OFF
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-3 flex flex-col text-left flex-grow">
        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-[15px] text-slate-800 font-semibold group-hover:text-[#1e3a8a] transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        {/* Variant Images */}
        {product.variants && product.variants.length > 0 ? (
          <div className="flex gap-2 flex-wrap mt-1 mb-2 max-h-[48px] overflow-hidden">
            {product.variants.map((variant, index) => {
              const variantImage = variant.images[0]?.url;
              if (!variantImage) return null;

              const isSelected = selectedVariant?.id === variant.id;

              return (
                <button
                  key={variant.id}
                  onClick={() => {
                    setMainDisplayImage(variantImage);
                    setSelectedVariant(variant);
                  }}
                  className={`relative w-10 h-10 rounded overflow-hidden border-2 transition ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-offset-1"
                      : "border-gray-300"
                  }`}
                >
                  <Image
                    src={variantImage}
                    alt={`Variant ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )
        : 
        <div className="flex gap-2 flex-wrap mt-1 mb-2 h-[48px] overflow-hidden text-black items-center justify-center">No variations</div>
        }

        {/* Price & Button */}
        <div className="flex justify-between items-start mt-auto">
          <div className="flex flex-col">
            {!isNaN(currentBasePrice) && currentBasePrice > 0 ? (
              <span className="text-base font-semibold text-emerald-600">
                ₹{currentSellingPrice.toFixed(2)}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Price Unavailable</span>
            )}
            {currentBasePrice > currentSellingPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{currentBasePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Button */}
          {product.variants && product.variants.length > 0 ? (
            <Link href={`/product/${product.slug}`}>
              <button className="text-xs md:text-sm flex items-center gap-1 px-3 py-1.5 bg-[#1e3a8a] text-white rounded-full hover:bg-[#172c5d] transition">
                <MdTune className="text-base" />
                Select
              </button>
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`text-xs md:text-sm flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#1e3a8a] text-white hover:bg-[#172c5d]"
              }`}
            >
              <HiOutlineShoppingBag className="text-base" />
              Add
            </button>
          )}
        </div>

        {/* Out of Stock Notice */}
        {isOutOfStock && (
          <p className="text-[11px] text-rose-600 font-medium text-right mt-2">
            Out of Stock
          </p>
        )}
      </div>
    </div>
  );

};

export default ProductCard;
