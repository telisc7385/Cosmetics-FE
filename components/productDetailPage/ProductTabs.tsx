"use client";

import { useState } from "react";

type ProductTabProps = {
  productDetails: string;
  ingredients: string;
  benefits: string[];

  reviews?: string[]; // Optional: Can be replaced with review components
  shippingInfo: string;
  returnPolicy: string;
};

export default function ProductTabs({
  productDetails,
  ingredients,
  reviews = [],
  shippingInfo,
  returnPolicy,
}: ProductTabProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="mb-5 rounded bg-white p-4 ">
      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm font-medium ">
        <button
          className={`pb-2 text-xs sm:text-sm ${
            // text-xs for mobile, sm:text-sm for larger screens
            activeTab === "details"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>

        <button
          className={`pb-2 text-xs sm:text-sm ${
            // text-xs for mobile, sm:text-sm for larger screens
            activeTab === "ingredients"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("ingredients")}
        >
          Description
        </button>

        {/* <button
          className={`pb-2 text-xs sm:text-sm ${
            // text-xs for mobile, sm:text-sm for larger screens
            activeTab === "shipping"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("shipping")}
        >
          SHIPPING & RETURNS
        </button> */}
      </div>

      {/* Tab Content */}
      <div className="mt-6 text-sm text-gray-700 leading-relaxed space-y-4">
        {activeTab === "details" && (
          <div>
            <div
              className="prose max-w-none "
              dangerouslySetInnerHTML={{ __html: productDetails || "" }}
            />
          </div>
        )}

        {activeTab === "ingredients" && (
          <div>
            <h4 className="font-semibold text-xl mb-2">Description</h4>
            <p className="text-sm leading-relaxed">{ingredients}</p>
          </div>
        )}

        {/* {activeTab === "reviews" && (
          <div>
            {reviews.length > 0 ? (
              reviews.map((review, idx) => <p key={idx}>⭐ {review}</p>)
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold text-xl">Shipping Information</h4>
              <p
                className="text-md"
                dangerouslySetInnerHTML={{ __html: shippingInfo }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-xl">Return Policy</h4>
              <p
                className="text-md"
                dangerouslySetInnerHTML={{ __html: returnPolicy }}
              />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
