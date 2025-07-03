// Providers/LoggedInCartProvider.tsx
"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";
import LoggedInCartContext from "./LoggedInCartContext";

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

        // Ensure cartItemId is parsed as a number
        const cartItemId =
          item.id !== undefined && item.id !== null ? Number(item.id) : 0;

        // Check for NaN for cartItemId as well
        if (isNaN(cartItemId)) {
          console.error(
            "LoggedInCartProvider: Parsed cartItemId is NaN, setting to 0.",
            { rawItem: item }
          );
          // Decide on appropriate error handling: throw, set to 0, or filter out item.
          // For now, continuing with 0, but this might indicate a backend issue.
        }

        const productId =
          item.productId !== undefined && item.productId !== null
            ? Number(item.productId)
            : item.product?.id !== undefined && item.product?.id !== null
            ? Number(item.product.id)
            : item.variant?.productId !== undefined &&
              item.variant?.productId !== null
            ? Number(item.variant.productId)
            : 0;

        console.log(
          `Extracted: cartItemId = ${cartItemId}, productId = ${productId}`
        );

        if (!cartItemId || isNaN(productId)) {
          console.error(
            "LoggedInCartProvider: Critical ID still missing or not a number.",
            {
              rawItem: item,
              extractedCartItemId: cartItemId,
              extractedProductId: productId,
            }
          );
          throw new Error(
            "Backend response missing cartItemId or productId, or productId not a number."
          );
        }

        const quantity = item.quantity;

        let displayName = "Unknown Product";

        if (item.variant && item.variant.product?.name) {
          displayName = item.variant.product.name;
          if (item.variant.name) {
            displayName += ` - ${item.variant.name}`;
          }
        } else if (item.product?.name) {
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

        // Ensure variantId is number or null
        const variantId =
          item.variant?.id !== undefined && item.variant?.id !== null
            ? Number(item.variant.id)
            : item.variantId !== undefined && item.variantId !== null
            ? Number(item.variantId)
            : null;

        // If variantId is not null but becomes NaN, set it to null for robustness
        const finalVariantId =
          variantId !== null && isNaN(variantId) ? null : variantId;

        console.log("LoggedInCartProvider: Mapped cart item (after parsing):", {
          cartItemId,
          id: productId, // This is the product ID, now ensured as number
          name: displayName,
          quantity,
          sellingPrice,
          basePrice,
          image,
          variantId: finalVariantId, // Now ensured as number or null
          variant: item.variant,
          product: item.product,
          rawItem: item,
        });

        return {
          cartItemId: cartItemId, // Now a number
          id: productId, // Product ID (number)
          name: displayName,
          quantity: quantity,
          sellingPrice: sellingPrice,
          basePrice: basePrice,
          image: image,
          variantId: finalVariantId, // Variant ID (number or null)
          variant: item.variant
            ? {
                ...item.variant,
                // FIX: Safely access item.variant.id to prevent 'undefined' error if API sends null/undefined
                id:
                  item.variant.id !== undefined && item.variant.id !== null
                    ? Number(item.variant.id)
                    : 0,
                product: item.variant.product,
              }
            : undefined, // variant itself can be undefined or null in CartItem
          product: item.product
            ? {
                ...item.product,
                // FIX: Safely access item.product.id to prevent 'undefined' error if API sends null/undefined
                id:
                  item.product.id !== undefined && item.product.id !== null
                    ? Number(item.product.id)
                    : 0,
              }
            : undefined,
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
          // tempCartItemId should be a number now
          const tempCartItemId = Date.now(); // Generate a temporary number ID

          let newItemName = itemToAdd.name;
          if (itemToAdd.variant?.product?.name) {
            newItemName = itemToAdd.variant.product.name;
            if (itemToAdd.variant.name) {
              newItemName += ` - ${itemToAdd.variant.name}`;
            }
          }

          // Ensure cartItemId is passed as number for the new item
          return [
            ...currentItems,
            { ...itemToAdd, cartItemId: tempCartItemId, name: newItemName },
          ];
        }
      });

      try {
        let payload: {
          productId?: number;
          variantId?: number | null;
          quantity: number;
        };

        if (itemToAdd.variantId !== null && itemToAdd.variantId !== undefined) {
          payload = {
            variantId: itemToAdd.variantId, // Already a number
            quantity: itemToAdd.quantity,
          };
        } else {
          payload = {
            productId: itemToAdd.id, // Already a number
            quantity: itemToAdd.quantity,
          };
        }

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
    // Change cartItemId type from string to number
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
        // Ensure cartItemId is converted to string for the URL path
        await apiCore(
          `/cart/remove/${String(cartItemId)}`,
          "DELETE",
          undefined,
          token
        );
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
    // Change cartItemId type from string to number
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
        // Ensure cartItemId is converted to string for the URL path
        await apiCore(
          `/cart/update/${String(currentItem.cartItemId)}`,
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
    // Change cartItemId type from string to number
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
          // Ensure cartItemId is converted to string for the URL path
          await apiCore(
            `/cart/remove/${String(currentItem.cartItemId)}`,
            "DELETE",
            undefined,
            token
          );
        } else {
          console.log(
            "LoggedInCartProvider: Calling API for /cart/update (decrement) with payload:",
            { cartItemId: currentItem.cartItemId, quantity: newQuantity }
          );
          // Ensure cartItemId is converted to string for the URL path
          await apiCore(
            `/cart/update/${String(currentItem.cartItemId)}`,
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
