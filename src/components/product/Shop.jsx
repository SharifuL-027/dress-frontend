import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router"; 
import api from "../../api/axios"; 
import ProductCard from "../../components/product/ProductCard";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi"; 

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get("search") || ""; 

  // ================= STATES =================
  const [allCategories, setAllCategories] = useState([]);
  const [structuredCategories, setStructuredCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  // Infinite Scroll States
  const [visibleCount, setVisibleCount] = useState(20); 
  const productsPerLoad = 20; 
  const observerTarget = useRef(null);

  // Mobile Responsiveness States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState({});
  const [expandedSubMenu, setExpandedSubMenu] = useState({});

  const toggleMenu = (id) => {
    setExpandedMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const toggleSubMenu = (id) => {
    setExpandedSubMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        
        const fetchedCategories = catRes.data;
        const fetchedProducts = prodRes.data.products || prodRes.data;

        setAllCategories(fetchedCategories);
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        // Sidebar 3-Level Structure Build
        const mainCats = fetchedCategories.filter(c => !c.parent);
        
        const structured = mainCats.map(main => {
          const subCats = fetchedCategories.filter(c => {
            const parentId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
            return parentId === main._id;
          });

          const subCatsWithSubSubs = subCats.map(sub => {
            const subSubCats = fetchedCategories.filter(c => {
               const parentId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
               return parentId === sub._id;
            });
            return { ...sub, subSubCats };
          });

          return { ...main, subCats: subCatsWithSubSubs };
        });
        
        setStructuredCategories(structured);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ================= FILTERING & SORTING LOGIC =================
  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      const activeCat = allCategories.find(c => c.slug === selectedCategory);
      
      if (activeCat) {
        let allowedIds = [activeCat._id];
        
        const getChildrenIds = (parentId) => {
           let childrenIds = [];
           const children = allCategories.filter(c => {
              const pId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
              return pId === parentId;
           });
           
           children.forEach(child => {
              childrenIds.push(child._id);
              childrenIds = [...childrenIds, ...getChildrenIds(child._id)];
           });
           return childrenIds;
        };

        allowedIds = [...allowedIds, ...getChildrenIds(activeCat._id)];

        result = result.filter(p => {
          const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
          const pSubCatId = typeof p.subCategory === 'object' ? p.subCategory?._id : p.subCategory;
          const pSubSubCatId = typeof p.subSubCategory === 'object' ? p.subSubCategory?._id : p.subSubCategory;
          
          return allowedIds.includes(pCatId) || allowedIds.includes(pSubCatId) || allowedIds.includes(pSubSubCatId);
        });
      }
    }

    if (searchQuery.trim() !== "") {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (minPrice !== "") {
      result = result.filter(product => {
        const price = product.discountPrice || product.regularPrice;
        return price >= Number(minPrice);
      });
    }

    if (maxPrice !== "") {
      result = result.filter(product => {
        const price = product.discountPrice || product.regularPrice;
        return price <= Number(maxPrice);
      });
    }

    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.discountPrice || a.regularPrice) - (b.discountPrice || b.regularPrice));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.discountPrice || b.regularPrice) - (a.discountPrice || a.regularPrice));
    } else if (sortOrder === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
    setVisibleCount(productsPerLoad); // Reset visible count on filter change
  }, [selectedCategory, searchQuery, minPrice, maxPrice, sortOrder, products, allCategories]);


  // ================= INFINITE SCROLL LOGIC =================
  const currentProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      // যখন ইউজার পেজের নিচে পৌঁছাবে, তখন আরও ২০টি লোড হবে
      setVisibleCount((prev) => prev + productsPerLoad);
    }
  }, [hasMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleObserver, currentProducts]);


  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-6 md:mt-16 mb-24 font-sans">
      
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-6 md:mb-10 text-center mt-4 md:mt-0">
        <h1 className="text-2xl md:text-4xl font-extrabold text-black uppercase tracking-[0.15em]">
          Shop All Products
        </h1>
        <div className="w-16 md:w-24 h-1 bg-red-600 mx-auto mt-3 md:mt-4 mb-2 md:mb-3"></div>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">
          Explore our complete collection
        </p>
      </div>

      {/* ================= MOBILE TOGGLE BUTTON ================= */}
      <button 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden w-full mb-5 flex items-center justify-between bg-gray-900 text-white px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-md transition-colors"
      >
        <span className="flex items-center gap-2"><FiFilter size={16} /> {isMobileSidebarOpen ? "Hide Categories" : "Shop by Category"}</span>
        <span className="text-lg leading-none">{isMobileSidebarOpen ? "−" : "+"}</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <div className={`w-full lg:w-[260px] shrink-0 transition-all duration-300 ease-in-out origin-top ${isMobileSidebarOpen ? "block mb-4" : "hidden lg:block"}`}>
          <div className="sticky top-24 bg-white border border-gray-200 p-5 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-xl">
            <h3 className="text-[13px] md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-100 pb-4">
              Categories
            </h3>
            
            <div className="space-y-1">
              
              <div className="pb-3 border-b border-gray-100 mb-2">
                <button 
                  onClick={() => { setSelectedCategory("all"); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left py-1.5 px-2 rounded-md transition-colors cursor-pointer text-[12px] md:text-[13px] font-extrabold uppercase tracking-wide ${
                    selectedCategory === "all" ? 'bg-red-50 text-red-600' : 'text-gray-800 hover:bg-gray-50 hover:text-red-600'
                  }`}
                >
                  All Products
                </button>
              </div>

              {structuredCategories.map(mainCat => {
                const isActiveMain = selectedCategory === mainCat.slug;
                const hasSub = mainCat.subCats && mainCat.subCats.length > 0;
                
                const isChildActive = mainCat.subCats.some(sub => 
                  sub.slug === selectedCategory || (sub.subSubCats && sub.subSubCats.some(subSub => subSub.slug === selectedCategory))
                );
                const isOpen = expandedMenu[mainCat._id] || isActiveMain || isChildActive; 

                return (
                  <div key={mainCat._id} className="pb-2 border-b border-gray-50 last:border-0 last:pb-0 pt-2 first:pt-0">
                    
                    <div className="flex justify-between items-center py-1.5 hover:bg-gray-50 rounded-md px-1 transition-colors group">
                      <button 
                        onClick={() => { setSelectedCategory(mainCat.slug); !hasSub && setIsMobileSidebarOpen(false); }}
                        className={`flex-1 text-left text-[12px] md:text-[13px] font-extrabold uppercase tracking-wide transition-colors cursor-pointer ${
                          isActiveMain ? 'text-red-600' : 'text-gray-800 group-hover:text-red-600'
                        }`}
                      >
                        {mainCat.name}
                      </button>

                      {hasSub && (
                        <button 
                          onClick={() => toggleMenu(mainCat._id)} 
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-all cursor-pointer"
                        >
                          {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                    
                    {hasSub && (
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <ul className="pl-3 ml-1 space-y-1 pb-2 border-l-2 border-gray-100">
                          
                          {mainCat.subCats.map(subCat => {
                            const isActiveSub = selectedCategory === subCat.slug;
                            const hasSubSub = subCat.subSubCats && subCat.subSubCats.length > 0;
                            
                            const isSubChildActive = subCat.subSubCats?.some(subSub => subSub.slug === selectedCategory);
                            const isSubOpen = expandedSubMenu[subCat._id] || isActiveSub || isSubChildActive;

                            return (
                              <li key={subCat._id} className="mt-1">
                                <div className="flex justify-between items-center py-1 hover:bg-gray-50 rounded-md px-2 group transition-colors">
                                  <button 
                                    onClick={() => { setSelectedCategory(subCat.slug); !hasSubSub && setIsMobileSidebarOpen(false); }}
                                    className={`flex-1 text-left block text-[11px] md:text-[12px] font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                                      isActiveSub 
                                        ? 'text-red-600 translate-x-1' 
                                        : 'text-gray-500 group-hover:text-gray-900 group-hover:translate-x-1'
                                    }`}
                                  >
                                    {isActiveSub && <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_rgba(220,38,38,0.5)]"></span>}
                                    {subCat.name}
                                  </button>

                                  {hasSubSub && (
                                    <button 
                                      onClick={() => toggleSubMenu(subCat._id)} 
                                      className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                    >
                                      {isSubOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                    </button>
                                  )}
                                </div>

                                {hasSubSub && (
                                   <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubOpen ? 'max-h-[500px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                                      <ul className="pl-4 ml-2 space-y-1 border-l border-gray-200">
                                         {subCat.subSubCats.map(subSubCat => {
                                            const isActiveSubSub = selectedCategory === subSubCat.slug;
                                            return (
                                              <li key={subSubCat._id}>
                                                 <button 
                                                   onClick={() => { setSelectedCategory(subSubCat.slug); setIsMobileSidebarOpen(false); }}
                                                   className={`w-full text-left block py-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider transition-all hover:pl-1 cursor-pointer ${
                                                     isActiveSubSub ? 'text-red-600' : 'text-gray-400 hover:text-gray-800'
                                                   }`}
                                                 >
                                                   <span className="mr-1 text-gray-300 opacity-50">-</span> {subSubCat.name}
                                                 </button>
                                              </li>
                                            )
                                         })}
                                      </ul>
                                   </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="flex-1 w-full">
          
          <div className="bg-white border border-gray-100 p-4 md:p-5 mb-6 md:mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] rounded-xl">
            
            <div className="w-full md:w-[35%] relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 text-[11px] md:text-xs font-bold text-gray-700 py-3 px-4 focus:outline-none focus:border-gray-900 bg-gray-50/50 focus:bg-white transition-colors rounded-lg"
              />
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-between md:justify-end gap-3 md:gap-4">
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="number" 
                  placeholder="Min ৳" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full sm:w-20 md:w-24 border border-gray-200 text-[11px] md:text-xs font-bold text-gray-700 py-3 px-2 focus:outline-none focus:border-gray-900 bg-gray-50/50 focus:bg-white text-center rounded-lg transition-colors"
                />
                <span className="text-gray-300 font-bold">-</span>
                <input 
                  type="number" 
                  placeholder="Max ৳" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full sm:w-20 md:w-24 border border-gray-200 text-[11px] md:text-xs font-bold text-gray-700 py-3 px-2 focus:outline-none focus:border-gray-900 bg-gray-50/50 focus:bg-white text-center rounded-lg transition-colors"
                />
              </div>

              <div className="w-full sm:w-[160px] md:w-[180px]">
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-200 text-[10px] md:text-[11px] font-bold text-gray-900 uppercase tracking-wider py-3 px-3 focus:outline-none focus:border-gray-900 bg-gray-50/50 hover:bg-white cursor-pointer rounded-lg transition-colors appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                >
                  <option value="default">Featured</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
          </div>

          <div className="mb-4 md:mb-6 flex justify-between items-center text-center md:text-left">
            <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest w-full md:w-auto">
              Showing {currentProducts.length} of {filteredProducts.length} Products
            </p>
          </div>

          {/* ================= PRODUCT GRID ================= */}
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center border border-gray-100 bg-white shadow-sm rounded-xl">
              <span className="text-5xl mb-4 block opacity-50">🔍</span>
              <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">No Products Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto px-4">Try adjusting your filters or search query to find what you are looking for.</p>
              <button 
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); setMinPrice(""); setMaxPrice(""); setSortOrder("default"); }}
                className="mt-6 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors cursor-pointer rounded-md shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {currentProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Invisible Target for Intersection Observer (Infinite Scroll) */}
              <div ref={observerTarget} className="w-full h-10 mt-8 flex items-center justify-center">
                {hasMore && (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Shop;