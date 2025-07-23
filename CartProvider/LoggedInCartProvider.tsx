// src/CartProvider/LoggedInCartProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks/hooks";
import { selectToken, logout } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";
import toast from "react-hot-toast";

// Import all necessary types from your types file
import {
  CartItem,
  CartItemFromAPI,
  CartApiResponse,
  CartItemInput,
  LoggedInCartContextType,
  Product,
  ProductVariant,
} from "@/types/cart"; // Assuming types/cart.ts is the source for these

// Helper to transform API cart items to frontend CartItem format (no changes here)
const parseCartResponse = (response: CartApiResponse): CartItem[] => {
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
    } else if (
      response &&
      typeof response === "object" &&
      "cart" in response &&
      response.cart &&
      Array.isArray(response.cart.items)
    ) {
      rawCartItems = response.cart.items;
    } else if (
      response &&
      typeof response === "object" &&
      Array.isArray(response.items)
    ) {
      rawCartItems = response.items;
    } else {
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
          throw new Error(
            "Backend response missing cartItemId or productId, or productId not a number for a cart item after filtering."
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

        const stock =
          item.variant?.stock !== undefined && item.variant.stock !== null
            ? item.variant.stock
            : item.product?.stock !== undefined && item.product.stock !== null
            ? item.product.stock
            : 0;

        return {
          cartItemId: cartItemId,
          id: productId,
          productId: productId,
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
                    : 0,
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
                    : 0,
              }
            : undefined,
          stock: stock,
        };
      }
    );
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
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [abandonedDiscount, setAbandonedDiscount] = useState<number>(0);

  /**
   * Helper function to handle 401 errors consistently.
   * This dispatches logout with a message.
   */
  // MODIFIED: handleAuthError now takes an optional message string
  const handleAuthError = useCallback(
    (message: string = "Session Expired. Please log in again.") => {
      dispatch(logout({ message })); // Pass the message to the logout action
    },
    [dispatch]
  );

  /**
   * Fetches the current cart items from the API.
   */
  const fetchCartItems = useCallback(async () => {
    if (!token) {
      setItems([]);
      setCartId(null);
      setLoading(false);
      setAbandonedDiscount(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response: CartApiResponse = await apiCore(
        "/cart",
        "GET",
        undefined,
        token
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
    } catch (err: any) {
      console.error("Failed to fetch cart items:", err);
      // Check for the 'status' property attached by apiCore for 401 errors
      if (err.status === 401) {
        handleAuthError("Session Expired. Please log in again."); // Pass message
      } else {
        setError(err.message || "Failed to fetch cart items");
      }
      setItems([]);
      setCartId(null);
      setAbandonedDiscount(0);
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  // Effect to fetch cart items on component mount or token change
  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setItems([]);
      setCartId(null);
      setAbandonedDiscount(0);
      setLoading(false);
    }
  }, [token, fetchCartItems]);

  /**
   * Adds an item to the cart.
   */
  const addCartItem = useCallback(
    async (itemToAdd: CartItemInput) => {
      if (!token) {
        setError("You need to be logged in to add items to your cart.");
        toast.error("Please log in to add items to your cart.");
        return;
      }

      setError(null);
      const prevItems = [...items];

      const existingItemInCart = items.find((item) => {
        const isSameProduct = item.productId === itemToAdd.id;
        const hasVariants =
          itemToAdd.variantId !== undefined && itemToAdd.variantId !== null;
        const isSameVariant = hasVariants
          ? item.variantId === itemToAdd.variantId
          : item.variantId === null;
        return isSameProduct && isSameVariant;
      });

      const currentQuantityInCart = existingItemInCart
        ? existingItemInCart.quantity
        : 0;
      const totalQuantityAfterAdd = currentQuantityInCart + itemToAdd.quantity;

      const availableStock = itemToAdd.stock;

      if (availableStock === 0) {
        toast.error(`${itemToAdd.name} is currently out of stock.`);
        return;
      }

      if (totalQuantityAfterAdd > availableStock) {
        toast.error(
          `Cannot add ${itemToAdd.quantity} more of ${itemToAdd.name}. ` +
            `You have ${currentQuantityInCart} in cart and only ${availableStock} in stock.`
        );
        return;
      }

      setItems((currentItems) => {
        if (existingItemInCart) {
          return currentItems.map((item) =>
            item.cartItemId === existingItemInCart.cartItemId
              ? { ...item, quantity: totalQuantityAfterAdd }
              : item
          );
        } else {
          const tempCartItemId = Date.now() * -1 - Math.random();
          let newItemName = itemToAdd.name;
          if (itemToAdd.variant?.product?.name) {
            newItemName = itemToAdd.variant.product.name;
            if (itemToAdd.variant.name) {
              newItemName += ` - ${itemToAdd.variant.name}`;
            }
          }

          const newCartItem: CartItem = {
            cartItemId: tempCartItemId,
            id: itemToAdd.id,
            productId: itemToAdd.id,
            name: newItemName,
            quantity: itemToAdd.quantity,
            sellingPrice: itemToAdd.sellingPrice,
            basePrice: itemToAdd.basePrice,
            image: itemToAdd.image,
            variantId: itemToAdd.variantId || null,
            variant: itemToAdd.variant,
            product: itemToAdd.product,
            stock: itemToAdd.stock,
            slug: itemToAdd.slug,
          };

          return [...currentItems, newCartItem];
        }
      });
      toast.success(`${itemToAdd.quantity} added to cart!`); // Use newItemName

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

        await apiCore("/cart/add", "POST", payload, token);
        await fetchCartItems();
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to add cart item:", err);
        if (err.status === 401) {
          handleAuthError("Session Expired. Please log in again.");
        } else {
          setError(err.message || "Failed to add item to cart.");
          toast.error(err.message || "Failed to add item to cart.");
        }
        setItems(prevItems);
      } finally {
        setLoading(false);
      }
    },
    [token, items, fetchCartItems, handleAuthError]
  );

  /**
   * Removes an item from the cart.
   */
  const removeCartItem = useCallback(
    async (cartItemId: number) => {
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
      toast.error(`Item removed from cart.`);

      try {
        await apiCore(
          `/cart/remove/${String(cartItemId)}`,
          "DELETE",
          undefined,
          token
        );
        await fetchCartItems();
      } catch (err: any) {
        console.error("LoggedInCartProvider: Failed to remove cart item:", err);
        if (err.status === 401) {
          handleAuthError("Session Expired. Please log in again.");
        } else {
          setError(err.message || "Failed to remove item from cart.");
          toast.error(err.message || "Failed to remove item from cart.");
        }
        setItems(prevItems);
      } finally {
        setLoading(false);
      }
    },
    [token, items, fetchCartItems, handleAuthError]
  );

  /**
   * Increments the quantity of a cart item.
   */
  const incrementItemQuantity = useCallback(
    async (cartItemId: number) => {
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

      if (newQuantity > currentItem.stock) {
        toast.error(
          `You've reached the maximum quantity for ${currentItem.name} (stock limit: ${currentItem.stock}).`
        );
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.cartItemId === currentItem.cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      try {
        await apiCore(
          `/cart/update/${String(currentItem.cartItemId)}`,
          "PUT",
          { quantity: newQuantity },
          token
        );
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to increment quantity:",
          err
        );
        if (err.status === 401) {
          handleAuthError("Session Expired. Please log in again.");
        } else {
          setError(err.message || "Failed to increment item quantity.");
          toast.error(err.message || "Failed to increment item quantity.");
        }
        setItems(prevItems);
      } finally {
        setLoading(false);
      }
    },
    [token, items, handleAuthError]
  );

  /**
   * Decrements the quantity of a cart item.
   */
  const decrementItemQuantity = useCallback(
    async (cartItemId: number) => {
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
          await apiCore(
            `/cart/remove/${String(currentItem.cartItemId)}`,
            "DELETE",
            undefined,
            token
          );
          toast.error(`${currentItem.name} removed from cart.`);
        } else {
          await apiCore(
            `/cart/update/${String(currentItem.cartItemId)}`,
            "PUT",
            { quantity: newQuantity },
            token
          );
        }
      } catch (err: any) {
        console.error(
          "LoggedInCartProvider: Failed to decrement quantity:",
          err
        );
        if (err.status === 401) {
          handleAuthError("Session Expired. Please log in again.");
        } else {
          setError(err.message || "Failed to decrement item quantity.");
          toast.error(err.message || "Failed to decrement item quantity.");
        }
        setItems(prevItems);
      } finally {
        setLoading(false);
      }
    },
    [token, items, handleAuthError]
  );

  /**
   * Clears all items from the cart.
   */
  const clearCart = useCallback(async () => {
    if (!token) {
      setError("You need to be logged in to clear your cart.");
      toast.error("Please log in to clear your cart.");
      return;
    }
    setError(null);
    const prevItems = [...items];

    setItems([]);
    setCartId(null);
    setAbandonedDiscount(0);

    try {
      await apiCore("/cart/clear", "DELETE", undefined, token);
      await fetchCartItems();
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to clear cart:", err);
      if (err.status === 401) {
        handleAuthError("Session Expired. Please log in again.");
      } else {
        setError(err.message || "Failed to clear cart.");
        toast.error(err.message || "Failed to clear cart.");
      }
      setItems(prevItems);
    } finally {
      setLoading(false);
    }
  }, [token, items, fetchCartItems, handleAuthError]);

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
    abandonedDiscount,
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

interface AbandonedDiscountResponse {
  success: boolean;
  message?: string;
  subtotal?: number;
  totalDiscount?: number;
  finalTotal?: number;
  discountedItems?: any[];
  unmatchedItems?: any[];
}
