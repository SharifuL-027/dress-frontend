import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext"; 
import { useCart } from "../context/CartContext"; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, wishlist, openCart } = useCart(); // <-- openCart function ekhane niye asha holo
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Backend theke Category fetch korar logic
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        
        // ১. মেইন ক্যাটাগরিগুলো আলাদা করা
        const formattedCategories = data.reduce((acc, current) => {
          if (!current.parent) {
            acc.push({ ...current, subCategories: [] });
          }
          return acc;
        }, []);

        // ২. সাব-ক্যাটাগরিগুলো মেইন ক্যাটাগরির ভেতরে যুক্ত করা
        data.forEach((item) => {
          if (item.parent) {
            const parentId = typeof item.parent === 'object' ? item.parent._id : item.parent;
            
            const parentIndex = formattedCategories.findIndex(
              (cat) => cat._id.toString() === parentId.toString()
            );
            
            if (parentIndex > -1) {
              formattedCategories[parentIndex].subCategories.push(item);
            }
          }
        });

        setCategories(formattedCategories);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-colors duration-500 ease-in-out ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-24">
          
          {/* Left - Logo Area */}
          <div className="shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
                alt="DressTown Logo" 
                className="h-25 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Center - Navigation Links (Dynamic) */}
          <div className="hidden lg:flex flex-1 mx-8 items-center space-x-8">
            
            <Link to="/" className="shrink-0 flex items-center text-[13px] font-bold text-gray-800 uppercase tracking-wide hover:text-red-500 transition">
              Home
            </Link>
            
            <Link to="/new-arrivals" className="shrink-0 flex items-center text-[13px] font-bold text-gray-800 uppercase tracking-wide hover:text-red-500 transition">
              New Arrivals
            </Link>

            {loading ? (
              <span className="text-[13px] font-bold text-gray-400">LOADING...</span>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="group relative flex items-center h-24 shrink-0"> 
                  
                  <Link 
                    to={`/category/${category.slug}`} 
                    className="text-[13px] font-bold text-gray-800 uppercase tracking-wide group-hover:text-red-500 transition"
                  >
                    {category.name}
                  </Link>

                  {/* Dropdown Menu - Subcategories */}
                  {category.subCategories.length > 0 && (
                    <div className="absolute top-[90px] left-0 w-56 bg-white border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-md z-50 overflow-hidden">
                      <ul className="py-2">
                        {category.subCategories.map((sub) => (
                          <li key={sub._id}>
                            <Link 
                              to={`/category/${sub.slug}`}
                              className="block px-6 py-3 text-[12px] font-bold text-gray-700 hover:bg-gray-100 hover:text-red-600 uppercase transition"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right - Search Box & Action Icons */}
          <div className="flex items-center space-x-8 text-gray-800 shrink-0">
            
            <div className="relative hidden xl:block mr-2">
              <input 
                type="text" 
                placeholder="Search..." 
                className={`w-64 border rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pl-4 pr-10 py-2 text-base transition-all duration-300 ${
                  isScrolled ? "bg-gray-50 border-gray-300 focus:bg-white" : "bg-white/70 border-gray-400 focus:bg-white backdrop-blur-sm"
                }`}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {/* Profile Icon with Dynamic Dropdown */}
            <div className="relative group flex flex-col items-center cursor-pointer mt-1 h-24 justify-center">
              <div className="flex flex-col items-center text-gray-800 group-hover:text-red-500 transition">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-semibold">Profile</span>
              </div>

              {/* Dynamic Profile Dropdown Menu */}
              <div className="absolute top-[80px] right-0 w-48 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-md z-50">
                <ul className="py-2">
                  
                  {!user ? (
                    <>
                      <li>
                        <Link to="/login" className="block px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase transition">
                          Sign In
                        </Link>
                      </li>
                      <li>
                        <Link to="/register" className="block px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase transition">
                          Sign Up
                        </Link>
                      </li>
                      <div className="border-t border-gray-100 my-1"></div>
                      <li>
                        <Link to="/track-order" className="block px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase transition">
                          Track Order
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="px-4 py-2 border-b border-gray-100 mb-1">
                        <span className="block text-[11px] text-gray-400 font-semibold uppercase">Welcome back,</span>
                        <span className="block text-[13px] font-bold text-gray-800 truncate">{user.name}</span>
                      </li>
                      
                      {user.role === 'admin' && (
                        <li>
                          <Link to="/admin/dashboard" className="block px-4 py-2 text-[13px] font-bold text-red-600 hover:bg-red-50 uppercase transition">
                            Admin Panel
                          </Link>
                        </li>
                      )}

                      <li>
                        <Link to="/profile" className="block px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase transition">
                          My Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-orders" className="block px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase transition">
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <button 
                          onClick={logout}
                          className="w-full text-left block px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase transition"
                        >
                          Logout
                        </button>
                      </li>
                    </>
                  )}

                </ul>
              </div>
            </div>

            {/* DYNAMIC WISHLIST ICON */}
            <Link to="/wishlist" className="relative flex flex-col items-center hover:text-red-500 transition group mt-1">
              <div className="relative">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {/* উইশলিস্টে আইটেম থাকলেই ব্যাজ দেখাবে */}
                {wishlist?.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-gray-800 group-hover:text-red-500">Wishlist</span>
            </Link>

            {/* DYNAMIC CART ICON (Link er bodole button ebong openCart use kora holo) */}
            <button 
              onClick={openCart} 
              className="relative flex flex-col items-center hover:text-red-500 transition group mt-1 cursor-pointer bg-transparent border-none"
            >
              <div className="relative">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {/* কার্টের মোট পরিমাণ (Quantity) ব্যাজে শো করবে */}
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cart?.reduce((acc, item) => acc + item.qty, 0) || 0}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-800 group-hover:text-red-500">Cart</span>
            </button>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;