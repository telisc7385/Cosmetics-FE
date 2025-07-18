"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken, selectIsLoggedIn } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";
import { Product } from "@/types/product";
import Image from "next/image";

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

interface Variant {
  id: number;
  name: string | null;
  images: {
    id: number;
    url: string;
    variantId: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

interface Payment {
  id: number;
  method: string;
  status: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: Product | null;
  variant?: Variant | null;
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

interface APIOrderResponse {
  success: boolean;
  result: Order[];
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const token = useAppSelector(selectToken);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      if (!isLoggedIn || !token) {
        setLoading(false);
        setOrders([]);
        return;
      }

      try {
        const response = await apiCore<APIOrderResponse>(
          "/order/history",
          "GET",
          undefined,
          token
        );

        if (
          response &&
          response.success === true &&
          Array.isArray(response.result)
        ) {
          setOrders(response.result);
        } else {
          toast.error("Unexpected order data format from server.");
          setOrders([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load orders.";
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

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading orders...</div>;
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col h-full border border-gray-200 rounded-lg shadow-sm bg-white transition-all duration-300"
            >
              <div
                onClick={() => handleCardClick(order.id)}
                className="p-5 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-semibold text-indigo-700">
                    Order ID: {order.id}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                      order.status
                    )}`}
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
              </div>

              {expandedOrderId === order.id && (
                <div className="border-t border-gray-200 p-5 bg-gray-50 rounded-b-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Items:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {order.items.length > 0 ? (
                      order.items.map((item, index) => {
                        const imageUrl =
                          item.variant?.images?.[0]?.url ||
                          item.product?.images?.[0]?.image ||
                          "";
                        const itemName =
                          item.variant?.name ||
                          item.product?.name ||
                          "Unknown Item";

                        return (
                          <li
                            key={item.id || index}
                            className="flex items-center gap-2"
                          >
                            {imageUrl && (
                              <Image
                                src={imageUrl}
                                alt={itemName}
                                width={32}
                                height={32}
                                className="object-cover rounded"
                              />
                            )}
                            <span>
                              {itemName} (x{item.quantity}) - ₹
                              {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        );
                      })
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
