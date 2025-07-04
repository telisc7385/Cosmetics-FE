"use client";
import { useState } from "react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types/product";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import { selectIsLoggedIn } from "@/store/slices/authSlice";
import { addToCart as addGuestCartItem } from "@/store/slices/cartSlice";
import { useLoggedInCart } from "@/CartProvider/LoggedInCartProvider";
import { CartItem } from "@/types/cart";
import ProductTabs from "./ProductTabs";

type Props = {
  product: Product;
  relatedProducts?: Product[];
};

export default function ProductDetailClient({
  product,
  relatedProducts,
}: Props) {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { addCartItem: addLoggedInCartItem } = useLoggedInCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );

  const [selectedImage, setSelectedImage] = useState<string>(
    product.variants?.[0]?.images?.[0]?.url ||
      product.images?.[0]?.image ||
      "/placeholder.png"
  );

  const getAllImages = (): string[] => {
    if (selectedVariant?.images?.length) {
      return selectedVariant.images.map((img) => img.url);
    } else if (product.images?.length) {
      return product.images.map((img) => img.image);
    }
    return ["/placeholder.png"];
  };

  const allImages = getAllImages();

  const sellingPrice =
    selectedVariant?.selling_price || Number(product.sellingPrice);
  const basePrice = Number(product.basePrice) || sellingPrice;
  const discount =
    basePrice && sellingPrice
      ? Math.round(((basePrice - sellingPrice) / basePrice) * 100)
      : 0;

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.images?.length) {
      setSelectedImage(variant.images[0].url);
    } else if (product.images?.length) {
      setSelectedImage(product.images[0].image);
    } else {
      setSelectedImage("/placeholder.png");
    }
  };

  const handleAddToCart = async () => {
    const itemToAdd: Omit<CartItem, "cartItemId"> = {
      id: product.id,
      name: product.name,
      quantity: 1,
      sellingPrice: selectedVariant
        ? selectedVariant.selling_price
        : parseFloat(product.sellingPrice),
      basePrice: parseFloat(product.basePrice),
      image:
        selectedVariant?.images?.[0]?.url ||
        product.images?.[0]?.image ||
        "/placeholder.jpg",
      variantId: selectedVariant?.id || null,
      variant: selectedVariant || null,
      product: product,
    };

    if (selectedVariant && selectedVariant.name) {
      itemToAdd.name = `${product.name} - ${selectedVariant.name}`;
    }

    if (isLoggedIn) {
      try {
        await addLoggedInCartItem(itemToAdd);
        console.log("Product added to logged-in cart:", itemToAdd);
      } catch (error) {
        console.error("Failed to add product to logged-in cart:", error);
      }
    } else {
      const guestCartItem: CartItem = {
        ...itemToAdd,
        cartItemId: Date.now() * -1 - Math.random(),
      };
      dispatch(addGuestCartItem(guestCartItem));
      console.log("Product added to guest cart:", guestCartItem);
    }
  };

  return (
    <section className="bg-[#f3f4f6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 mb-5">
        {/* Left - Image Gallery */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 md:max-h-[450px] overflow-auto md:overflow-visible">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer shrink-0 ${
                  selectedImage === img ? "ring-2 ring-purple-600" : ""
                }`}
              >
                <Image
                  src={img}
                  alt={`Image ${idx + 1}`}
                  width={80}
                  height={80}
                  loading="lazy"
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full aspect-[4/3] bg-white rounded-sm overflow-hidden border border-gray-300">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              loading="lazy"
              className="object-contain p-6"
            />
          </div>
        </div>

        {/* Right - Product Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">
            {product.name} | {product.category.name}
          </h1>

          <div
            className="text-gray-600 text-base line-clamp-3 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || "" }}
          />

          {/* ✅ Conditional Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 text-yellow-500">
              <span>★★★★☆</span>
              {product.ratingCount && (
                <span className="text-gray-500 text-sm">
                  (Based on {product.ratingCount} ratings)
                </span>
              )}
            </div>
          )}

          <div className="space-x-4 flex items-center">
            <div className="text-2xl font-bold text-gray-800">₹{basePrice}</div>
            {discount > 0 && (
              <div className="text-green-600 font-semibold">
                {discount}% Off
              </div>
            )}
            {basePrice && (
              <div className="text-sm text-gray-500">
                MRP <s>₹{sellingPrice}</s> Inclusive of all taxes
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold">Select Variant:</h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    className={`border rounded-md p-1 transition ${
                      selectedVariant?.id === variant.id
                        ? "border-purple-600 ring-2 ring-purple-300"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={variant.images?.[0]?.url || "/placeholder.png"}
                      alt={variant.name || "variant"}
                      width={60}
                      height={60}
                      loading="lazy"
                      className="object-contain w-[30px] h-[30px] rounded"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-4 flex-wrap">
            <button
              onClick={handleAddToCart}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold cursor-pointer"
            >
              Add to Bag
            </button>
            {/* <button className="border border-gray-300 px-6 py-2 rounded-md font-semibold">
              ❤️ Wishlist
            </button> */}
          </div>

          <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span>📦</span> COD available
            </div>
            <div className="flex items-center gap-2">
              <span>↩️</span> 15-Day Return Policy
            </div>
            <div className="flex items-center gap-2">
              <span>🚚</span> Free Delivery On Orders Above ₹50
            </div>
          </div>
        </div>
      </div>

      <ProductTabs
        productDetails={product.productDetails}
        keyIngredients={[]}
        benefits={[]}
        howToUse={""}
        shippingInfo={`Shipping Information
- Free standard shipping on orders over $50
- Standard shipping (5-7 business days)
- Express shipping (2-3 business days) available
- International shipping available to select countries`}
        returnPolicy={`Returns Policy
- 30-day return window
- Items must be unworn with original tags attached
- Free returns on US orders
- See our full returns policy for more details`}
      />

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="text-2xl font-semibold mb-4">
            You may also like product from {product.category.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.slice(0, 5).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
