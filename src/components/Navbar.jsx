import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext"; 
import { useCart } from "../context/CartContext"; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, wishlist, openCart } = useCart(); 
  const location = useLocation(); 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${searchTerm.trim()}`); 
    }
  };

  // Backend theke Category fetch korar logic
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        
        const formattedCategories = data.reduce((acc, current) => {
          if (!current.parent) {
            acc.push({ ...current, subCategories: [] });
          }
          return acc;
        }, []);

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

  const getNavStyle = (path) => {
    const isActive = location.pathname === path;
    return `relative text-[12px] md:text-[13px] font-bold uppercase tracking-wide transition-colors duration-300 py-3 ${
      isActive ? "text-red-600" : "text-gray-800 hover:text-red-600"
    } after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-red-600 after:transition-transform after:duration-300 after:origin-left ${
      isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;
  };

  return (
    <nav className={`sticky top-0 left-0 w-full z-[100] bg-white transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
      
      {/* ================= TIER 1: Top Bar ================= */}
      <div className="bg-[#cf141b] text-white text-[11px] uppercase tracking-wider py-1.5 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex justify-between items-center">
          <div>Welcome to DressTown</div>
          <div className="flex space-x-6">
            <Link to={user ? "/my-orders" : "/track-order"} className="hover:text-gray-300 transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link>
            <Link to="/stores" className="hover:text-gray-300 transition-colors">Store Locations</Link>
          </div>
        </div>
      </div>

      {/* ================= TIER 2: Main Middle Bar ================= */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 lg:py-5 flex justify-between items-center">
        
        <div className="shrink-0">
          <Link to="/">
            <img 
              src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
              alt="DressTown Logo" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 max-w-xl mx-10 relative">
          <form onSubmit={handleSearch} className="w-full relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900 px-4 py-2.5 text-sm transition-colors pr-10"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-6 text-gray-800 shrink-0">
          
          {/* Profile Dropdown */}
          <div className="relative group cursor-pointer h-full flex items-center">
            <div className={`flex items-center space-x-1.5 transition-colors py-2 ${location.pathname.includes('/profile') ? "text-red-600" : "hover:text-red-600"}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden md:block text-xs font-bold uppercase">
                {user ? "Profile" : "Login"}
              </span>
            </div>

            <div className="absolute top-[100%] right-0 w-48 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-sm z-50">
              <ul className="py-2">
                {!user ? (
                  <>
                    <li><Link to="/login" className="block px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase">Sign In</Link></li>
                    <li><Link to="/register" className="block px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase">Sign Up</Link></li>
                  </>
                ) : (
                  <>
                    <li className="px-4 py-2 border-b border-gray-100 mb-1">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase">Welcome,</span>
                      <span className="block text-[12px] font-bold text-gray-900 truncate">{user.name}</span>
                    </li>
                    {user.role === 'admin' && (
                      <li><Link to="/admin/dashboard" className="block px-4 py-2 text-[12px] font-bold text-red-600 hover:bg-red-50 uppercase">Admin Panel</Link></li>
                    )}
                    <li><Link to="/profile" className="block px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase">My Dashboard</Link></li>
                    <li>
                      <button onClick={logout} className="w-full text-left block px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase">Logout</button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <Link to="/wishlist" className="group py-2">
            <div className={`flex items-center space-x-1.5 transition-colors ${location.pathname === '/wishlist' ? "text-red-600" : "hover:text-red-600"}`}>
              <div className="relative">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlist?.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="hidden md:block text-xs font-bold uppercase">Wishlist</span>
            </div>
          </Link>

          <button onClick={openCart} className="group flex items-center space-x-1.5 hover:text-red-600 transition-colors cursor-pointer py-2">
            <div className="relative">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center border-2 border-white">
                {cart?.reduce((acc, item) => acc + item.qty, 0) || 0}
              </span>
            </div>
            <span className="hidden md:block text-xs font-bold uppercase">Bag</span>
          </button>
          
        </div>
      </div>

      {/* ================= TIER 3: Bottom Navigation ================= */}
      <div className="border-t border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative">
          
          {/* 
            মূল ফিক্সটি এখানেই! 
            lg:overflow-visible যোগ করা হয়েছে যাতে ডেস্কটপে ড্রপডাউন মেনুটি কেটে না যায়।
          */}
          <div className="flex overflow-x-auto lg:overflow-visible lg:flex-wrap items-center lg:justify-center space-x-6 md:space-x-8 no-scrollbar">
            
            <Link to="/" className="shrink-0 group">
              <div className={getNavStyle("/")}>Home</div>
            </Link>
            
            <Link to="/shop" className="shrink-0 group">
              <div className={getNavStyle("/shop")}>Shop All</div>
            </Link>
            
            <Link to="/new-arrivals" className="shrink-0 group">
              <div className={getNavStyle("/new-arrivals")}>New Arrivals</div>
            </Link>

            {loading ? (
              <span className="text-[12px] font-bold text-gray-400 py-3 uppercase tracking-wide">LOADING...</span>
            ) : (
              categories.map((category) => {
                const catPath = `/category/${category.slug}`;
                return (
                  <div key={category._id} className="relative group shrink-0">
                    <Link to={catPath}>
                      <div className={getNavStyle(catPath)}>{category.name}</div>
                    </Link>

                    {/* সাবক্যাটাগরি ড্রপডাউন */}
                    {category.subCategories.length > 0 && (
                      <div className="absolute top-[100%] left-0 w-48 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-sm z-50">
                        <ul className="py-2">
                          {category.subCategories.map((sub) => {
                            const subPath = `/category/${sub.slug}`;
                            const isSubActive = location.pathname === subPath;
                            return (
                              <li key={sub._id}>
                                <Link 
                                  to={subPath}
                                  className={`block px-4 py-2.5 text-[11px] font-bold uppercase transition ${
                                    isSubActive ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                  }`}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <Link to="/sale" className="shrink-0 group">
              <div className={getNavStyle("/sale") + " !text-red-600"}>Sale</div>
            </Link>

          </div>
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;