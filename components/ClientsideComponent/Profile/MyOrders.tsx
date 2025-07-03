// app/account/my-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken, selectIsLoggedIn } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";

// --- Interface Definitions for your Order Data (Same as before) ---
interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt: string | null;
    name: string;
    description: string;
    SKU: string;
    basePrice: string;
    sellingPrice: string;
    priceDifferencePercent: number;
    stock: number;
    isNewArrival: boolean;
    createdById: number;
    deletedById: number | null;
    updatedById: number;
    categoryId: number;
    subcategoryId: number | null;
    length: string;
    width: string;
    weight: string;
    slug: string;
    sequenceNumber: number;
    seoTitle: string;
    seoKeyword: string;
    seoDescription: string;
    productDetails: string | null;
    images?: {
      id: number;
      image: string;
      productId: number;
      createdAt: string;
      updatedAt: string;
    }[];
  } | null;
  variant?: {
    id: number;
    name: string | null;
    images?: {
      id: number;
      url: string;
      variantId: number;
      createdAt: string;
      updatedAt: string;
    }[];
  } | null;
}

interface Payment {
  id: number;
  method: string;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface Address {
  id: number;
  userId: number;
  type: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  addressLine: string;
  landmark: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  subtotal: number | null;
  discountAmount: number;
  discountCode: string;
  createdAt: string;
  updatedAt: string;
  paymentId: number;
  addressId: number;
  items: OrderItem[];
  payment: Payment;
  address: Address;
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to manage which order card is expanded
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const token = useAppSelector(selectToken);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn || !token) {
        console.log(
          "MyOrders: User not logged in or token not available. Not fetching orders."
        );
        setLoading(false);
        setOrders([]);
        return;
      }

      try {
        const response = await apiCore<{ success: boolean; result: any[] }>(
          "/order/history",
          "GET",
          undefined,
          token
        );
        console.log("MyOrders: API Response for /order/history:", response);

        if (
          response &&
          response.success === true &&
          Array.isArray(response.result)
        ) {
          const fetchedOrders: Order[] = response.result.map(
            (orderData: any) => ({
              id: orderData.id,
              userId: orderData.userId,
              totalAmount: parseFloat(orderData.totalAmount),
              status: orderData.status,
              subtotal: orderData.subtotal
                ? parseFloat(orderData.subtotal)
                : null,
              discountAmount: parseFloat(orderData.discountAmount),
              discountCode: orderData.discountCode,
              createdAt: orderData.createdAt,
              updatedAt: orderData.updatedAt,
              paymentId: orderData.paymentId,
              addressId: orderData.addressId,
              items: orderData.items.map((item: any) => ({
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: parseFloat(item.price),
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                product: item.product
                  ? {
                      ...item.product,
                      basePrice: parseFloat(item.product.basePrice),
                      sellingPrice: parseFloat(item.product.sellingPrice),
                      images: item.product.images || [],
                    }
                  : null,
                variant: item.variant
                  ? {
                      ...item.variant,
                      images: item.variant.images || [],
                    }
                  : null,
              })),
              payment: {
                id: orderData.payment.id,
                method: orderData.payment.method,
                status: orderData.payment.status,
                transactionId: orderData.payment.transactionId,
                paidAt: orderData.payment.paidAt,
                createdAt: orderData.payment.createdAt,
              },
              address: {
                id: orderData.address.id,
                userId: orderData.address.userId,
                type: orderData.address.type,
                fullName: orderData.address.fullName,
                phone: orderData.address.phone,
                pincode: orderData.address.pincode,
                state: orderData.address.state,
                city: orderData.address.city,
                addressLine: orderData.address.addressLine,
                landmark: orderData.address.landmark,
                isDefault: orderData.address.isDefault,
                createdAt: orderData.address.createdAt,
                updatedAt: orderData.address.updatedAt,
              },
            })
          );
          setOrders(fetchedOrders);
          console.log("MyOrders: Orders loaded successfully.");
        } else {
          console.warn(
            "MyOrders: Unexpected API response structure for /order/history",
            response
          );
          toast.error("Unexpected order data format from server.");
          setOrders([]);
        }
      } catch (err: any) {
        console.error("MyOrders: Failed to fetch orders:", err);
        const errorMessage = err.message || "Failed to load orders.";
        setError(errorMessage);
        toast.error(errorMessage);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, token]);

  const handleCardClick = (orderId: number) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error: {error}</p>
        {!isLoggedIn && (
          <p className="mt-2">Please log in to view your orders.</p>
        )}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md"
              onClick={() => handleCardClick(order.id)}
            >
              {/* Small Card View (Always visible) */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-lg font-semibold text-indigo-700">
                  Order ID: {order.id}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "CONFIRMED"
                      ? "bg-green-100 text-green-800"
                      : order.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-gray-700 mb-1">
                Total Amount: ₹{order.totalAmount.toFixed(2)}
              </p>
              <p className="text-gray-600 text-sm">
                Ordered on:{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>

              {/* Expanded Details (Conditionally rendered) */}
              {expandedOrderId === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-2">Items:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {order.items.length > 0 ? (
                      order.items.map((item, itemIndex) => (
                        <li
                          key={item.id || itemIndex}
                          className="flex items-center gap-2"
                        >
                          {(() => {
                            const imageUrl =
                              item.variant?.images?.[0]?.url ||
                              item.product?.images?.[0]?.image ||
                              "";
                            const itemName =
                              item.variant?.name ||
                              item.product?.name ||
                              "Unknown Item";
                            return (
                              <>
                                {imageUrl && (
                                  <img
                                    src={imageUrl}
                                    alt={itemName}
                                    className="w-8 h-8 object-cover rounded"
                                  />
                                )}
                                <span>
                                  {itemName} (x{item.quantity}) - ₹
                                  {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </>
                            );
                          })()}
                        </li>
                      ))
                    ) : (
                      <li>No items found for this order.</li>
                    )}
                  </ul>

                  <h3 className="font-medium text-gray-700 mt-4 mb-2">
                    Payment Details:
                  </h3>
                  <p className="text-gray-600">
                    Method: {order.payment.method}
                  </p>
                  <p className="text-gray-600">
                    Payment Status: {order.payment.status}
                  </p>

                  <h3 className="font-medium text-gray-700 mt-4 mb-2">
                    Shipping Address:
                  </h3>
                  <p className="text-gray-600">{order.address.fullName}</p>
                  <p className="text-gray-600">
                    {order.address.addressLine},{" "}
                    {order.address.landmark && `${order.address.landmark}, `}
                    {order.address.city}, {order.address.state} -{" "}
                    {order.address.pincode}
                  </p>
                  <p className="text-gray-600">Phone: {order.address.phone}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
