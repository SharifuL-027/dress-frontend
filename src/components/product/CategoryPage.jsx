import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import api from "../../api/axios"; 
import ProductCard from "../product/ProductCard"; 
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi"; // আইকন ইম্পোর্ট করা হলো

const CategoryPage = () => {
  const { slug } = useParams(); 
  
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

  const toggleMenu = (id) => {
    setExpandedMenu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ১. Data fetch ebong sidebar structure toiri kora
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

        // Sidebar er jonno tree-structure (Main -> Sub) toiri kora
        const mainCats = fetchedCategories.filter(c => !c.parent);
        const structured = mainCats.map(main => {
          return {
            ...main,
            subCats: fetchedCategories.filter(c => {
              const parentId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
              return parentId === main._id;
            })
          };
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

  // ২. Filtering ebong sorting logic
  useEffect(() => {
    if (allCategories.length === 0 || allProducts.length === 0) return;

    let result = [...allProducts];

    // ক) URL Slug onujayi Category Filter Kora
    const activeCat = allCategories.find(c => c.slug === slug);
    setCurrentCategory(activeCat || null);

    if (activeCat) {
      result = result.filter(product => {
        const pCatId = typeof product.category === 'object' ? product.category?._id : product.category;
        const pSubCatId = typeof product.subCategory === 'object' ? product.subCategory?._id : product.subCategory;
        return String(pCatId) === String(activeCat._id) || String(pSubCatId) === String(activeCat._id);
      });
    }

    // খ) Name diye search filter
    if (searchQuery.trim() !== "") {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // গ) Price filter (Min / Max)
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

    // ঘ) Sorting logic
    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.discountPrice || a.regularPrice) - (b.discountPrice || b.regularPrice));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.discountPrice || b.regularPrice) - (a.discountPrice || a.regularPrice));
    }

    setFilteredProducts(result);
  }, [slug, allCategories, allProducts, searchQuery, minPrice, maxPrice, sortOrder]);


  if (loading) return <div className="h-screen flex justify-center items-center text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Store...</div>;

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-6 md:mt-24 mb-20 font-sans">
      
      {/* ---------------- BREADCRUMB ---------------- */}
      <div className="mb-4 md:mb-6 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Shop</span>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[150px] md:max-w-none">{currentCategory ? currentCategory.name : 'All Products'}</span>
      </div>

      {/* ================= MOBILE TOGGLE BUTTON (Hidden on Desktop) ================= */}
      <button 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden w-full mb-5 flex items-center justify-between bg-gray-900 text-white px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-md transition-colors"
      >
        <span className="flex items-center gap-2"><FiFilter size={16} /> {isMobileSidebarOpen ? "Hide Categories" : "Shop by Category"}</span>
        <span className="text-lg leading-none">{isMobileSidebarOpen ? "−" : "+"}</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        
        {/* ---------------- LEFT SIDEBAR (Categories Tree) ---------------- */}
        <div className={`w-full lg:w-65 shrink-0 transition-all duration-300 ease-in-out origin-top ${isMobileSidebarOpen ? "block mb-4" : "hidden lg:block"}`}>
          <div className="sticky top-24 bg-white border border-gray-200 p-5 md:p-6 shadow-sm rounded-sm">
            <h3 className="text-[11px] md:text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-200 pb-3">
              Categories
            </h3>
            
            <div className="space-y-4">
              {structuredCategories.map(mainCat => {
                const isActiveMain = slug === mainCat.slug;
                const hasSub = mainCat.subCats && mainCat.subCats.length > 0;
                const isOpen = expandedMenu[mainCat._id] || isActiveMain; // Active থাকলে বাই-ডিফল্ট ওপেন থাকবে
                
                return (
                  <div key={mainCat._id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    
                    <div className="flex justify-between items-center">
                      <Link 
                        to={`/category/${mainCat.slug}`} 
                        onClick={() => setIsMobileSidebarOpen(false)} // ক্লিক করলে মোবাইলে মেনু বন্ধ হবে
                        className={`flex-1 text-[11px] md:text-xs font-extrabold uppercase tracking-widest transition-colors ${
                          isActiveMain ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                        }`}
                      >
                        {mainCat.name}
                      </Link>
                      
                      {hasSub && (
                        <button 
                          onClick={() => toggleMenu(mainCat._id)} 
                          className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                    
                    {/* Sub Categories (Collapsible) */}
                    {hasSub && (
                      <ul className={`pl-4 border-l-2 border-gray-100 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-2 space-y-2.5' : 'max-h-0'}`}>
                        {mainCat.subCats.map(subCat => {
                          const isActiveSub = slug === subCat.slug;
                          return (
                            <li key={subCat._id}>
                              <Link 
                                to={`/category/${subCat.slug}`} 
                                onClick={() => setIsMobileSidebarOpen(false)}
                                className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-wider transition-all relative ${
                                  isActiveSub 
                                    ? 'text-gray-900 translate-x-1' 
                                    : 'text-gray-500 hover:text-gray-900 hover:translate-x-1'
                                }`}
                              >
                                {isActiveSub && <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full"></span>}
                                {subCat.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT CONTENT (Filters & Product Grid) ---------------- */}
        <div className="flex-1">
          
          {/* Top Title */}
          <div className="mb-5 md:mb-6 text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
              {currentCategory ? currentCategory.name : 'Shop Collection'}
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 md:mt-2">
              Showing {filteredProducts.length} Results
            </p>
          </div>

          {/* ---------------- ADVANCED FILTER BAR (Mobile Optimized) ---------------- */}
          <div className="bg-gray-50 border border-gray-200 p-3 md:p-4 mb-6 md:mb-8 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between shadow-sm rounded-sm">
            
            {/* Search Box */}
            <div className="w-full md:w-1/3 relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 text-[11px] md:text-xs font-bold text-gray-700 py-2.5 md:py-3 px-3 md:px-4 focus:outline-none focus:border-gray-900 bg-white rounded-sm"
              />
            </div>

            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 md:gap-4">
              {/* Price Filter */}
              <div className="flex items-center gap-1.5 md:gap-2">
                <input 
                  type="number" 
                  placeholder="Min ৳" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-16 md:w-24 border border-gray-300 text-[10px] md:text-xs font-bold text-gray-700 py-2.5 md:py-3 px-1 md:px-2 focus:outline-none focus:border-gray-900 bg-white text-center rounded-sm"
                />
                <span className="text-gray-400 font-bold">-</span>
                <input 
                  type="number" 
                  placeholder="Max ৳" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-16 md:w-24 border border-gray-300 text-[10px] md:text-xs font-bold text-gray-700 py-2.5 md:py-3 px-1 md:px-2 focus:outline-none focus:border-gray-900 bg-white text-center rounded-sm"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex-1 md:w-auto">
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 text-[9px] md:text-[11px] font-bold text-gray-900 uppercase tracking-wider py-2.5 md:py-3 px-2 focus:outline-none focus:border-gray-900 bg-white cursor-pointer rounded-sm"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
          </div>

          {/* ---------------- PRODUCT GRID ---------------- */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 md:py-24 text-center border border-gray-200 bg-gray-50 flex flex-col items-center rounded-sm">
              <span className="text-4xl md:text-5xl mb-3 md:mb-4">🔍</span>
              <h3 className="text-base md:text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">No Products Found</h3>
              <p className="text-[11px] md:text-sm text-gray-500 max-w-md px-4">Try adjusting your search query, price range, or category filter to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(""); setMinPrice(""); setMaxPrice(""); }}
                className="mt-5 md:mt-6 bg-gray-900 text-white px-5 py-2.5 md:px-6 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors rounded-sm"
              >
                Clear Filters
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

export default CategoryPage;