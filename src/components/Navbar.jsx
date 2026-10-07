import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext"; 
import { useCart } from "../context/CartContext"; 

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, wishlist, openCart } = useCart(); 
  const location = useLocation(); 
  const navigate = useNavigate();
  
  // States
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [navProducts, setNavProducts] = useState([]); // নতুন স্টেট: মেগা মেনুতে প্রোডাক্ট দেখানোর জন্য
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

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

  // Category & Products fetch logic (একসাথে ক্যাটাগরি ও প্রোডাক্ট আনা হচ্ছে)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products')
        ]);
        
        // Products সেট করা
        const productsData = prodRes.data.products || prodRes.data;
        // লেটেস্ট প্রোডাক্টগুলো আগে দেখানোর জন্য সর্ট করা
        const sortedProducts = productsData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNavProducts(sortedProducts);

        // Categories সেট করা
        const data = catRes.data;
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
        console.error("Error fetching navbar data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ================= LIVE SEARCH LOGIC =================
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 1 && navProducts.length > 0) {
        setIsSearching(true);
        const filtered = navProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(filtered.slice(0, 5));
        setShowSearchDropdown(true);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, navProducts]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?search=${searchTerm.trim()}`); 
      setSearchTerm("");
    }
  };

  const handleResultClick = (id) => {
    setShowSearchDropdown(false);
    setSearchTerm("");
    navigate(`/product/${id}`);
  };

  const getNavStyle = (path) => {
    const isActive = location.pathname === path;
    return `relative text-[12px] md:text-[13px] font-bold uppercase tracking-wide transition-colors duration-300 py-3 ${
      isActive ? "text-red-600" : "text-gray-800 hover:text-red-600"
    } after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-red-600 after:transition-transform after:duration-300 after:origin-left ${
      isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
    }`;
  };

  return (
    <nav className={`sticky top-0 left-0 w-full z-100 bg-white transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
      
      {/* ================= TIER 1: Top Bar ================= */}
      <div className="bg-[#cf141b] text-white text-[11px] uppercase tracking-wider py-1.5 hidden md:block">
        <div className="max-w-350 mx-auto px-4 md:px-8 flex justify-between items-center">
          <div>Welcome to DressTown</div>
          <div className="flex space-x-6">
            <Link to={user ? "/my-orders" : "/track-order"} className="hover:text-gray-300 transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link>
            <Link to="/store-location" className="hover:text-gray-300 transition-colors">Store Location</Link>
          </div>
        </div>
      </div>

      {/* ================= TIER 2: Main Middle Bar ================= */}
      <div className="max-w-350 mx-auto px-4 md:px-8 py-4 lg:py-5 flex justify-between items-center">
        
        <div className="shrink-0">
          <Link to="/">
            <img 
              src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
              alt="DressTown Logo" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* ================= PROFESSIONAL SEARCH BAR ================= */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-10 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim().length > 1 && setShowSearchDropdown(true)}
              className="w-full border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 px-4 py-2.5 text-sm transition-colors pr-10 bg-gray-50/50"
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

          {/* Live Search Dropdown Panel */}
          {showSearchDropdown && (
            <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-200 shadow-xl rounded-b-md overflow-hidden z-50">
              
              {isSearching ? (
                <div className="p-6 text-center text-xs inter-bold text-gray-500 uppercase tracking-widest animate-pulse">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] inter-bold uppercase tracking-widest text-gray-500">Products</span>
                    <span className="text-[10px] inter-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{searchResults.length} Found</span>
                  </div>
                  
                  <ul className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {searchResults.map((product) => (
                      <li key={product._id} className="border-b border-gray-100 last:border-b-0">
                        <button 
                          onClick={() => handleResultClick(product._id)}
                          className="w-full text-left flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <img 
                            src={product.images?.[0]?.url || "https://placehold.co/100x100"} 
                            alt={product.name}
                            className="w-12 h-14 object-cover border border-gray-200" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs inter-bold text-gray-900 uppercase tracking-wide truncate group-hover:text-red-600 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-[10px] inter-medium text-gray-500 mt-1 uppercase">
                              {product.category?.name || "Apparel"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs inter-bold text-red-600">৳{product.discountPrice || product.regularPrice}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full bg-gray-900 text-white text-[11px] inter-bold uppercase tracking-widest py-3 hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    View All Results for "{searchTerm}"
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <span className="text-3xl mb-2">🛍️</span>
                  <p className="text-xs inter-bold text-gray-900 uppercase tracking-widest mb-1">No products found</p>
                  <p className="text-[10px] inter-medium text-gray-500">Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 text-gray-800 shrink-0">
          
          <div className="relative group cursor-pointer h-full flex items-center">
            <div className={`flex items-center space-x-1.5 transition-colors py-2 ${location.pathname.includes('/profile') ? "text-red-600" : "hover:text-red-600"}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden md:block text-xs font-bold uppercase">
                {user ? "Profile" : "Login"}
              </span>
            </div>

            <div className="absolute top-full right-0 w-48 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-sm z-50">
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
                      <button onClick={logout} className="w-full text-left block px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-50 hover:text-red-600 uppercase cursor-pointer">Logout</button>
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

      {/* ================= TIER 3: Bottom Navigation with MEGA MENU ================= */}
      <div className="border-t border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative">
          
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
                
                // এই ক্যাটাগরির বা এর সাব-ক্যাটাগরির প্রোডাক্টগুলো বের করা হচ্ছে (সর্বোচ্চ ৩টি)
                const catProducts = navProducts.filter(p => {
                  const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
                  const pSubCatId = typeof p.subCategory === 'object' ? p.subCategory?._id : p.subCategory;
                  return pCatId === category._id || pSubCatId === category._id;
                }).slice(0, 3);

                const hasMegaMenu = category.subCategories.length > 0 || catProducts.length > 0;

                return (
                  <div key={category._id} className="relative group shrink-0">
                    <Link to={catPath}>
                      <div className={getNavStyle(catPath)}>{category.name}</div>
                    </Link>

                    {/* ================= MEGA MENU ================= */}
                    {hasMegaMenu && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[450px] bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-sm z-50 p-6 flex gap-6 cursor-default">
                        
                        {/* Left Side: Subcategories */}
                        {category.subCategories.length > 0 && (
                          <div className={`${catProducts.length > 0 ? "w-1/3 border-r border-gray-100 pr-4" : "w-full"}`}>
                            <h3 className="text-[10px] inter-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
                            <ul className="space-y-1">
                              {category.subCategories.map((sub) => {
                                const subPath = `/category/${sub.slug}`;
                                const isSubActive = location.pathname === subPath;
                                return (
                                  <li key={sub._id}>
                                    <Link 
                                      to={subPath}
                                      className={`block py-1.5 text-[11px] inter-bold uppercase transition ${
                                        isSubActive ? "text-red-600" : "text-gray-700 hover:text-red-600"
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

                        {/* Right Side: Featured Products from this Category */}
                        {catProducts.length > 0 && (
                          <div className={`${category.subCategories.length > 0 ? "w-2/3" : "w-full"}`}>
                            <h3 className="text-[10px] inter-bold text-gray-400 uppercase tracking-widest mb-4">Featured in {category.name}</h3>
                            <div className={`grid gap-4 ${catProducts.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                              {catProducts.map(prod => (
                                <Link to={`/product/${prod._id}`} key={prod._id} className="group/item block">
                                  <div className="relative overflow-hidden bg-gray-100 mb-2 h-28 w-full">
                                    <img 
                                      src={prod.images?.[0]?.url || "https://placehold.co/200x200?text=No+Image"} 
                                      alt={prod.name}
                                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                    />
                                  </div>
                                  <h4 className="text-[9px] inter-bold text-gray-900 uppercase tracking-wide truncate group-hover/item:text-red-600 transition-colors">
                                    {prod.name}
                                  </h4>
                                  <p className="text-[10px] text-red-600 inter-bold mt-0.5">
                                    ৳{prod.discountPrice || prod.regularPrice}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;