import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios"; 
import ProductCard from "../../components/product/ProductCard"; 
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi"; 

const NewArrivalsPage = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [structuredCategories, setStructuredCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Mobile Responsiveness States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState({});
  const [expandedSubMenu, setExpandedSubMenu] = useState({}); // For 3rd Level

  const toggleMenu = (id) => {
    setExpandedMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const toggleSubMenu = (id) => {
    setExpandedSubMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ১. ক্যাটাগরি এবং প্রোডাক্ট ডাটা ফেচ করা (3-Level)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products')
        ]);
        
        const fetchedCategories = catRes.data;
        const fetchedProducts = prodRes.data.products || prodRes.data;

        setAllCategories(fetchedCategories);

        // নতুন প্রোডাক্টগুলো ফিল্টার করা
        const sortedNewProducts = fetchedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedNewProducts);
        setFilteredProducts(sortedNewProducts);

        // সাইডবারের জন্য ৩-লেভেল স্ট্রাকচার তৈরি
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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ২. ফিল্টারিং এবং সর্টিং লজিক (3-Level Supported)
  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      const activeCat = allCategories.find(c => c.slug === selectedCategory);
      
      if (activeCat) {
        let allowedIds = [activeCat._id];
        
        // Find all child categories recursively (Sub and Sub-Subs)
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
  }, [selectedCategory, searchQuery, minPrice, maxPrice, sortOrder, products, allCategories]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-6 md:mt-24 mb-24 font-sans">
      
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-6 md:mb-10 text-center mt-4 md:mt-0">
        <h1 className="text-2xl md:text-4xl font-extrabold text-black uppercase tracking-[0.15em]">
          New Arrivals
        </h1>
        <div className="w-16 md:w-24 h-1 bg-red-600 mx-auto mt-3 md:mt-4 mb-2 md:mb-3"></div>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">
          Explore our latest collection of premium clothing
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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        
        {/* ================= LEFT SIDEBAR (3-Level Categories) ================= */}
        <div className={`w-full lg:w-[260px] shrink-0 transition-all duration-300 ease-in-out origin-top ${isMobileSidebarOpen ? "block mb-4" : "hidden lg:block"}`}>
          <div className="sticky top-28 bg-white border border-gray-200 p-5 md:p-6 shadow-sm rounded-sm">
            <h3 className="text-[12px] md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-200 pb-3">
              Categories
            </h3>
            
            <div className="space-y-2">
              <div className="pb-1 border-b border-gray-50">
                <button 
                  onClick={() => { setSelectedCategory("all"); setIsMobileSidebarOpen(false); }}
                  className={`w-full text-left py-2 text-[11px] md:text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                    selectedCategory === "all" ? 'text-red-600' : 'text-gray-800 hover:text-red-600'
                  }`}
                >
                  All New Arrivals
                </button>
              </div>

              {structuredCategories.map(mainCat => {
                const isActiveMain = selectedCategory === mainCat.slug;
                const hasSub = mainCat.subCats && mainCat.subCats.length > 0;
                const isOpen = expandedMenu[mainCat._id] || false; 

                return (
                  <div key={mainCat._id} className="pb-1 border-b border-gray-50 last:border-0 last:pb-0">
                    
                    {/* Level 1: Main Category */}
                    <div className="flex justify-between items-center py-2">
                      <button 
                        onClick={() => { setSelectedCategory(mainCat.slug); !hasSub && setIsMobileSidebarOpen(false); }}
                        className={`flex-1 text-left text-[11px] md:text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                          isActiveMain ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                        }`}
                      >
                        {mainCat.name}
                      </button>

                      {hasSub && (
                        <button 
                          onClick={() => toggleMenu(mainCat._id)} 
                          className="p-1 -mr-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                    
                    {/* Level 2: Sub Categories */}
                    {hasSub && (
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-auto opacity-100' : 'max-h-0 opacity-0'}`}>
                        <ul className="pl-4 mt-1 space-y-2 pb-3 border-l-2 border-gray-100">
                          
                          {mainCat.subCats.map(subCat => {
                            const isActiveSub = selectedCategory === subCat.slug;
                            const hasSubSub = subCat.subSubCats && subCat.subSubCats.length > 0;
                            const isSubOpen = expandedSubMenu[subCat._id] || false;

                            return (
                              <li key={subCat._id}>
                                <div className="flex justify-between items-center">
                                  <button 
                                    onClick={() => { setSelectedCategory(subCat.slug); !hasSubSub && setIsMobileSidebarOpen(false); }}
                                    className={`flex-1 text-left block text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all relative ${
                                      isActiveSub 
                                        ? 'text-red-600 translate-x-1' 
                                        : 'text-gray-500 hover:text-gray-900 hover:translate-x-1'
                                    }`}
                                  >
                                    {isActiveSub && <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full"></span>}
                                    {subCat.name}
                                  </button>

                                  {hasSubSub && (
                                    <button 
                                      onClick={() => toggleSubMenu(subCat._id)} 
                                      className="p-1 -mr-1 text-gray-300 hover:text-red-600 transition-colors"
                                    >
                                      {isSubOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                    </button>
                                  )}
                                </div>

                                {/* Level 3: Sub-Sub Categories */}
                                {hasSubSub && isSubOpen && (
                                   <ul className="pl-4 mt-2 space-y-2 mb-2 border-l border-gray-100">
                                      {subCat.subSubCats.map(subSubCat => {
                                         const isActiveSubSub = selectedCategory === subSubCat.slug;
                                         return (
                                           <li key={subSubCat._id}>
                                              <button 
                                                onClick={() => { setSelectedCategory(subSubCat.slug); setIsMobileSidebarOpen(false); }}
                                                className={`w-full text-left block text-[9px] md:text-[10px] font-medium uppercase tracking-wider transition-all ${
                                                  isActiveSubSub ? 'text-red-600 font-bold' : 'text-gray-400 hover:text-gray-700'
                                                }`}
                                              >
                                                - {subSubCat.name}
                                              </button>
                                           </li>
                                         )
                                      })}
                                   </ul>
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

        {/* ================= RIGHT CONTENT (Filters & Products) ================= */}
        <div className="flex-1">
          
          <div className="bg-gray-50 border border-gray-200 p-3 md:p-4 mb-6 md:mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between shadow-sm rounded-sm">
            
            <div className="w-full md:w-1/3 relative">
              <input 
                type="text" 
                placeholder="Search new arrivals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 text-[11px] md:text-xs font-medium text-gray-700 py-2.5 md:py-3 px-3 md:px-4 focus:outline-none focus:border-black bg-white rounded-sm"
              />
            </div>

            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 md:gap-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <input 
                  type="number" 
                  placeholder="Min ৳" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-16 md:w-24 border border-gray-300 text-[10px] md:text-xs font-medium text-gray-700 py-2.5 md:py-3 px-1 md:px-2 focus:outline-none focus:border-black bg-white text-center rounded-sm"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input 
                  type="number" 
                  placeholder="Max ৳" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-16 md:w-24 border border-gray-300 text-[10px] md:text-xs font-medium text-gray-700 py-2.5 md:py-3 px-1 md:px-2 focus:outline-none focus:border-black bg-white text-center rounded-sm"
                />
              </div>

              <div className="flex-1 md:w-auto">
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 text-[9px] md:text-[11px] font-bold text-gray-900 uppercase tracking-wider py-2.5 md:py-3 px-2 focus:outline-none focus:border-black bg-white cursor-pointer rounded-sm"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
          </div>

          <div className="mb-4 md:mb-6 flex justify-between items-center text-center md:text-left">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest w-full md:w-auto">
              Showing {filteredProducts.length} New Products
            </p>
          </div>

          {/* ================= PRODUCT GRID ================= */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 md:py-24 text-center border border-gray-200 bg-gray-50 flex flex-col items-center rounded-sm">
              <span className="text-4xl md:text-5xl mb-3 md:mb-4">🔍</span>
              <h3 className="text-base md:text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">No New Products Found</h3>
              <p className="text-[11px] md:text-sm font-medium text-gray-500 max-w-md px-4">Try adjusting your filters or search query to find what you are looking for.</p>
              <button 
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); setMinPrice(""); setMaxPrice(""); }}
                className="mt-5 md:mt-6 bg-black text-white px-5 py-2.5 md:px-6 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors cursor-pointer rounded-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default NewArrivalsPage;