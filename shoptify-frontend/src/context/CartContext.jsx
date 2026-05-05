import { createContext, useContext, useState, useEffect } from "react";

// Create context
const CartContext = createContext();

// Custom hook
// eslint-disable-next-line react-refresh/only-export-components


// Provider
export const CartProvider = ({ children }) => {
  // ✅ Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add product to cart
 const addToCart = (product) => {
  setCart((prev) => {
    const existing = prev.find(
      (item) =>
        item._id === product._id && item.size === product.size
    );

    if (existing) {
      return prev.map((item) =>
        item._id === product._id && item.size === product.size
          ? { ...item, quantity: item.quantity + product.quantity }
          : item
      );
    }

    return [...prev, product];
  });
};

  // Remove product from cart
  const removeFromCart = (id, size) => {
  setCart((prev) =>
    prev.filter(
      (item) => !(item._id === id && item.size === size)
    )
  );
};

  // Update product quantity
  const updateQty = (id, qty, size) => {
  setCart((prev) =>
    prev.map((item) =>
      item._id === id && item.size === size
        ? { ...item, quantity: qty }
        : item
    )
  );
};

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty,  clearCart, }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};

