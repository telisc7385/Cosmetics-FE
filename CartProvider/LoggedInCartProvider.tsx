// src/CartProvider/LoggedInCartProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAppSelector } from "@/store/hooks/hooks";
import { selectToken } from "@/store/slices/authSlice";
import { apiCore } from "@/api/ApiCore";
import toast from "react-hot-toast";

// Import all necessary types from your types file
import {
  CartItem,
  CartItemFromAPI,
  CartApiResponse,
  CartItemInput,
  LoggedInCartContextType,
  Product, // Ensure Product type is imported if used in CartItem (for product?.id)
  ProductVariant, // Ensure ProductVariant type is imported
} from "@/types/cart"; // Assuming types/cart.ts is the source for these

// Helper to transform API cart items to frontend CartItem format
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
      // If the structure is not recognized, return an empty array
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
        // Log to console if an item is malformed (for debugging, but not a critical error for the user)
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
            : 0; // Default to 0 if no valid product ID is found

        if (!cartItemId || isNaN(productId)) {
          // This indicates a severe issue with backend data if it passes the filter but fails here.
          // Throwing an error might be appropriate to halt processing of bad data.
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

        // Determine Stock
        const stock =
          item.variant?.stock !== undefined && item.variant.stock !== null
            ? item.variant.stock
            : item.product?.stock !== undefined && item.product.stock !== null
            ? item.product.stock
            : 0; // Default to 0 if stock is missing

        return {
          cartItemId: cartItemId,
          id: productId, // The product ID
          productId: productId, // Explicitly set productId here
          name: displayName,
          quantity: quantity,
          sellingPrice: sellingPrice,
          basePrice: basePrice,
          image: image,
          variantId: finalVariantId, // The variant ID, can be null
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
    return items;
  } catch (parseError) {
    console.error(
      "LoggedInCartProvider: Error mapping cart items during parseCartResponse:",
      parseError
    );
    // Return empty array on critical parsing error to prevent crashing
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
  const [abandonedDiscount, setAbandonedDiscount] = useState<number>(0);

  // const autoApplyAbandonedDiscount = useCallback(
  //   async () => {
  //     if (!cartId || !token) {
  //       setAbandonedDiscount(0); // Ensure discount is 0 if no cartId or token
  //       return;
  //     }

  //     try {
  //       const discountResponse = await apiCore<AbandonedDiscountResponse>(
  //         "/abandoned/apply-discount",
  //         "POST",
  //         { cartId },
  //         token
  //       );

  //       // Check if the response indicates success and contains totalDiscount
  //       if (discountResponse?.success && typeof discountResponse.totalDiscount === 'number') {
  //         console.log("✅ Discount applied:", discountResponse);
  //         // Use totalDiscount from the backend response
  //         setAbandonedDiscount(discountResponse.totalDiscount);
  //       } else {
  //         console.log("ℹ️ No discount or discount not applicable:", discountResponse?.message || 'Unknown reason');
  //         setAbandonedDiscount(0); // Reset if no discount is provided or applicable
  //       }
  //     } catch (err) {
  //       console.error("❌ Error applying discount:", err);
  //       setAbandonedDiscount(0); // Fallback to 0 on any error
  //     }
  //   },
  //   [cartId, token]
  // );

  /**
   * Fetches the current cart items from the API.
   * This should be called on initial load and when the cart state needs to be fully re-synced.
   */
  const fetchCartItems = useCallback(async () => {
    if (!token) {
      setItems([]);
      setCartId(null);
      setLoading(false);
      setAbandonedDiscount(0); // Also reset discount if no token
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
      setAbandonedDiscount(0); // Reset discount on fetch error
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Effect to fetch cart items on component mount or token change
  useEffect(() => {
    if (token) {
      fetchCartItems().then(() => {
        // Call autoApplyAbandonedDiscount after cart items are fetched and cartId is set
        // autoApplyAbandonedDiscount();
      });
    } else {
      setItems([]);
      setCartId(null);
      setAbandonedDiscount(0); // Ensure discount is reset if logged out
      setLoading(false);
    }
  }, [token, fetchCartItems]);

  /**
   * Adds an item to the cart.
   * Uses optimistic UI update and then calls fetchCartItems to get the actual cart state and IDs.
   */
  const addCartItem = useCallback(
    async (itemToAdd: CartItemInput) => {
      if (!token) {
        setError("You need to be logged in to add items to your cart.");
        toast.error("Please log in to add items to your cart.");
        return;
      }

      setError(null);
      const prevItems = [...items]; // Capture current items for rollback

      // Client-side stock check before optimistic update and API call
      const existingItemInCart = items.find((item) => {
        const isSameProduct = item.productId === itemToAdd.id; // Use item.productId
        const hasVariants =
          itemToAdd.variantId !== undefined && itemToAdd.variantId !== null;
        const isSameVariant = hasVariants
          ? item.variantId === itemToAdd.variantId
          : item.variantId === null; // Check for null explicitly for no variant
        return isSameProduct && isSameVariant;
      });

      const currentQuantityInCart = existingItemInCart
        ? existingItemInCart.quantity
        : 0;
      const totalQuantityAfterAdd = currentQuantityInCart + itemToAdd.quantity;

      // Use the stock from itemToAdd, which should come from the ProductCard
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
        return; // Prevent further execution and API call
      }

      // Optimistic UI update
      setItems((currentItems) => {
        if (existingItemInCart) {
          return currentItems.map((item) =>
            item.cartItemId === existingItemInCart.cartItemId
              ? { ...item, quantity: totalQuantityAfterAdd }
              : item
          );
        } else {
          // Generate a unique temporary negative ID for new items
          const tempCartItemId = Date.now() * -1 - Math.random();
          let newItemName = itemToAdd.name;
          if (itemToAdd.variant?.product?.name) {
            newItemName = itemToAdd.variant.product.name;
            if (itemToAdd.variant.name) {
              newItemName += ` - ${itemToAdd.variant.name}`;
            }
          }

          // Construct the new CartItem ensuring all required properties are present
          const newCartItem: CartItem = {
            cartItemId: tempCartItemId,
            id: itemToAdd.id, // This should be the product ID
            productId: itemToAdd.id, // Explicitly set productId
            name: newItemName,
            quantity: itemToAdd.quantity,
            sellingPrice: itemToAdd.sellingPrice,
            basePrice: itemToAdd.basePrice,
            image: itemToAdd.image,
            variantId: itemToAdd.variantId || null, // Ensure variantId is number or null
            variant: itemToAdd.variant, // Pass the full variant object
            product: itemToAdd.product, // Pass the full product object
            stock: itemToAdd.stock,
            slug: itemToAdd.slug, // Include slug
          };

          return [...currentItems, newCartItem];
        }
      });
      toast.success(`${itemToAdd.quantity} ${itemToAdd.name} added to cart!`); // Optimistic toast

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
            productId: itemToAdd.id, // itemToAdd.id is the product ID in this case
            quantity: itemToAdd.quantity,
          };
        }

        await apiCore("/cart/add", "POST", payload, token);
        // After successful add, refetch the cart to get the real cartItemId and updated state
        await fetchCartItems();
        // autoApplyAbandonedDiscount();
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
    [token, items, fetchCartItems] // Added autoApplyAbandonedDiscount
  );

  /**
   * Removes an item from the cart.
   * Uses optimistic UI update and re-fetches the cart on success.
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

      // Optimistic UI update: remove the item
      setItems((currentItems) =>
        currentItems.filter((item) => item.cartItemId !== cartItemId)
      );
      toast.error(`Item removed from cart.`); // Generic remove toast

      try {
        await apiCore(
          `/cart/remove/${String(cartItemId)}`,
          "DELETE",
          undefined,
          token
        );
        // After successful removal, refetch the cart to ensure sync
        await fetchCartItems();
        // autoApplyAbandonedDiscount(); // Re-apply discount after cart changes
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
    [token, items, fetchCartItems] // Added autoApplyAbandonedDiscount
  );

  /**
   * Increments the quantity of a cart item.
   * Uses optimistic UI update. No immediate re-fetch unless an error occurs.
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

      // Client-side stock check
      if (newQuantity > currentItem.stock) {
        toast.error(
          `You've reached the maximum quantity for ${currentItem.name} (stock limit: ${currentItem.stock}).`
        );
        return; // Prevent API call if stock limit is exceeded
      }

      // Optimistic UI update
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
        // autoApplyAbandonedDiscount(); // Re-apply discount after cart changes
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
    [token, items] // Added autoApplyAbandonedDiscount
  );

  /**
   * Decrements the quantity of a cart item.
   * If quantity becomes 0 or less, removes the item.
   * Uses optimistic UI update. No immediate re-fetch unless an error occurs.
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

      // Optimistic UI update
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
          toast.error(`${currentItem.name} removed from cart.`); // Toast for removal on decrement to zero
        } else {
          await apiCore(
            `/cart/update/${String(currentItem.cartItemId)}`,
            "PUT",
            { quantity: newQuantity },
            token
          );
        }
        // autoApplyAbandonedDiscount(); // Re-apply discount after cart changes
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
        setItems(prevItems); // Rollback
      } finally {
        setLoading(false);
      }
    },
    [token, items] // Added autoApplyAbandonedDiscount
  );

  /**
   * Clears all items from the cart.
   * Uses optimistic UI update and re-fetches the cart on success.
   */
  const clearCart = useCallback(async () => {
    if (!token) {
      setError("You need to be logged in to clear your cart.");
      toast.error("Please log in to clear your cart.");
      return;
    }
    setError(null);
    const prevItems = [...items];

    setItems([]); // Optimistic update
    setCartId(null);
    setAbandonedDiscount(0); // Also reset discount when cart is cleared
    toast.success("Cart cleared successfully!"); // Optimistic toast

    try {
      await apiCore("/cart/clear", "DELETE", undefined, token);
      // After successful clear, refetch to ensure it's truly empty and synchronized
      await fetchCartItems();
    } catch (err: any) {
      console.error("LoggedInCartProvider: Failed to clear cart:", err);
      if (err.message && err.message.includes("401")) {
        setError("Authorization failed. Please log in again.");
        toast.error("Authorization failed. Please log in again.");
      } else {
        setError(err.message || "Failed to clear cart.");
        toast.error(err.message || "Failed to clear cart.");
      }
      setItems(prevItems); // Rollback to previous items if clear failed
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
    refetchCart: fetchCartItems, // Expose fetchCartItems for manual re-fetching if needed
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

// Updated interface to match your backend's response for /abandoned/apply-discount
interface AbandonedDiscountResponse {
  success: boolean;
  message?: string;
  subtotal?: number; // Backend sends this
  totalDiscount?: number; // Backend sends this, this is what we need for frontend abandonedDiscount
  finalTotal?: number; // Backend sends this
  discountedItems?: any[];
  unmatchedItems?: any[];
}
