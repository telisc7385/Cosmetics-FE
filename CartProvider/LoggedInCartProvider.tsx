"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore"; // Ensure this path is correct

// Import all necessary types from your types file
import {
  CartItem,
  CartItemFromAPI,
  CartApiResponse, // This import will now work
} from "@/types/product";
import LoggedInCartContext, {
  LoggedInCartContextType,
} from "@/CartProvider/LoggedInCartContext"; // Ensure this path is correct

const parseCartResponse = (response: CartApiResponse): CartItem[] => {
  console.log(
    "LoggedInCartProvider: Raw response to parse (GET /cart):",
    response
  );
  let rawCartItems: any[] = [];

  try {
    // Type guards now work more effectively because response is typed
    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
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
      "cart" in response &&
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

      // Check if product or variant ID exists to ensure it's a valid item
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
          "LoggedInCartProvider: Skipping malformed cart item due. to missing critical IDs (id or product/variant productId):",
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
            "LoggedInCartProvider: Parsed cartItemId is NaN, setting to 0. This might indicate a backend issue.",
            { rawItem: item }
          );
        }

        const productId =
          item.productId !== undefined && item.productId !== null
            ? Number(item.productId)
            : item.product?.id !== undefined && item.product?.id !== null
            ? Number(item.product.id)
            : item.variant?.productId !== undefined &&
              item.variant?.productId !== null
            ? Number(item.variant.productId)
            : 0; // Default to 0 if no product ID is found

        console.log(
          `Extracted: cartItemId = ${cartItemId}, productId = ${productId}`
        );

        if (!cartItemId || isNaN(productId)) {
          console.error(
            "LoggedInCartProvider: Critical ID still missing or not a number after initial parsing attempt.",
            {
              rawItem: item,
              extractedCartItemId: cartItemId,
              extractedProductId: productId,
            }
          );
          throw new Error(
            "Backend response missing cartItemId or productId, or productId not a number for a cart item."
          );
        }

        const quantity = item.quantity;

        let displayName = "Unknown Product";

        // Prefer variant name, then product name
        if (item.variant && item.variant.product?.name) {
          displayName = item.variant.product.name;
          if (item.variant.name) {
            displayName += ` - ${item.variant.name}`;
          }
        } else if (item.product?.name) {
          displayName = item.product.name;
        }

        // Image prioritization
        const image =
          item.variant?.images?.[0]?.url ||
          item.product?.images?.[0]?.image ||
          "/placeholder.jpg";

        // Ensure prices are parsed as numbers
        const sellingPrice = parseFloat(
          item.variant?.selling_price?.toString() ||
            item.product?.sellingPrice?.toString() ||
            "0"
        );

        // Ensure basePrice is parsed as a number and defaults to 0 if null/undefined
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
          rawItem: item, // Keep raw item for deeper debugging if needed
        });

        return {
          cartItemId: cartItemId, // Now a number
          id: productId, // Product ID (number)
          name: displayName,
          quantity: quantity,
          sellingPrice: sellingPrice,
          basePrice: basePrice, // Now a number
          image: image,
          variantId: finalVariantId, // Variant ID (number or null)
          variant: item.variant
            ? {
                ...item.variant,
                // FIX: Safely access item.variant.id to prevent 'undefined' error if API sends null/undefined
                id:
                  item.variant.id !== undefined && item.variant.id !== null
                    ? Number(item.variant.id)
                    : 0, // Default to 0 or null if variant.id is missing
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
                    : 0, // Default to 0 or null if product.id is missing
              }
            : undefined,
        };
      }
    );
    console.log("LoggedInCartProvider: Parsed items:", items);
    return items;
  } catch (parseError) {
    console.error(
      "LoggedInCartProvider: Error mapping cart items during parseCartResponse:",
      parseError
    );
    // Important: If parsing fails, return an empty array to prevent rendering errors
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
  const [cartId, setCartId] = useState<number | null>(null); // Changed to number | null

  const fetchCartItems = useCallback(async () => {
    console.log("fetchCartItems called.");
    console.log(
      "fetchCartItems - Current token status:",
      token ? "Token is present" : "Token is MISSING or NULL"
    );

    if (!token) {
      setItems([]);
      setCartId(null);
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
      console.log(
        "LoggedInCartProvider: Token sent to apiCore for GET /cart:",
        token
      );
      // Explicitly type the response from apiCore as CartApiResponse
      const response: CartApiResponse = await apiCore(
        "/cart",
        "GET",
        undefined,
        token
      );
      console.log(
        "LoggedInCartProvider: Raw response from GET /cart API call:",
        response
      );

      // Parse cartId based on the defined CartApiResponse type
      let fetchedCartId: string | number | undefined;
      if (
        response &&
        "data" in response &&
        response.data &&
        response.data.id !== undefined
      ) {
        fetchedCartId = response.data.id;
      } else if (
        response &&
        "cart" in response &&
        response.cart &&
        response.cart.id !== undefined
      ) {
        fetchedCartId = response.cart.id;
      } else if (response && response.id !== undefined) {
        // Check for id directly at the root
        fetchedCartId = response.id;
      }
      // Ensure cartId is stored as a number, or null if not found
      setCartId(fetchedCartId !== undefined ? Number(fetchedCartId) : null);

      const fetchedItems = parseCartResponse(response);
      setItems(fetchedItems);
      console.log(
        "LoggedInCartProvider: Items set successfully after GET /cart."
      );
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to fetch cart items:", err);
      // More specific error message based on the problem
      if (err.message && err.message.includes("401")) {
        setError(
          "Error loading cart: Authorization failed. Please log in again."
        );
      } else {
        setError(err.message || "Failed to fetch cart items.");
      }
      setItems([]); // Clear items on error to prevent displaying stale data
      setCartId(null); // Clear cartId on error
    } finally {
      setLoading(false);
      console.log("LoggedInCartProvider: fetchCartItems finished.");
    }
  }, [token]); // Dependency array: re-run if token changes

  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setItems([]); // Ensure cart is cleared when user logs out
      setCartId(null); // Ensure cartId is cleared when user logs out
      setLoading(false);
    }
  }, [token, fetchCartItems]);

  const addCartItem = useCallback(
    async (itemToAdd: Omit<CartItem, "cartItemId">) => {
      // Parameter name aligns with context type
      console.log("LoggedInCartProvider: addCartItem called.");
      console.log(
        "LoggedInCartProvider: Current token status (addCartItem):",
        token ? "Token is present" : "Token is MISSING or NULL"
      );

      if (!token) {
        console.warn(
          "LoggedInCartProvider: Attempted to add cart item without token (logged out or token not ready)."
        );
        setError("You need to be logged in to add items to your cart.");
        return;
      }

      setError(null);
      const prevItems = [...items]; // Capture current items for rollback

      // Optimistic UI update: Add the item immediately to the local state.
      // This provides a snappier user experience.
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => {
          return (
            item.id === itemToAdd.id &&
            (itemToAdd.variantId // If itemToAdd has a variantId, match it
              ? item.variantId === itemToAdd.variantId
              : item.variantId === undefined || item.variantId === null) // If no variantId, ensure current item also has no variantId
          );
        });

        if (existingItem) {
          // If item already exists, update its quantity
          return currentItems.map((item) =>
            item.cartItemId === existingItem.cartItemId
              ? { ...item, quantity: item.quantity + itemToAdd.quantity }
              : item
          );
        } else {
          const tempCartItemId = Date.now() + Math.random(); // Generate a unique temporary number ID

          // Construct display name, prioritizing variant name
          let newItemName = itemToAdd.name;
          if (itemToAdd.variant?.product?.name) {
            newItemName = itemToAdd.variant.product.name;
            if (itemToAdd.variant.name) {
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
        let payload: {
          productId?: number;
          variantId?: number | null;
          quantity: number;
        };

        // Construct payload based on whether a variantId is provided
        if (itemToAdd.variantId !== null && itemToAdd.variantId !== undefined) {
          payload = {
            variantId: itemToAdd.variantId, // Already a number
            quantity: itemToAdd.quantity,
          };
        } else {
          payload = {
            productId: itemToAdd.id, // Already a number (product ID)
            quantity: itemToAdd.quantity,
          };
        }

        console.log(
          "LoggedInCartProvider: Preparing to call API for /cart/add with payload:",
          payload
        );
        // Log the token just before the API call for POST /cart/add
        console.log(
          "LoggedInCartProvider: Token sent to apiCore for /cart/add:",
          token
        );
        // Make the API call to add the item to the backend cart
        await apiCore("/cart/add", "POST", payload, token);
        console.log("LoggedInCartProvider: /cart/add successful.");

        // After successful addition, re-fetch the entire cart from the backend
        // This is crucial to get the official cartItemId and the exact state.
        await fetchCartItems();
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to add cart item:", err);
        // Crucial: check if this specific error is about authorization
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
          // Optionally: dispatch a logout action if it's a permanent 401
          // dispatch(logout()); // If you have a logout action in authSlice
        } else {
          setError(err.message || "Failed to add item to cart.");
        }
        // Rollback optimistic update if API call fails
        setItems(prevItems);
      }
    },
    [token, items, fetchCartItems] // Dependencies: token, items (for optimistic update), fetchCartItems (for re-fetching)
  );

  const removeCartItem = useCallback(
    // Change cartItemId type from string to number
    async (cartItemId: number) => {
      console.log("LoggedInCartProvider: removeCartItem called.");
      console.log(
        "LoggedInCartProvider: Current token status (removeCartItem):",
        token ? "Token is present" : "Token is MISSING or NULL"
      );
      if (!token) {
        setError("You need to be logged in to remove items from your cart.");
        return;
      }
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
        // Log the token just before the API call for DELETE /cart/remove
        console.log(
          "LoggedInCartProvider: Token sent to apiCore for /cart/remove:",
          token
        );
        // Ensure cartItemId is converted to string for the URL path as API might expect string
        await apiCore(
          `/cart/remove/${String(cartItemId)}`,
          "DELETE",
          undefined,
          token
        );
        console.log("LoggedInCartProvider: /cart/remove successful.");
        // Re-fetch after successful removal to ensure state is synchronized
        await fetchCartItems();
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to remove cart item:", err);
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to remove item from cart.");
        }
        setItems(prevItems); // Rollback on error
      }
    },
    [token, items, fetchCartItems] // Added fetchCartItems to dependencies
  );

  const incrementItemQuantity = useCallback(
    // Change cartItemId type from string to number
    async (cartItemId: number) => {
      console.log("LoggedInCartProvider: incrementItemQuantity called.");
      console.log(
        "LoggedInCartProvider: Current token status (incrementItemQuantity):",
        token ? "Token is present" : "Token is MISSING or NULL"
      );
      if (!token) {
        setError("You need to be logged in to update your cart.");
        return;
      }
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
        // Log the token just before the API call for PUT /cart/update
        console.log(
          "LoggedInCartProvider: Token sent to apiCore for /cart/update (increment):",
          token
        );
        // Ensure cartItemId is converted to string for the URL path
        await apiCore(
          `/cart/update/${String(currentItem.cartItemId)}`,
          "PUT",
          { quantity: newQuantity },
          token
        );
        console.log("LoggedInCartProvider: Increment successful.");
        // Re-fetch after successful update
        await fetchCartItems();
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to increment quantity:",
          err
        );
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to increment item quantity.");
        }
        setItems(prevItems); // Rollback on error
      }
    },
    [token, items, fetchCartItems] // Added fetchCartItems to dependencies
  );

  const decrementItemQuantity = useCallback(
    // Change cartItemId type from string to number
    async (cartItemId: number) => {
      console.log("LoggedInCartProvider: decrementItemQuantity called.");
      console.log(
        "LoggedInCartProvider: Current token status (decrementItemQuantity):",
        token ? "Token is present" : "Token is MISSING or NULL"
      );
      if (!token) {
        setError("You need to be logged in to update your cart.");
        return;
      }
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
          // Log the token just before the API call for DELETE /cart/remove
          console.log(
            "LoggedInCartProvider: Token sent to apiCore for /cart/remove (decrement to 0):",
            token
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
          console.log(
            "LoggedInCartProvider: Token sent to apiCore for /cart/update (decrement):",
            token
          );
          await apiCore(
            `/cart/update/${String(currentItem.cartItemId)}`,
            "PUT",
            { quantity: newQuantity },
            token
          );
        }
        console.log("LoggedInCartProvider: Decrement successful.");
        await fetchCartItems();
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to decrement quantity:",
          err
        );
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to decrement item quantity.");
        }
        setItems(prevItems);
      }
    },
    [token, items, fetchCartItems]
  );

  const clearCart = useCallback(async () => {
    console.log("LoggedInCartProvider: clearCart called.");
    console.log(
      "LoggedInCartProvider: Current token status (clearCart):",
      token ? "Token is present" : "Token is MISSING or NULL"
    );
    if (!token) {
      setError("You need to be logged in to clear your cart.");
      return;
    }
    setError(null);
    const prevItems = [...items];

    setItems([]);

    try {
      console.log("LoggedInCartProvider: Calling API for /cart/clear.");
      console.log(
        "LoggedInCartProvider: Token sent to apiCore for /cart/clear:",
        token
      );
      await apiCore("/cart/clear", "DELETE", undefined, token);
      console.log("LoggedInCartProvider: /cart/clear successful.");
      await fetchCartItems();
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to clear cart:", err);
      if (err.message && err.message.includes("401")) {
        setError("Authorization failed. Please log in again.");
      } else {
        setError(err.message || "Failed to clear cart.");
      }
      setItems(prevItems);
    }
  }, [token, items, fetchCartItems]);

  const contextValue: LoggedInCartContextType = {
    // Explicitly type contextValue
    items,
    loading,
    error,
    addCartItem,
    removeCartItem,
    incrementItemQuantity,
    decrementItemQuantity,
    clearCart,
    refetchCart: fetchCartItems,
    cartId,
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
