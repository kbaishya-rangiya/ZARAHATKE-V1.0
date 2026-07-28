import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // [{product, qty}]
  const [wishlist, setWishlist] = useState([]); // [product]
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        toast(`${product.name} removed from wishlist`);
        return prev.filter((p) => p.id !== product.id);
      }
      toast.success(`${product.name} added to wishlist`);
      return [...prev, product];
    });
  }, []);

  const inWishlist = useCallback(
    (id) => wishlist.some((p) => p.id === id),
    [wishlist]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty * i.product.price, 0),
    [cart]
  );

  const value = {
    cart,
    wishlist,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleWishlist,
    inWishlist,
    cartOpen,
    setCartOpen,
    wishlistOpen,
    setWishlistOpen,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
