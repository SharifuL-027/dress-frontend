import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import api from "../api/axios"; 
import { useAuth } from "../context/AuthContext"; 
import { useCart } from "../context/CartContext"; 
import { FiMenu, FiX, FiSearch, FiUser, FiHeart, FiShoppingCart, FiChevronDown, FiChevronUp } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, wishlist, openCart } = useCart(); 
  const location = useLocation(); 
  const navigate = useNavigate();
  
  // States
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [navProducts, setNavProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Mobile States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null); 
  const mobileSearchRef = useRef(null);

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setExpandedCategory(null);
  }, [location.pathname]);

  // Category & Products fetch logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products')
        ]);
        
        const productsData = prodRes.data.products || prodRes.data;
        const sortedProducts = productsData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNavProducts(sortedProducts);

        // ===============================================
        // Categories Sorting (Smart Logic for Navbar)
        // ===============================================
        const rawCategories = catRes.data;
        
        // 1. মেইন ক্যাটাগরি ফিল্টার এবং সর্ট করা
        let mainCategories = rawCategories
          .filter(c => !c.parent)
          .map(c => ({ ...c, subCategories: [] }));
        
        mainCategories.sort((a, b) => {
          const orderA = a.sortOrder || 0;
          const orderB = b.sortOrder || 0;
          if (orderA > 0 && orderB > 0) return orderA - orderB;
          if (orderA > 0 && orderB === 0) return -1;
          if (orderB > 0 && orderA === 0) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 2. সাব-ক্যাটাগরিগুলোকে মেইন ক্যাটাগরির ভেতরে ঢোকানো
        rawCategories.forEach((item) => {
          if (item.parent) {
            const parentId = typeof item.parent === 'object' ? item.parent._id : item.parent;
            const parentIndex = mainCategories.findIndex(
              (cat) => cat._id.toString() === parentId.toString()
            );
            if (parentIndex > -1) {
              mainCategories[parentIndex].subCategories.push(item);
            }
          }
        });

        // 3. সাব-ক্যাটাগরিগুলোকেও পজিশন অনুযায়ী সর্ট করা
        mainCategories.forEach(mainCat => {
          mainCat.subCategories.sort((a, b) => {
            const orderA = a.sortOrder || 0;
            const orderB = b.sortOrder || 0;
            if (orderA > 0 && orderB > 0) return orderA - orderB;
            if (orderA > 0 && orderB === 0) return -1;
            if (orderB > 0 && orderA === 0) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        });

        setCategories(mainCategories);
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

  // Click outside to close search dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearchDropdown(false);
      setIsMobileSearchOpen(false);
      navigate(`/shop?search=${searchTerm.trim()}`); 
      setSearchTerm("");
    }
  };

  const handleResultClick = (id) => {
    setShowSearchDropdown(false);
    setIsMobileSearchOpen(false);
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

  const toggleMobileCategory = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  return (
    <nav className={`sticky top-0 left-0 w-full z-[100] bg-white transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
      
      {/* ================= TIER 1: Top Bar ================= */}
      <div className="bg-[#cf141b] text-white text-[11px] uppercase tracking-wider py-1.5 hidden md:block">
        <div className="max-w-375 mx-auto px-4 md:px-8 flex justify-between items-center">
          <div>Welcome to DressTown</div>
          <div className="flex space-x-6">
            <Link to={user ? "/my-orders" : "/track-order"} className="hover:text-gray-300 transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact Us</Link>
            <Link to="/store-location" className="hover:text-gray-300 transition-colors">Store Location</Link>
          </div>
        </div>
      </div>

      {/* ================= TIER 2: Main Middle Bar ================= */}
      <div className="max-w-375 mx-auto px-4 md:px-8 py-3 lg:py-5 flex justify-between items-center relative">
        
        <button 
          className="lg:hidden text-gray-800 p-1"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <FiMenu size={24} />
        </button>

        <div className="shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start">
          <Link to="/">
            <img 
              src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
              alt="DressTown Logo" 
              className="h-12 md:h-12 w-auto object-contain" 
            />
          </Link>
        </div>

        {/* Search Desktop */}
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
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
              <FiSearch size={20} />
            </button>
          </form>

          {showSearchDropdown && (
            <div className="absolute top-[110%] left-0 w-full bg-white border border-gray-200 shadow-xl rounded-b-md overflow-hidden z-50">
              {isSearching ? (
                <div className="p-6 text-center text-xs inter-bold text-gray-500 uppercase tracking-widest animate-pulse">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] inter-bold uppercase tracking-widest text-gray-500">Products</span>
                    <span className="text-[10px] inter-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{searchResults.length} Found</span>
                  </div>
                  <ul className="max-h-87.5 overflow-y-auto custom-scrollbar">
                    {searchResults.map((product) => (
                      <li key={product._id} className="border-b border-gray-100 last:border-b-0">
                        <button onClick={() => handleResultClick(product._id)} className="w-full text-left flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors cursor-pointer group">
                          <img src={product.images?.[0]?.url || "https://placehold.co/100x100"} alt={product.name} className="w-12 h-14 object-cover border border-gray-200" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs inter-bold text-gray-900 uppercase tracking-wide truncate group-hover:text-red-600 transition-colors">{product.name}</h4>
                            <p className="text-[10px] inter-medium text-gray-500 mt-1 uppercase">{product.category?.name || "Apparel"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs inter-bold text-red-600">৳{product.discountPrice || product.regularPrice}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={handleSearchSubmit} className="w-full bg-gray-900 text-white text-[11px] inter-bold uppercase tracking-widest py-3 hover:bg-red-600 transition-colors cursor-pointer">
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

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4 md:space-x-6 text-gray-800 shrink-0">
          
          <button 
            className="lg:hidden p-1 text-gray-800"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <FiSearch size={22} />
          </button>

          <div className="relative group cursor-pointer h-full hidden lg:flex items-center">
            <div className={`flex items-center space-x-1.5 transition-colors py-2 ${location.pathname.includes('/profile') ? "text-red-600" : "hover:text-red-600"}`}>
              <FiUser size={22} />
              <span className="text-xs font-bold uppercase">{user ? "Profile" : "Login"}</span>
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

          <Link to="/wishlist" className="group py-2 hidden lg:flex">
            <div className={`flex items-center space-x-1.5 transition-colors ${location.pathname === '/wishlist' ? "text-red-600" : "hover:text-red-600"}`}>
              <div className="relative">
                <FiHeart size={22} />
                {wishlist?.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold uppercase">Wishlist</span>
            </div>
          </Link>

          <button onClick={openCart} className="group hidden lg:flex items-center space-x-1.5 hover:text-red-600 transition-colors cursor-pointer py-2">
            <div className="relative">
              <FiShoppingCart size={22} />
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center border-2 border-white">
                {cart?.reduce((acc, item) => acc + item.qty, 0) || 0}
              </span>
            </div>
            <span className="text-xs font-bold uppercase">Bag</span>
          </button>
          
        </div>
      </div>

      {/* ================= MOBILE EXPANDABLE SEARCH ================= */}
      <div 
        ref={mobileSearchRef}
        className={`lg:hidden w-full bg-gray-50 border-b border-gray-200 transition-all duration-300 overflow-hidden ${isMobileSearchOpen ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0 border-none"}`}
      >
        <div className="p-4 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-sm focus:outline-none focus:border-red-600 px-4 py-3 text-sm transition-colors pr-10 bg-white"
              autoFocus={isMobileSearchOpen}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch size={20} />
            </button>
          </form>

          {searchTerm.length > 1 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-sm shadow-sm max-h-[40vh] overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-[10px] inter-bold text-gray-500 uppercase tracking-widest animate-pulse">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((product) => (
                    <li key={product._id} className="border-b border-gray-100 last:border-b-0">
                      <button onClick={() => handleResultClick(product._id)} className="w-full text-left flex items-center gap-3 p-2 hover:bg-gray-50">
                        <img src={product.images?.[0]?.url || "https://placehold.co/100x100"} alt={product.name} className="w-10 h-10 object-cover border border-gray-200" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] inter-bold text-gray-900 uppercase truncate">{product.name}</h4>
                          <span className="text-[10px] inter-bold text-red-600">৳{product.discountPrice || product.regularPrice}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button onClick={handleSearchSubmit} className="w-full bg-gray-100 text-gray-800 text-[10px] inter-bold uppercase tracking-widest py-3 hover:bg-gray-200">
                      View All Results
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-4 text-center text-[10px] inter-bold text-gray-500 uppercase">No products found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= MEGA MENU (Desktop) ================= */}
      <div className="hidden lg:block border-t border-b border-gray-100 bg-white">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 relative">
          
          <div className="flex items-center justify-center space-x-8">
            <Link to="/" className="shrink-0 group"><div className={getNavStyle("/")}>Home</div></Link>
            <Link to="/shop" className="shrink-0 group"><div className={getNavStyle("/shop")}>Shop All</div></Link>
            <Link to="/new-arrivals" className="shrink-0 group"><div className={getNavStyle("/new-arrivals")}>New Arrivals</div></Link>

            {loading ? (
              <span className="text-[12px] font-bold text-gray-400 py-3 uppercase tracking-wide">LOADING...</span>
            ) : (
              categories.map((category) => {
                const catPath = `/category/${category.slug}`;
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

                    {hasMegaMenu && (
                      <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[450px] bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 rounded-sm z-50 p-6 flex gap-6 cursor-default">
                        
                        {category.subCategories.length > 0 && (
                          <div className={`${catProducts.length > 0 ? "w-1/3 border-r border-gray-100 pr-4" : "w-full"}`}>
                            <h3 className="text-[10px] inter-bold text-gray-400 uppercase tracking-widest mb-4">Categories</h3>
                            <ul className="space-y-1">
                              {category.subCategories.map((sub) => {
                                const subPath = `/category/${sub.slug}`;
                                return (
                                  <li key={sub._id}>
                                    <Link to={subPath} className="block py-1.5 text-[11px] inter-bold uppercase text-gray-700 hover:text-red-600 transition">
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {catProducts.length > 0 && (
                          <div className={`${category.subCategories.length > 0 ? "w-2/3" : "w-full"}`}>
                            <h3 className="text-[10px] inter-bold text-gray-400 uppercase tracking-widest mb-4">Featured in {category.name}</h3>
                            <div className={`grid gap-4 ${catProducts.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                              {catProducts.map(prod => (
                                <Link to={`/product/${prod._id}`} key={prod._id} className="group/item block">
                                  <div className="relative overflow-hidden bg-gray-100 mb-2 h-24 w-full">
                                    <img src={prod.images?.[0]?.url || "https://placehold.co/200x200?text=No+Image"} alt={prod.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                  </div>
                                  <h4 className="text-[9px] inter-bold text-gray-900 uppercase tracking-wide truncate group-hover/item:text-red-600">{prod.name}</h4>
                                  <p className="text-[10px] text-red-600 inter-bold mt-0.5">৳{prod.discountPrice || prod.regularPrice}</p>
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

      {/* ================= MOBILE SIDEBAR MENU ================= */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[110] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 left-0 h-full w-[80%] max-w-sm bg-white z-[120] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" alt="Logo" className="h-8" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 p-2 bg-gray-50 rounded-full hover:bg-gray-100">
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <ul className="flex flex-col">
            <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3.5 text-[11px] inter-bold uppercase tracking-widest text-gray-800 border-b border-gray-50">Home</Link></li>
            <li><Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3.5 text-[11px] inter-bold uppercase tracking-widest text-gray-800 border-b border-gray-50">Shop All</Link></li>
            <li><Link to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="block px-6 py-3.5 text-[11px] inter-bold uppercase tracking-widest text-gray-800 border-b border-gray-50">New Arrivals</Link></li>
            
            <li className="px-6 pt-6 pb-2">
              <span className="text-[10px] inter-bold uppercase tracking-[0.2em] text-gray-400">Shop by Category</span>
            </li>

            {categories.map((category) => {
              const hasSub = category.subCategories.length > 0;
              const isOpen = expandedCategory === category._id;

              return (
                <li key={category._id} className="border-b border-gray-50">
                  <div className="flex items-center justify-between px-6 py-3.5">
                    <Link 
                      to={`/category/${category.slug}`} 
                      onClick={() => !hasSub && setIsMobileMenuOpen(false)}
                      className="text-[11px] inter-bold uppercase tracking-widest text-gray-800 flex-1"
                    >
                      {category.name}
                    </Link>
                    
                    {hasSub && (
                      <button 
                        onClick={() => toggleMobileCategory(category._id)}
                        className="p-1 -mr-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </button>
                    )}
                  </div>
                  
                  {hasSub && (
                    <div className={`overflow-hidden transition-all duration-300 bg-gray-50/50 ${isOpen ? "max-h-96" : "max-h-0"}`}>
                      <ul className="pl-6 pb-3 flex flex-col space-y-1">
                        <li>
                          <Link 
                            to={`/category/${category.slug}`} 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className="text-[10px] inter-bold text-red-600 uppercase tracking-widest block py-2"
                          >
                            View All {category.name}
                          </Link>
                        </li>
                        {category.subCategories.map((sub) => (
                          <li key={sub._id}>
                            <Link 
                              to={`/category/${sub.slug}`} 
                              onClick={() => setIsMobileMenuOpen(false)} 
                              className="text-[11px] inter-medium text-gray-600 hover:text-red-600 uppercase tracking-wider block py-2"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer (Login / Contact / Admin) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 pb-8">
          
          {/* Admin Panel Button (Sudhumatro Admin der jonno) */}
          {user?.role === 'admin' && (
            <Link 
              to="/admin/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-3.5 text-[11px] inter-bold uppercase tracking-widest mb-3 transition-colors shadow-sm"
            >
              Admin Panel
            </Link>
          )}

          {!user ? (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 text-[11px] inter-bold uppercase tracking-widest mb-4 hover:bg-gray-800 transition-colors">
              <FiUser /> Sign In / Register
            </Link>
          ) : (
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 text-[11px] inter-bold uppercase tracking-widest mb-4 hover:bg-gray-800 transition-colors">
              <FiUser /> My Account
            </Link>
          )}
          
          <div className="flex gap-4 justify-center">
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] inter-bold uppercase text-gray-500 hover:text-red-600 transition-colors">Contact Us</Link>
            <span className="text-gray-300">|</span>
            <Link to="/store-location" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] inter-bold uppercase text-gray-500 hover:text-red-600 transition-colors">Store Locator</Link>
          </div>
        </div>
      </div>
      
    </nav>
  );
};

export default Navbar;