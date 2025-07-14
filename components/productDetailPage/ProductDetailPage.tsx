// ProductDetailClient.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types/product";
import ProductCard from "../CommonComponents/ProductCard/ProductCard"; // Keep this, it's for related products
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { addToCart as addGuestCartItem } from "@/store/slices/cartSlice";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import { CartItem } from "@/types/cart";
import ProductTabs from "./ProductTabs";
import toast from "react-hot-toast"; // Keep toast import, for other errors if needed
import Link from "next/link";

type Props = {
  product: Product;
  relatedProducts?: Product[];
};

export default function ProductDetailClient({
  product,
  relatedProducts = [],
}: Props) {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { addCartItem: addLoggedInCartItem } = useLoggedInCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [manualSelectedIndex, setManualSelectedIndex] = useState<number | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getAllImages = (): string[] => {
    if (selectedVariant?.images?.length) {
      return selectedVariant.images.map((img) => img.url);
    }
    if (product.images?.length) return product.images.map((img) => img.image);
    return ["/placeholder.png"];
  };

  const allImages = getAllImages();
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (manualSelectedIndex === null) {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [allImages.length, manualSelectedIndex]);

  useEffect(() => {
    if (manualSelectedIndex !== null) {
      const timeout = setTimeout(() => setManualSelectedIndex(null), 8000);
      return () => clearTimeout(timeout);
    }
  }, [manualSelectedIndex]);

  useEffect(() => {
    const idx = manualSelectedIndex ?? currentImageIndex;
    setSelectedImage(allImages[idx]);
  }, [currentImageIndex, manualSelectedIndex, allImages]);

  const basePrice = Number(product.basePrice);
  const sellingPrice =
    selectedVariant?.selling_price ?? Number(product.sellingPrice);
  const priceDifferencePercent = product.priceDifferencePercent || 0;

  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const isOutOfStock = currentStock === 0;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
    setSelectedImage(
      variant.images?.[0]?.url ??
        product.images?.[0]?.image ??
        "/placeholder.png"
    );
  };

  const handleIncrement = () => {
    if (quantity < currentStock) setQuantity((p) => p + 1);
  };
  const handleDecrement = () => setQuantity((p) => Math.max(1, p - 1));

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Product is out of stock.");
      return;
    }
    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} items available.`);
      setQuantity(currentStock); // Cap the quantity in the input field
      return;
    }

    const item: Omit<CartItem, "cartItemId"> = {
      id: product.id,
      productId: product.id, // ✅ FIXED: Add productId to match CartItem type
      name: selectedVariant?.name
        ? `${product.name} - ${selectedVariant.name}`
        : product.name,
      quantity,
      sellingPrice,
      basePrice,
      image:
        selectedVariant?.images?.[0]?.url ||
        product.images?.[0]?.image ||
        "/placeholder.jpg",
      variantId: selectedVariant?.id ?? null,
      variant: selectedVariant,
      product,
      stock: currentStock,
    };

    if (isLoggedIn) {
      try {
        await addLoggedInCartItem(item);
        // REMOVED: toast.success(`${quantity} ${item.name} added to cart!`);
      } catch {
        toast.error("Failed to add product to cart.");
      }
    } else {
      dispatch(
        addGuestCartItem({
          ...item,
          cartItemId: Date.now() * -1 - Math.random(),
        })
      );
      // REMOVED: toast.success(`${quantity} ${item.name} added to guest cart!`);
    }
  };

  const handleScrollToDescription = () => {
    const el = document.getElementById("product-description-tab");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="bg-[#f3f4f6] py-10 px-4 sm:px-6 lg:px-8">
      {/* Container for both breadcrumb and product detail */}
      <div className="max-w-7xl mx-auto">
        <nav className="mb-4 text-sm text-gray-600">
          <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /{" "}
          <Link href={`/category/${product.category.id}`}>
            {product.category.name}
          </Link>{" "}
          / <span>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-5">
          {/* LEFT */}
          <div className="w-full">
            <div className="relative rounded border border-gray-300 lg:hidden h-[250px] sm:h-[300px]">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-contain p-6"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 justify-center mt-3 lg:hidden">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setManualSelectedIndex(idx)}
                    className={`w-16 h-16 rounded border-2 cursor-pointer ${
                      manualSelectedIndex === idx
                        ? "border-purple-600"
                        : "border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`thumb-${idx}`}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="hidden lg:flex gap-4 w-full">
              <div className="flex flex-col gap-3 max-h-[450px] overflow-hidden">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setManualSelectedIndex(idx);
                      setCurrentImageIndex(idx);
                    }}
                    className={`w-20 h-20 rounded cursor-pointer overflow-hidden ${
                      manualSelectedIndex === idx
                        ? "ring-2 ring-purple-600"
                        : ""
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${idx}`}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="relative w-full aspect-[4/3] rounded border border-gray-300 bg-white">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <h2 className="text-sm sm:text-base text-gray-600">
              {product.category.name}
            </h2>
            <h1 className="text-[#213E5A] text-lg sm:text-xl md:text-2xl font-semibold">
              {product.name}
            </h1>

            <div
              className="text-gray-600 text-sm sm:text-base line-clamp-2 cursor-pointer"
              onClick={handleScrollToDescription}
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />

            {/* 💰 PRICE BLOCK */}
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold text-gray-800">
                ₹{basePrice}
              </div>
              {priceDifferencePercent > 0 && (
                <div className="text-green-600 font-semibold text-base">
                  {priceDifferencePercent}% Off
                </div>
              )}
            </div>

            {/* MODIFIED CODE HERE: Apply line-through only to the base price value */}
            <div className="flex items-center gap-2">
              {basePrice > 0 && (
                <span className="text-gray-500 text-base">
                  {" "}
                  {/* Removed line-through from this span */}
                  MRP ₹<span className="line-through">{sellingPrice}</span>{" "}
                  {/* Applied line-through here */}
                </span>
              )}
              <span className="text-gray-500 text-sm">
                Inclusive of all taxes
              </span>
            </div>

            {currentStock === 0 ? (
              <div className="text-red-600 font-medium">Out of Stock</div>
            ) : currentStock <= 10 ? (
              <div className="text-orange-500 font-medium">
                Only {currentStock} left!
              </div>
            ) : (
              <div className="text-green-600 font-medium">In Stock</div>
            )}

            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold">Select Variant:</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      disabled={variant.stock === 0}
                      className={`border p-2 rounded ${
                        selectedVariant?.id === variant.id
                          ? "border-purple-600"
                          : "border-gray-300"
                      } ${variant.stock === 0 ? "opacity-50" : ""}`}
                    >
                      <Image
                        src={variant.images?.[0]?.url || "/placeholder.png"}
                        alt="Variant"
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 items-center flex-wrap">
              {!isOutOfStock && (
                <div className="flex items-center border border-[#213E5A] rounded-md h-[44px] overflow-hidden text-[#213E5A]">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="px-4 py-2 text-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-5 py-2 text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= currentStock}
                    className="px-4 py-2 text-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                className={`px-6 py-2 text-lg rounded font-medium min-w-[150px] h-[44px] ${
                  isOutOfStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : "Add to Bag"}
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs within the same max-w-7xl container */}
        <div id="product-description-tab" className="text-sm sm:text-base">
          <ProductTabs
            productDetails={product.productDetails}
            ingredients={product.seoDescription}
            benefits={[]}
            shippingInfo="Shipping Info"
            returnPolicy="Return Policy"
          />
        </div>

        {/* Related Products within the same max-w-7xl container */}
        {relatedProducts.length > 0 && (
          <div className="py-10  sm:px-0">
            <h2 className="text-2xl font-semibold mb-4">
              You may also like from {product.category.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>{" "}
      {/* END of max-w-7xl mx-auto container */}
    </section>
  );
}
