'use client';

import { useState } from 'react';

type ProductTabProps = {
  productDetails: string;
  keyIngredients: string[];
  benefits: string[];
  howToUse: string;
  reviews?: string[]; // Optional: Can be replaced with review components
  shippingInfo: string;
  returnPolicy: string;
};

export default function ProductTabs({
  productDetails,
  keyIngredients,
  benefits,
  howToUse,
  reviews = [],
  shippingInfo,
  returnPolicy,
}: ProductTabProps) {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className=" mb-5 rounded bg-white p-4 ">


      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm font-medium ">
        <button
          className={`pb-2 ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('details')}
        >
          PRODUCT DETAILS
        </button>
        <button
          className={`pb-2 ${
            activeTab === 'reviews'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('reviews')}
        >
          REVIEWS
        </button>
        <button
          className={`pb-2 ${
            activeTab === 'shipping'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('shipping')}
        >
          SHIPPING & RETURNS
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6 text-sm text-gray-700 leading-relaxed space-y-4">
        {activeTab === 'details' && (
          <div>
            {/* <p>{productDetails}</p> */}
            <div
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ __html: productDetails || '' }}
/>

            <div className="mt-4">
              <h4 className="font-semibold">Key Ingredients</h4>
              <ul className="list-disc list-inside">
                {keyIngredients.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Benefits</h4>
              <ul className="list-disc list-inside">
                {benefits.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">How to Use</h4>
              <p>{howToUse}</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              reviews.map((review, idx) => <p key={idx}>⭐ {review}</p>)
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold">Shipping Information</h4>
              <p dangerouslySetInnerHTML={{ __html: shippingInfo }} />
            </div>
            <div>
              <h4 className="font-semibold">Return Policy</h4>
              <p dangerouslySetInnerHTML={{ __html: returnPolicy }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}