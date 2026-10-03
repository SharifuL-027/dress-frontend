import { useState, useEffect } from "react";
import { useSearchParams } from "react-router"; 
import api from "../../api/axios"; 
import ProductCard from "../product/ProductCard";

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

  // ================= FETCH DATA =================
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
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);

        // Sidebar-er jonno main o sub category structure তৈরি
        const mainCats = fetchedCategories.filter(c => !c.parent);
        const structured = mainCats.map(main => ({
          ...main,
          subCats: fetchedCategories.filter(c => {
            const parentId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
            return parentId === main._id;
          })
        }));
        
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

    // 1. Category Filter
    if (selectedCategory !== "all") {
      const activeCat = allCategories.find(c => c.slug === selectedCategory);
      if (activeCat) {
        let allowedIds = [activeCat._id];
        if (!activeCat.parent) {
          const subCats = allCategories.filter(c => {
            const pId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
            return pId === activeCat._id;
          });
          allowedIds = [...allowedIds, ...subCats.map(c => c._id)];
        }

        result = result.filter(p => {
          const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
          const pSubCatId = typeof p.subCategory === 'object' ? p.subCategory?._id : p.subCategory;
          return allowedIds.includes(pCatId) || allowedIds.includes(pSubCatId);
        });
      }
    }

    // 2. Search Query Filter
    if (searchQuery.trim() !== "") {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 3. Min Price Filter
    if (minPrice !== "") {
      result = result.filter(product => {
        const price = product.discountPrice || product.regularPrice;
        return price >= Number(minPrice);
      });
    }

    // 4. Max Price Filter
    if (maxPrice !== "") {
      result = result.filter(product => {
        const price = product.discountPrice || product.regularPrice;
        return price <= Number(maxPrice);
      });
    }

    // 5. Sorting Logic
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
        <span className="text-xs inter-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Shop...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-32 mb-24 inter-normal">
      
      {/* ---------------- PAGE HEADER ---------------- */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl inter-bold text-black uppercase tracking-[0.15em]">
          Shop All Products
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4 mb-3"></div>
        <p className="text-xs text-gray-500 inter-normal uppercase tracking-widest">
          Explore our complete collection of exclusive items
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* ================= LEFT SIDEBAR (Categories) ================= */}
        <div className="w-full lg:w-[260px] shrink-0">
          <div className="sticky top-28 bg-white border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm inter-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">
              Categories
            </h3>
            
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left text-xs inter-bold uppercase tracking-widest transition-colors cursor-pointer ${
                    selectedCategory === "all" ? 'text-red-600' : 'text-gray-800 hover:text-red-600'
                  }`}
                >
                  All Products
                </button>
              </li>

              {structuredCategories.map(mainCat => (
                <li key={mainCat._id} className="space-y-2">
                  <button 
                    onClick={() => setSelectedCategory(mainCat.slug)}
                    className={`w-full text-left text-xs inter-bold uppercase tracking-widest transition-colors cursor-pointer ${
                      selectedCategory === mainCat.slug ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                    }`}
                  >
                    {mainCat.name}
                  </button>
                  
                  {mainCat.subCats && mainCat.subCats.length > 0 && (
                    <ul className="pl-4 space-y-2 border-l-2 border-gray-100 my-2">
                      {mainCat.subCats.map(subCat => (
                        <li key={subCat._id}>
                          <button 
                            onClick={() => setSelectedCategory(subCat.slug)}
                            className={`w-full text-left text-[11px] inter-semibold uppercase tracking-wider transition-all cursor-pointer ${
                              selectedCategory === subCat.slug ? 'text-red-600 inter-bold' : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            {subCat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ================= RIGHT CONTENT (Filters & Products) ================= */}
        <div className="flex-1">
          
          {/* Top Filter Bar (Search, Price, Sort) */}
          <div className="bg-gray-50 border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            
            {/* Search Box */}
            <div className="w-full md:w-1/3 relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 text-xs inter-normal text-gray-700 py-3 px-4 focus:outline-none focus:border-black bg-white"
              />
            </div>

            {/* Price Filter */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min ৳" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 border border-gray-300 text-xs inter-normal text-gray-700 py-3 px-3 focus:outline-none focus:border-black bg-white text-center"
              />
              <span className="text-gray-400 inter-bold">-</span>
              <input 
                type="number" 
                placeholder="Max ৳" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 border border-gray-300 text-xs inter-normal text-gray-700 py-3 px-3 focus:outline-none focus:border-black bg-white text-center"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-3">
              <label className="text-[10px] inter-semibold text-gray-500 uppercase tracking-widest hidden lg:block">Sort By:</label>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full md:w-auto border border-gray-300 text-xs inter-semibold text-gray-900 uppercase tracking-wider py-3 px-4 focus:outline-none focus:border-black bg-white cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-xs inter-semibold text-gray-400 uppercase tracking-widest">
              Showing {filteredProducts.length} Products
            </p>
          </div>

          {/* ================= PRODUCT GRID ================= */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center border border-gray-200 bg-gray-50 flex flex-col items-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-lg inter-bold text-gray-800 uppercase tracking-widest mb-2">No Products Found</h3>
              <p className="text-sm inter-normal text-gray-500 max-w-md">Try adjusting your filters or search query to find what you are looking for.</p>
              <button 
                onClick={() => { setSelectedCategory("all"); setSearchQuery(""); setMinPrice(""); setMaxPrice(""); setSortOrder("default"); }}
                className="mt-6 bg-black text-white px-6 py-3 text-xs inter-bold uppercase tracking-widest hover:bg-red-600 transition-colors cursor-pointer"
              >
                Reset Filters
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

export default Shop;