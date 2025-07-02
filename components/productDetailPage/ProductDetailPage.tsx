'use client';
import { useState } from 'react';
import Image from 'next/image';
import ProductTabs from './ProductTabs';
import { Product, ProductVariant } from '@/types/product';
import ProductCard from '../CommonComponents/ProductCard/ProductCard';

type Props = {
  product: Product;
  relatedProducts?: Product[];
};

export default function ProductDetailClient({ product,relatedProducts }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );

  const [selectedImage, setSelectedImage] = useState<string>(
    product.variants?.[0]?.images?.[0]?.url ||
      product.images?.[0]?.image ||
      '/placeholder.png'
  );

  const getAllImages = (): string[] => {
    if (selectedVariant?.images?.length) {
      return selectedVariant.images.map((img) => img.url);
    } else if (product.images?.length) {
      return product.images.map((img) => img.image);
    }
    return ['/placeholder.png'];
  };

  const allImages = getAllImages();

  const sellingPrice = selectedVariant?.selling_price || Number(product.sellingPrice);
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
      setSelectedImage('/placeholder.png');
    }
  };

  return (
    <div className="bg-[#f3f4f6]">
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 py-10 px-10 sm:px-10">
        {/* Left - Image Gallery */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-3 max-h-[450px]">
            {allImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer ${
                  selectedImage === img ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                <Image
                  src={img}
                  alt={`Image ${idx + 1}`}
                  width={80}
                  height={80}
                    loading="lazy"
                  className="object-contain w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="w-full h-[430px] relative rounded-sm overflow-hidden border-1 border-gray-300 bg-white">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
                loading="lazy"
              className="object-contain p-6 w-full"
            />
          </div>
        </div>

        {/* Right - Product Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{product.name}</h1>

          <div
            className="text-gray-600 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description || '' }}
          />

          <div className="flex items-center gap-2 text-yellow-500">
            <span>★★★★☆</span>
            <span className="text-gray-500 text-sm">(Based on 50 ratings)</span>
          </div>

          {/* Price */}
          <div className="space-x-4 flex items-center">
            <div className="text-2xl font-bold text-gray-800">₹{sellingPrice}</div>
            {discount > 0 && (
              <div className="text-green-600 font-semibold">{discount}% Off</div>
            )}
            {basePrice && (
              <div className="text-sm text-gray-500">
                MRP <s>₹{basePrice}</s> Inclusive of all taxes
              </div>
            )}
          </div>

          {/* Variant Selection */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold">Select Variant:</h3>
              <div className="flex gap-3 flex-wrap">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(variant)}
                    className={`border rounded-md p-1 transition ${
                      selectedVariant?.id === variant.id
                        ? 'border-purple-600 ring-2 ring-purple-300'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Image
                      src={variant.images?.[0]?.url || '/placeholder.png'}
                      alt={variant.name || 'variant'}
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

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold">
              Add to Bag
            </button>
            <button className="border border-gray-300 px-6 py-2 rounded-md font-semibold">
              ❤️ Wishlist
            </button>
          </div>

          {/* Delivery Section */}
          <hr className="my-4" />
          <div>
            <h4 className="font-semibold mb-2">Select Delivery Location</h4>
            <p className="text-sm text-gray-500 mb-3">
              Enter the pincode of your area to check product availability and delivery options
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter pincode"
                className="border border-gray-300 rounded-md px-4 py-2 w-70 bg-gray-100 focus:bg-white outline-none"
              />
              <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
                Apply
              </button>
            </div>
          </div>

          {/* Icons */}
          <div className="flex gap-6 mt-6 text-sm text-gray-700">
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

      {/* Product Tabs */}
      <div className="px-10 ">
        <ProductTabs
          productDetails={product.productDetails}
          keyIngredients={[]}
          benefits={[]}
          howToUse={''}
          shippingInfo={`Free standard shipping on orders over $50<br/>
            Standard shipping (5–7 business days)<br/>
            Express shipping (2–3 business days) available<br/>
            International shipping available to select countries`}
              returnPolicy={`30-day return window<br/>
            Items must be unworn with original tags attached<br/>
            Free returns on US orders<br/>
            See our full returns policy for more details`}
            
        />
      </div>

    

    {relatedProducts && relatedProducts.length > 0 && (
        <div className="mx-auto px-4 py-10">
    <h2 className="text-xl font-semibold mb-4">You may also like</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
    {relatedProducts.slice(0, 5).map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  </div>
)}
    </div>
  );
}
