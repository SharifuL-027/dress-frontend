import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import api from "../../api/axios"; 
import ProductCard from "../product/ProductCard"; 
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi"; 

const CategoryPage = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [allCategories, setAllCategories] = useState([]);
  const [structuredCategories, setStructuredCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentCategory, setCurrentCategory] = useState(null);

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

  // ১. Data fetch and 3-Level sidebar structure
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
        setAllProducts(fetchedProducts);

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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ২. 3-Level Filtering and sorting logic
  useEffect(() => {
    if (allCategories.length === 0 || allProducts.length === 0) return;

    let result = [...allProducts];

    // URL Slug Category Filter
    const activeCat = allCategories.find(c => c.slug === slug);
    setCurrentCategory(activeCat || null);

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

      result = result.filter(product => {
        const pCatId = typeof product.category === 'object' ? product.category?._id : product.category;
        const pSubCatId = typeof product.subCategory === 'object' ? product.subCategory?._id : product.subCategory;
        const pSubSubCatId = typeof product.subSubCategory === 'object' ? product.subSubCategory?._id : product.subSubCategory;
        
        return allowedIds.includes(pCatId) || allowedIds.includes(pSubCatId) || allowedIds.includes(pSubSubCatId);
      });
    } else {
        // If category slug is not found (e.g., someone typed a wrong URL)
        setFilteredProducts([]);
        return;
    }

    // Name Search
    if (searchQuery.trim() !== "") {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Price Filter
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

    // Sorting
    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.discountPrice || a.regularPrice) - (b.discountPrice || b.regularPrice));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.discountPrice || b.regularPrice) - (a.discountPrice || a.regularPrice));
    } else if (sortOrder === "newest") {
       result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
  }, [slug, allCategories, allProducts, searchQuery, minPrice, maxPrice, sortOrder]);


  if (loading) return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-6 md:mt-16 mb-20 font-sans">
      
      {/* ---------------- BREADCRUMB ---------------- */}
      <div className="mb-4 md:mb-8 text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 truncate max-w-[150px] md:max-w-none">
          {currentCategory ? currentCategory.name : 'Category'}
        </span>
      </div>

      {/* ================= MOBILE TOGGLE BUTTON ================= */}
      <button 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden w-full mb-5 flex items-center justify-between bg-gray-900 text-white px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-md shadow-md transition-colors"
      >
        <span className="flex items-center gap-2"><FiFilter size={16} /> {isMobileSidebarOpen ? "Close Filters" : "Filter & Categories"}</span>
        <span className="text-lg leading-none">{isMobileSidebarOpen ? "−" : "+"}</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
        
        {/* ---------------- LEFT SIDEBAR (3-Level Categories) ---------------- */}
        <div className={`w-full lg:w-[260px] shrink-0 transition-all duration-300 ease-in-out origin-top ${isMobileSidebarOpen ? "block mb-4" : "hidden lg:block"}`}>
          <div className="sticky top-24 bg-white border border-gray-200 p-5 md:p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] rounded-xl">
            <h3 className="text-[13px] md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-100 pb-4">
              Categories
            </h3>
            
            <div className="space-y-1">
              {structuredCategories.map(mainCat => {
                const isActiveMain = slug === mainCat.slug;
                const hasSub = mainCat.subCats && mainCat.subCats.length > 0;
                
                const isChildActive = mainCat.subCats.some(sub => 
                  sub.slug === slug || (sub.subSubCats && sub.subSubCats.some(subSub => subSub.slug === slug))
                );
                const isOpen = expandedMenu[mainCat._id] || isActiveMain || isChildActive; 
                
                return (
                  <div key={mainCat._id} className="pb-2 border-b border-gray-50 last:border-0 last:pb-0 pt-2 first:pt-0">
                    
                    {/* Level 1: Main Category */}
                    <div className="flex justify-between items-center py-1.5 hover:bg-gray-50 rounded-md px-1 transition-colors group">
                      <Link 
                        to={`/category/${mainCat.slug}`} 
                        onClick={() => setIsMobileSidebarOpen(false)} 
                        className={`flex-1 text-[12px] md:text-[13px] font-extrabold uppercase tracking-wide transition-colors ${
                          isActiveMain ? 'text-red-600' : 'text-gray-800 group-hover:text-red-600'
                        }`}
                      >
                        {mainCat.name}
                      </Link>
                      
                      {hasSub && (
                        <button 
                          onClick={() => toggleMenu(mainCat._id)} 
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-all"
                        >
                          {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                    
                    {/* Level 2: Sub Categories */}
                    {hasSub && (
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <ul className="pl-3 ml-1 space-y-1 pb-2 border-l-2 border-gray-100">
                          {mainCat.subCats.map(subCat => {
                            const isActiveSub = slug === subCat.slug;
                            const hasSubSub = subCat.subSubCats && subCat.subSubCats.length > 0;
                            
                            const isSubChildActive = subCat.subSubCats?.some(subSub => subSub.slug === slug);
                            const isSubOpen = expandedSubMenu[subCat._id] || isActiveSub || isSubChildActive;

                            return (
                              <li key={subCat._id} className="mt-1">
                                <div className="flex justify-between items-center py-1 hover:bg-gray-50 rounded-md px-2 group transition-colors">
                                  <Link 
                                    to={`/category/${subCat.slug}`} 
                                    onClick={() => !hasSubSub && setIsMobileSidebarOpen(false)}
                                    className={`flex-1 block text-[11px] md:text-[12px] font-bold uppercase tracking-wider transition-all relative ${
                                      isActiveSub 
                                        ? 'text-red-600 translate-x-1' 
                                        : 'text-gray-500 group-hover:text-gray-900 group-hover:translate-x-1'
                                    }`}
                                  >
                                    {isActiveSub && <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_5px_rgba(220,38,38,0.5)]"></span>}
                                    {subCat.name}
                                  </Link>

                                  {hasSubSub && (
                                    <button 
                                      onClick={() => toggleSubMenu(subCat._id)} 
                                      className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                      {isSubOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                                    </button>
                                  )}
                                </div>

                                {/* Level 3: Sub-Sub Categories */}
                                {hasSubSub && (
                                   <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubOpen ? 'max-h-[500px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                                      <ul className="pl-4 ml-2 space-y-1 border-l border-gray-200">
                                         {subCat.subSubCats.map(subSubCat => {
                                            const isActiveSubSub = slug === subSubCat.slug;
                                            return (
                                              <li key={subSubCat._id}>
                                                 <Link 
                                                   to={`/category/${subSubCat.slug}`} 
                                                   onClick={() => setIsMobileSidebarOpen(false)}
                                                   className={`block py-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider transition-all hover:pl-1 ${
                                                     isActiveSubSub ? 'text-red-600' : 'text-gray-400 hover:text-gray-800'
                                                   }`}
                                                 >
                                                   <span className="mr-1 text-gray-300 opacity-50">-</span> {subSubCat.name}
                                                 </Link>
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

        {/* ---------------- RIGHT CONTENT ---------------- */}
        <div className="flex-1 w-full">
          
          {/* Top Title */}
          <div className="mb-5 md:mb-8 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-wide">
              {currentCategory ? currentCategory.name : 'Category Not Found'}
            </h1>
            <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
              Showing {filteredProducts.length} Results
            </p>
          </div>

          {/* ---------------- FILTER BAR ---------------- */}
          <div className="bg-white border border-gray-100 p-4 md:p-5 mb-6 md:mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] rounded-xl">
            
            {/* Search Box */}
            <div className="w-full md:w-[35%] relative">
              <input 
                type="text" 
                placeholder="Search in this category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 text-[11px] md:text-xs font-bold text-gray-700 py-3 px-4 focus:outline-none focus:border-gray-900 bg-gray-50/50 focus:bg-white transition-colors rounded-lg"
              />
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center justify-between md:justify-end gap-3 md:gap-4">
              
              {/* Price Filter */}
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

              {/* Sort Dropdown */}
              <div className="w-full sm:w-[160px] md:w-[180px]">
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-200 text-[10px] md:text-[11px] font-bold text-gray-900 uppercase tracking-wider py-3 px-3 focus:outline-none focus:border-gray-900 bg-gray-50/50 hover:bg-white cursor-pointer rounded-lg transition-colors appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
          </div>

          {/* ---------------- PRODUCT GRID ---------------- */}
          {!currentCategory ? (
             <div className="py-20 text-center border border-gray-100 bg-white shadow-sm rounded-xl">
               <span className="text-5xl mb-4 block opacity-50">🔗</span>
               <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">Category Not Found</h3>
               <p className="text-xs text-gray-500 max-w-md mx-auto px-4">The category you are looking for does not exist or has been removed.</p>
               <button onClick={() => navigate('/shop')} className="mt-6 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-md">
                 Go to Shop
               </button>
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center border border-gray-100 bg-white shadow-sm rounded-xl">
              <span className="text-5xl mb-4 block opacity-50">🔍</span>
              <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">No Products Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto px-4">Try adjusting your search query or price range to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(""); setMinPrice(""); setMaxPrice(""); }}
                className="mt-6 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-md shadow-md"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

export default CategoryPage;