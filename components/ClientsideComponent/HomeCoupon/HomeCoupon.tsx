import React, { useState, useEffect } from "react";
import { apiCore, Coupon } from "@/api/ApiCore";
import { useSelector } from "react-redux";
import { selectToken, selectIsLoggedIn } from "@/store/slices/authSlice";

const HomeCoupon: React.FC = () => {
  const token = useSelector(selectToken);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!isLoggedIn || !token) {
        setError("To use these coupons, please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await apiCore<{ success: boolean; data: Coupon[] }>(
          "/coupon/discounts",
          "GET",
          {}, // body
          token // token (used correctly here)
        );

        if (res?.success && Array.isArray(res.data)) {
          const homepageCoupons = res.data.filter((c) => c.show_on_homepage);
          setCoupons(homepageCoupons);
        } else {
          setError("No valid coupons found.");
        }
      } catch (err: any) {
        console.error("Failed to fetch coupons:", err);
        setError("Something went wrong while loading offers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [isLoggedIn, token]);

  if (loading) {
    return (
      <div className="w-full shadow-lg overflow-hidden ">
        <div className="bg-[#22365D] text-white py-2 text-center text-lg font-semibold ">
          Loading coupons...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full shadow-lg overflow-hidden ">
        <div className="bg-red-600 text-white py-2 text-center text-lg font-semibold ">
          {error}
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="w-full shadow-lg overflow-hidden ">
        <div className="bg-[#22365D] text-white py-2 text-center text-lg ">
          No special offers available right now.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full shadow-lg overflow-hidden ">
      <div className="flex flex-col md:flex-row items-center justify-center py-2 bg-[#22365D] text-white ">
        {coupons.map((coupon) => (
          <p
            key={coupon.id}
            className="text-center md:text-left text-md md:text-md px-1"
          >
            Use <span className="font-bold">{coupon.code}</span> for{" "}
            <span className="font-bold">{coupon.discount}%</span> off
          </p>
        ))}
      </div>
    </div>
  );
};

export default HomeCoupon;
