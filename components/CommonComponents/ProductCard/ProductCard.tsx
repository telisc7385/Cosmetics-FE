"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import { Product, ProductVariant } from "@/types/cart";
import toast from "react-hot-toast";

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
      sellingPrice: selectedVariant
        ? Number(selectedVariant.selling_price ?? 0)
        : Number(product.sellingPrice ?? 0),
      basePrice: selectedVariant
        ? Number(selectedVariant.base_price ?? 0)
        : Number(product.basePrice ?? 0),
      image: firstGeneralImage || "/placeholder.jpg",
      variantId: selectedVariant?.id || null,
      variant: selectedVariant,
      product: product,
      stock: itemStock,
    };

    if (itemStock <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    if (isLoggedIn) {
      try {
        await addCartItem(itemPayload);
        toast.success(`${product.name} added to cart!`);
      } catch (error) {
        toast.error("Failed to add product to cart.");
      }
    } else {
      dispatch(
        addToCart({
          ...itemPayload,
          cartItemId: Date.now() * -1 - Math.floor(Math.random() * 1000),
        })
      );
      toast.success(`${product.name} added to cart!`);
    }
  };

  const isOutOfStock =
    product.variants && product.variants.length > 0
      ? selectedVariant?.stock === 0
      : product.stock === 0;

  return (
    <div
      className="relative group shadow-md hover:shadow-xl transition-all duration-300 rounded-md p-3 overflow-hidden w-[220px] sm:w-[240px] mx-auto"
      style={{
        background: "linear-gradient(to bottom right, #dae6f1, #ffffff)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {product.priceDifferencePercent > 0 && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md z-10">
          {product.priceDifferencePercent}% OFF
        </div>
      )}

      <Link href={`/product/${product.slug}`} className="block">
        <div>
          <div className="relative w-full h-44 rounded-md overflow-hidden bg-white shadow-inner">
            <Image
              src={currentMainImageSrc}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>

          <h3 className="mt-2 text-center text-base font-semibold text-rose-800 line-clamp-2 min-h-[48px]">
            {product.name}
          </h3>

          <div className="mt-1 flex justify-center items-center gap-2">
          <span className="font-bold text-base" style={{ color: "#213E5A" }}>
    ₹
    {Number(product.basePrice ?? 0)}
  </span>
            <span className="text-sm text-gray-400 line-through">
              ₹
              {selectedVariant
                ? Number(selectedVariant.selling_price ?? 0)
                : Number(product.sellingPrice ?? 0)}
            </span>
          </div>

          {isOutOfStock && (
            <p className="text-center text-sm text-red-600 mt-1 font-medium">
              Out of Stock
            </p>
          )}
        </div>
      </Link>

      <div className="mt-2 flex justify-center">
        {product.variants && product.variants.length > 0 ? (
          <Link href={`/product/${product.slug}`} className="block">
            <button
              type="button"
              className="text-white text-sm px-4 py-1.5 rounded-full transition cursor-pointer"
              style={{ backgroundColor: "#213E5A" }}
            >
              Select Variant
            </button>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`text-white text-sm px-4 py-1.5 rounded-full transition ${
              isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            style={{ backgroundColor: "#213E5A" }}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
