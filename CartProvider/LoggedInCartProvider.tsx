// Providers/LoggedInCartProvider.tsx
"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";
import LoggedInCartContext from "./LoggedInCartContext"; // Correct import

// Import types from their new files
import { CartItem, CartItemFromAPI } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product"; // Ensure Product and ProductVariant are imported if used in CartItem

const parseCartResponse = (response: any): CartItem[] => {
  console.log(
    "LoggedInCartProvider: Raw response to parse (GET /cart):",
    response
  );
  let rawCartItems: any[] = [];

  try {
    if (
      response &&
      typeof response === "object" &&
      response.data &&
      typeof response.data === "object" &&
      Array.isArray(response.data.cart_items)
    ) {
      rawCartItems = response.data.cart_items;
      console.log(
        "LoggedInCartProvider: Parsed as object with 'data.cart_items' array."
      );
    } else if (
      response &&
      typeof response === "object" &&
      response.cart &&
      Array.isArray(response.cart.items)
    ) {
      rawCartItems = response.cart.items;
      console.log(
        "LoggedInCartProvider: Parsed as object with 'cart.items' array."
      );
    } else if (
      response &&
      typeof response === "object" &&
      Array.isArray(response.items)
    ) {
      rawCartItems = response.items;
      console.log("LoggedInCartProvider: Parsed as object with 'items' array.");
    } else {
      console.warn(
        "LoggedInCartProvider: Unexpected GET /cart response structure. Please adjust parseCartResponse.",
        response
      );
      return [];
    }

    // --- Filter out malformed or empty items before mapping ---
    const filteredRawCartItems = rawCartItems.filter((item: any) => {
      const cartItemIdExists =
        item &&
        typeof item === "object" &&
        item.id !== undefined &&
        item.id !== null;

      const productIdExists =
        (item.productId !== undefined && item.productId !== null) ||
        (item.product &&
          item.product.id !== undefined &&
          item.product.id !== null) ||
        (item.product &&
          item.product.productId !== undefined &&
          item.product.productId !== null) ||
        (item.variant &&
          item.variant.productId !== undefined &&
          item.variant.productId !== null);

      if (!cartItemIdExists || !productIdExists) {
        console.warn(
          "LoggedInCartProvider: Skipping malformed cart item due to missing critical IDs (id or product/variant productId):",
          item
        );
        return false;
      }
      return true;
    });
    // --- END FILTER ---

    const items: CartItem[] = filteredRawCartItems.map(
      (item: CartItemFromAPI) => {
        console.log(
          "LoggedInCartProvider: Processing valid raw cart item:",
          item
        );

        const cartItemId = item.id;
        const productId =
          item.productId || item.product?.id || item.variant?.productId;

        console.log(
          `Extracted: cartItemId = ${cartItemId}, productId = ${productId}`
        );

        if (!cartItemId || !productId) {
          console.error(
            "LoggedInCartProvider: Critical ID still missing after filter. This indicates an issue with filter logic.",
            {
              rawItem: item,
              extractedCartItemId: cartItemId,
              extractedProductId: productId,
            }
          );
          throw new Error("Backend response missing cartItemId or productId.");
        }

        const quantity = item.quantity;

        let displayName = "Unknown Product";

        if (item.variant && item.variant.product?.name) {
          displayName = item.variant.product.name;
          if (item.variant.name) {
            // Only append variant name if it's not null
            displayName += ` - ${item.variant.name}`;
          }
        } else if (item.product?.name) {
          // Fallback for direct product items
          displayName = item.product.name;
        }

        const image =
          item.variant?.images?.[0]?.url ||
          item.product?.images?.[0]?.image ||
          "/placeholder.jpg";

        const sellingPrice = parseFloat(
          item.variant?.selling_price?.toString() ||
            item.product?.sellingPrice?.toString() ||
            "0"
        );

        const basePrice = parseFloat(
          item.product?.basePrice?.toString() || "0"
        );

        const variantId = item.variant?.id || item.variantId;

        console.log("LoggedInCartProvider: Mapped cart item (after parsing):", {
          cartItemId,
          id: productId,
          name: displayName,
          quantity,
          sellingPrice,
          basePrice,
          image,
          variantId,
          variant: item.variant,
          product: item.product,
          rawItem: item,
        });

        return {
          cartItemId: cartItemId,
          id: productId,
          name: displayName,
          quantity: quantity,
          sellingPrice: sellingPrice,
          basePrice: basePrice,
          image: image,
          variantId: variantId,
          variant: item.variant,
          product: item.product,
        };
      }
    );
    console.log("LoggedInCartProvider: Parsed items:", items);
    return items;
  } catch (parseError) {
    console.error(
      "LoggedInCartProvider: Error mapping cart items:",
      parseError
    );
    return [];
  }
};

export function LoggedInCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector(selectToken);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      console.log(
        "LoggedInCartProvider: No token, clearing items and finishing fetch."
      );
      return;
    }

    setLoading(true);
    setError(null);
    console.log(
      "LoggedInCartProvider: fetchCartItems initiated. Token present."
    );
    try {
      const response = await apiCore("/cart", "GET", undefined, token);
      console.log(
        "LoggedInCartProvider: Raw response from GET /cart API call:",
        response
      );
      const fetchedItems = parseCartResponse(response);
      setItems(fetchedItems);
      console.log(
        "LoggedInCartProvider: Items set successfully after GET /cart."
      );
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to fetch cart items:", err);
      setError(err.message || "Failed to fetch cart items.");
      setItems([]);
    } finally {
      setLoading(false);
      console.log("LoggedInCartProvider: fetchCartItems finished.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [token, fetchCartItems]);

  const addCartItem = useCallback(
    async (itemToAdd: Omit<CartItem, "cartItemId">) => {
      if (!token) {
        console.warn("Attempted to add cart item without token (logged out).");
        return;
      }

      setError(null);
      const prevItems = [...items];

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => {
          return (
            item.id === itemToAdd.id &&
            (itemToAdd.variantId
              ? item.variantId === itemToAdd.variantId
              : true)
          );
        });

        if (existingItem) {
          return currentItems.map((item) =>
            item.cartItemId === existingItem.cartItemId
              ? { ...item, quantity: item.quantity + itemToAdd.quantity }
              : item
          );
        } else {
          const tempCartItemId = Date.now() * -1;
          // When adding, prioritize variant.product.name for the display name if variant.name is null
          let newItemName = itemToAdd.name; // This will be the initial product.name from ProductCard
          if (itemToAdd.variant?.product?.name) {
            // Check if variant.product.name exists
            newItemName = itemToAdd.variant.product.name;
            if (itemToAdd.variant.name) {
              // Append variant name ONLY if it exists
              newItemName += ` - ${itemToAdd.variant.name}`;
            }
          }

          return [
            ...currentItems,
            { ...itemToAdd, cartItemId: tempCartItemId, name: newItemName },
          ];
        }
      });

      try {
        const payload = {
          productId: itemToAdd.id,
          quantity: itemToAdd.quantity,
          ...(itemToAdd.variantId && { variantId: itemToAdd.variantId }),
        };
        console.log(
          "LoggedInCartProvider: Calling API for /cart/add with payload:",
          payload
        );
        await apiCore("/cart/add", "POST", payload, token);
        console.log("LoggedInCartProvider: /cart/add successful.");
        await fetchCartItems();
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to add cart item:", err);
        setError(err.message || "Failed to add item to cart.");
        setItems(prevItems);
      }
    },
    [token, items, fetchCartItems]
  );

  const removeCartItem = useCallback(
    async (cartItemId: number) => {
      if (!token) return;
      setError(null);
      const prevItems = [...items];

      setItems((currentItems) =>
        currentItems.filter((item) => item.cartItemId !== cartItemId)
      );

      try {
        console.log(
          "LoggedInCartProvider: Calling API for /cart/remove/",
          cartItemId
        );
        await apiCore(`/cart/remove/${cartItemId}`, "DELETE", undefined, token);
        console.log("LoggedInCartProvider: /cart/remove successful.");
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to remove cart item:", err);
        setError(err.message || "Failed to remove item from cart.");
        setItems(prevItems);
      }
    },
    [token, items]
  );

  const incrementItemQuantity = useCallback(
    async (cartItemId: number) => {
      if (!token) return;
      setError(null);
      const prevItems = [...items];

      const currentItem = items.find((item) => item.cartItemId === cartItemId);
      if (!currentItem) {
        console.warn("Attempted to increment non-existent item.");
        return;
      }

      const newQuantity = currentItem.quantity + 1;

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.cartItemId === currentItem.cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      try {
        console.log(
          "LoggedInCartProvider: Calling API for /cart/update with payload:",
          { cartItemId: currentItem.cartItemId, quantity: newQuantity }
        );
        await apiCore(
          `/cart/update/${currentItem.cartItemId}`,
          "PUT",
          { quantity: newQuantity },
          token
        );
        console.log("LoggedInCartProvider: Increment successful.");
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to increment quantity:",
          err
        );
        setError(err.message || "Failed to increment item quantity.");
        setItems(prevItems);
      }
    },
    [token, items]
  );

  const decrementItemQuantity = useCallback(
    async (cartItemId: number) => {
      if (!token) return;
      setError(null);
      const prevItems = [...items];

      const currentItem = items.find((item) => item.cartItemId === cartItemId);
      if (!currentItem) {
        console.warn("Attempted to decrement non-existent item.");
        return;
      }

      const newQuantity = currentItem.quantity - 1;

      setItems((currentItems) => {
        if (newQuantity <= 0) {
          return currentItems.filter(
            (item) => item.cartItemId !== currentItem.cartItemId
          );
        } else {
          return currentItems.map((item) =>
            item.cartItemId === currentItem.cartItemId
              ? { ...item, quantity: newQuantity }
              : item
          );
        }
      });

      try {
        if (newQuantity <= 0) {
          console.log(
            "LoggedInCartProvider: Decrementing to 0 or less, removing item by cartItemId:",
            currentItem.cartItemId
          );
          await apiCore(
            `/cart/remove/${currentItem.cartItemId}`,
            "DELETE",
            undefined,
            token
          );
        } else {
          console.log(
            "LoggedInCartProvider: Calling API for /cart/update (decrement) with payload:",
            { cartItemId: currentItem.cartItemId, quantity: newQuantity }
          );
          await apiCore(
            `/cart/update/${currentItem.cartItemId}`,
            "PUT",
            { quantity: newQuantity },
            token
          );
        }
        console.log("LoggedInCartProvider: Decrement successful.");
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to decrement quantity:",
          err
        );
        setError(err.message || "Failed to decrement item quantity.");
        setItems(prevItems);
      }
    },
    [token, items]
  );

  const clearCart = useCallback(async () => {
    if (!token) return;
    setError(null);
    const prevItems = [...items];

    setItems([]);

    try {
      console.log("LoggedInCartProvider: Calling API for /cart/clear.");
      await apiCore("/cart/clear", "DELETE", undefined, token);
      console.log("LoggedInCartProvider: /cart/clear successful.");
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart.");
      setItems(prevItems);
    }
  }, [token, items]);

  const contextValue = {
    items,
    loading,
    error,
    addCartItem,
    removeCartItem,
    incrementItemQuantity,
    decrementItemQuantity,
    clearCart,
    refetchCart: fetchCartItems,
  };

  return (
    <LoggedInCartContext.Provider value={contextValue}>
      {children}
    </LoggedInCartContext.Provider>
  );
}

export const useLoggedInCart = () => {
  const context = useContext(LoggedInCartContext);
  if (context === undefined) {
    throw new Error(
      "useLoggedInCart must be used within a LoggedInCartProvider"
    );
  }
  return context;
};