import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // --- Cart Drawer State ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // --- Cart Functions ---
  const addToCart = (product) => {
    let itemExists = false;

    setCart((prev) => {
      const existing = prev.find(
        item => item._id === product._id && item.size === product.size && item.color === product.color
      );
      if (existing) {
        itemExists = true;
        // যদি আগেই থাকে, তবে পরিমাণ ১ বাড়িয়ে দিতে পারেন অথবা একই রাখতে পারেন
        return prev.map(item => 
          item._id === product._id && item.size === product.size && item.color === product.color
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { ...product, qty: product.qty || 1 }];
    });

    if (itemExists) {
      toast.success("Cart quantity updated!");
    } else {
      toast.success("Added to Cart 🛒");
    }

    // প্রোডাক্ট কার্টে অ্যাড হওয়ার সাথে সাথেই ড্রয়ারটি ডান দিক থেকে বের হয়ে আসবে
    openCart();
  };

  const removeFromCart = (id, size, color) => {
    setCart(prev => prev.filter(item => !(item._id === id && item.size === size && item.color === color)));
    toast.success("Item removed from cart");
  };

  const updateQty = (id, size, color, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => {
      if (item._id === id && item.size === size && item.color === color) {
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  // --- Wishlist Function ---
  const toggleWishlist = (product) => {
    let status = "";
    setWishlist((prev) => {
      const isExisting = prev.find(item => item._id === product._id);
      if (isExisting) {
        status = "removed";
        return prev.filter(item => item._id !== product._id);
      } else {
        status = "added";
        return [...prev, product];
      }
    });

    if (status === "removed") {
      toast.success("Removed from Wishlist");
    } else if (status === "added") {
      toast.success("Added to Wishlist ❤️");
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQty, 
      wishlist, 
      toggleWishlist, 
      isCartOpen, 
      openCart, 
      closeCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);