import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // LocalStorage থেকে প্রাথমিক ডেটা নেওয়া (যাতে রিলোডে ডেটা না হারায়)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // যখনই cart বা wishlist পরিবর্তন হবে, LocalStorage আপডেট হবে
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // --- Cart Functions ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(item => item._id === product._id && item.size === product.size && item.color === product.color);
      if (existing) {
        toast.error("Item already in cart!");
        return prev;
      }
      toast.success("Added to Cart 🛒");
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
  };

  // --- Wishlist Functions ---
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const isExisting = prev.find(item => item._id === product._id);
      if (isExisting) {
        toast.success("Removed from Wishlist");
        return prev.filter(item => item._id !== product._id);
      } else {
        toast.success("Added to Wishlist ❤️");
        return [...prev, product];
      }
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, wishlist, toggleWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);