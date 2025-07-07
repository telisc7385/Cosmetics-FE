// CartProvider/LoggedInCartContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore"; // Ensure this path is correct
import toast from "react-hot-toast"; // Import toast

// Import all necessary types from your types file
import {
  CartItem,
  CartItemFromAPI,
  CartApiResponse,
  CartItemInput, // Import CartItemInput
  LoggedInCartContextType, // Import LoggedInCartContextType
} from "@/types/cart"; // Assuming types/cart.ts is the source for these

// Helper to transform API cart items to frontend CartItem format
const parseCartResponse = (response: CartApiResponse): CartItem[] => {
  console.log(
    "LoggedInCartProvider: Raw response to parse (GET /cart):",
    response
  );
  let rawCartItems: any[] = [];

  try {
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

    const items: CartItem[] = filteredRawCartItems.map(
      (item: CartItemFromAPI) => {
        console.log(
          "LoggedInCartProvider: Processing valid raw cart item:",
          item
        );

        const cartItemId =
          item.id !== undefined && item.id !== null ? Number(item.id) : 0;
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
            : 0;

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

        const variantId =
          item.variant?.id !== undefined && item.variant?.id !== null
            ? Number(item.variant.id)
            : item.variantId !== undefined && item.variantId !== null
            ? Number(item.variantId)
            : null;

        const finalVariantId =
          variantId !== null && isNaN(variantId) ? null : variantId;

        // --- NEW: Determine Stock ---
        const stock =
          item.variant?.stock !== undefined && item.variant.stock !== null
            ? item.variant.stock
            : item.product?.stock !== undefined && item.product.stock !== null
            ? item.product.stock
            : 0; // Default to 0 if stock is missing
        // --- END NEW ---

        console.log("LoggedInCartProvider: Mapped cart item (after parsing):", {
          cartItemId,
          id: productId,
          name: displayName,
          quantity,
          sellingPrice,
          basePrice,
          image,
          variantId: finalVariantId,
          variant: item.variant,
          product: item.product,
          stock: stock, // NEW: Include stock
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
          variantId: finalVariantId,
          variant: item.variant
            ? {
                ...item.variant,
                id:
                  item.variant.id !== undefined && item.variant.id !== null
                    ? Number(item.variant.id)
                    : 0,
                stock:
                  item.variant.stock !== undefined &&
                  item.variant.stock !== null
                    ? item.variant.stock
                    : 0, // Ensure variant stock is included
                product: item.variant.product,
              }
            : undefined,
          product: item.product
            ? {
                ...item.product,
                id:
                  item.product.id !== undefined && item.product.id !== null
                    ? Number(item.product.id)
                    : 0,
                stock:
                  item.product.stock !== undefined &&
                  item.product.stock !== null
                    ? item.product.stock
                    : 0, // Ensure product stock is included
              }
            : undefined,
          stock: stock, // Consolidated stock
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
    return [];
  }
};

const LoggedInCartContext = createContext<LoggedInCartContextType | undefined>(
  undefined
);

export function LoggedInCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector(selectToken);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);

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
        fetchedCartId = response.id;
      }
      setCartId(fetchedCartId !== undefined ? Number(fetchedCartId) : null);

      const fetchedItems = parseCartResponse(response);
      setItems(fetchedItems);
      console.log(
        "LoggedInCartProvider: Items set successfully after GET /cart."
      );
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to fetch cart items:", err);
      if (err.message && err.message.includes("401")) {
        setError(
          "Error loading cart: Authorization failed. Please log in again."
        );
      } else {
        setError(err.message || "Failed to fetch cart items.");
      }
      setItems([]);
      setCartId(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setItems([]);
      setCartId(null);
      setLoading(false);
    }
  }, [token, fetchCartItems]);

  const addCartItem = useCallback(
    async (itemToAdd: CartItemInput) => {
      console.log(
        "LoggedInCartProvider: addCartItem called. Payload:",
        itemToAdd
      );
      if (!token) {
        console.warn(
          "LoggedInCartProvider: Attempted to add cart item without token (logged out or token not ready)."
        );
        setError("You need to be logged in to add items to your cart.");
        toast.error("Please log in to add items to your cart.");
        return;
      }

      setError(null);
      const prevItems = [...items]; // Capture current items for rollback

      // --- NEW: Client-side stock check before optimistic update and API call ---
      const existingItemInCart = items.find((item) => {
        const isSameProduct = item.id === itemToAdd.id;
        const hasVariants =
          itemToAdd.variantId !== undefined && itemToAdd.variantId !== null;
        const isSameVariant = hasVariants
          ? item.variantId === itemToAdd.variantId
          : item.variantId === undefined || item.variantId === null;
        return isSameProduct && isSameVariant;
      });

      const currentQuantityInCart = existingItemInCart
        ? existingItemInCart.quantity
        : 0;
      const totalQuantityAfterAdd = currentQuantityInCart + itemToAdd.quantity;

      // Use the stock from itemToAdd, which should come from the ProductCard
      const availableStock = itemToAdd.stock;

      if (totalQuantityAfterAdd > availableStock) {
        toast.error(
          `Cannot add ${itemToAdd.quantity} more of ${itemToAdd.name}. ` +
            `You have ${currentQuantityInCart} in cart and only ${availableStock} in stock.`
        );
        return; // Prevent further execution and API call
      }
      // --- END NEW: Client-side stock check ---

      // Optimistic UI update
      setItems((currentItems) => {
        if (existingItemInCart) {
          return currentItems.map((item) =>
            item.cartItemId === existingItemInCart.cartItemId
              ? { ...item, quantity: totalQuantityAfterAdd }
              : item
          );
        } else {
          const tempCartItemId = Date.now() * -1 - Math.random(); // Generate a unique temporary negative ID
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

        if (itemToAdd.variantId !== null && itemToAdd.variantId !== undefined) {
          payload = {
            variantId: itemToAdd.variantId,
            quantity: itemToAdd.quantity,
          };
        } else {
          payload = {
            productId: itemToAdd.id,
            quantity: itemToAdd.quantity,
          };
        }

        console.log(
          "LoggedInCartProvider: Preparing to call API for /cart/add with payload:",
          payload
        );
        await apiCore("/cart/add", "POST", payload, token);
        console.log("LoggedInCartProvider: /cart/add successful.");

        await fetchCartItems(); // Re-fetch to get official IDs and state
        // toast.success(`${itemToAdd.name} added to cart!`); // Success toast after API confirms
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to add cart item:", err);
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
          toast.error("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to add item to cart.");
          toast.error(err.message || "Failed to add item to cart.");
        }
        setItems(prevItems); // Rollback optimistic update if API call fails
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    },
    [token, items, fetchCartItems]
  );

  const removeCartItem = useCallback(
    async (cartItemId: number) => {
      console.log("LoggedInCartProvider: removeCartItem called.");
      if (!token) {
        setError("You need to be logged in to remove items from your cart.");
        toast.error("Please log in to remove items from your cart.");
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
        await apiCore(
          `/cart/remove/${String(cartItemId)}`,
          "DELETE",
          undefined,
          token
        );
        console.log("LoggedInCartProvider: /cart/remove successful.");
        toast.error(`Item removed from cart.`); // Generic remove toast
        await fetchCartItems();
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to remove cart item:", err);
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
          toast.error("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to remove item from cart.");
          toast.error(err.message || "Failed to remove item from cart.");
        }
        setItems(prevItems); // Rollback on error
      } finally {
        setLoading(false);
      }
    },
    [token, items, fetchCartItems]
  );

  const incrementItemQuantity = useCallback(
    async (cartItemId: number) => {
      console.log("LoggedInCartProvider: incrementItemQuantity called.");
      if (!token) {
        setError("You need to be logged in to update your cart.");
        toast.error("Please log in to update your cart.");
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

      // --- NEW STOCK CHECK (Client-side pre-check) ---
      if (newQuantity > currentItem.stock) {
        toast.error(
          `You've reached the maxim m quantity for ${currentItem.name} (stock limit: ${currentItem.stock}).`
        );
        return; // Prevent API call if stock limit is exceeded
      }
      // --- END NEW STOCK CHECK ---

      // Optimistic UI update
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
          `/cart/update/${String(currentItem.cartItemId)}`,
          "PUT",
          { quantity: newQuantity },
          token
        );
        console.log("LoggedInCartProvider: Increment successful.");
        await fetchCartItems();
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to increment quantity:",
          err
        );
        if (err.message && err.message.includes("401")) {
          setError("Authorization failed. Please log in again.");
          toast.error("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to increment item quantity.");
          toast.error(err.message || "Failed to increment item quantity.");
        }
        setItems(prevItems); // Rollback on error
      } finally {
        setLoading(false);
      }
    },
    [token, items, fetchCartItems]
  );

  const decrementItemQuantity = useCallback(
    async (cartItemId: number) => {
      console.log("LoggedInCartProvider: decrementItemQuantity called.");
      if (!token) {
        setError("You need to be logged in to update your cart.");
        toast.error("Please log in to update your cart.");
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
          await apiCore(
            `/cart/remove/${String(currentItem.cartItemId)}`,
            "DELETE",
            undefined,
            token
          );
          toast.error(`${currentItem.name} removed from cart.`); // Toast for removal on decrement to zero
        } else {
          console.log(
            "LoggedInCartProvider: Calling API for /cart/update (decrement) with payload:",
            { cartItemId: currentItem.cartItemId, quantity: newQuantity }
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
          toast.error("Authorization failed. Please log in again.");
        } else {
          setError(err.message || "Failed to decrement item quantity.");
          toast.error(err.message || "Failed to decrement item quantity.");
        }
        setItems(prevItems);
      } finally {
        setLoading(false);
      }
    },
    [token, items, fetchCartItems]
  );

  const clearCart = useCallback(async () => {
    console.log("LoggedInCartProvider: clearCart called.");
    if (!token) {
      setError("You need to be logged in to clear your cart.");
      toast.error("Please log in to clear your cart.");
      return;
    }
    setError(null);
    const prevItems = [...items];

    setItems([]); // Optimistic update
    setCartId(null);

    try {
      console.log("LoggedInCartProvider: Calling API for /cart/clear.");
      await apiCore("/cart/clear", "DELETE", undefined, token);
      console.log("LoggedInCartProvider: /cart/clear successful.");
      //

      await fetchCartItems(); // Re-fetch to ensure sync (should be empty)
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to clear cart:", err);
      if (err.message && err.message.includes("401")) {
        setError("Authorization failed. Please log in again.");
        toast.error("Authorization failed. Please log in again.");
      } else {
        setError(err.message || "Failed to clear cart.");
        toast.error(err.message || "Failed to clear cart.");
      }
      setItems(prevItems); // Re-fetch to restore state if clear failed
    } finally {
      setLoading(false);
    }
  }, [token, items, fetchCartItems]);

  const contextValue: LoggedInCartContextType = {
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
