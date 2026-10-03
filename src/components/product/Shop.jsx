import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router"; 
import api from "../../api/axios"; 
import ProductCard from "../product/ProductCard";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || ""; 

  // States
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/categories")
        ]);

        const productsData = productRes.data.products || productRes.data;
        setAllProducts(productsData);
        setCategories(categoryRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching shop data:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ফিল্টারিং এবং সর্টিং লজিক (যখনই সার্চ, ক্যাটাগরি বা সর্ট চেঞ্জ হবে)
  useEffect(() => {
    let result = [...allProducts];

    // ১. Search Filter
    if (searchQuery) {
      result = result.filter((product) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // ২. Category Filter (বাম পাশের সাইডবার থেকে)
    if (selectedCategory !== "All") {
      result = result.filter(product => {
        // ক্যাটাগরি অবজেক্ট বা আইডি যাই হোক না কেন সেভাবে চেক করবে
        const catId = typeof product.category === 'object' ? product.category?._id : product.category;
        const catName = typeof product.category === 'object' ? product.category?.name : null;
        
        return catId === selectedCategory || catName === selectedCategory;
      });
    }

    // ৩. Sorting Logic (উপরের টপ বার থেকে)
    if (sortOrder === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setDisplayProducts(result);
  }, [allProducts, searchQuery, selectedCategory, sortOrder]);


  // ক্লিয়ার সার্চ ফাংশন
  const clearSearch = () => {
    searchParams.delete("search");
    setSearchParams(searchParams);
    setSelectedCategory("All");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-36 pb-20 min-h-screen">
      
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-widest">
          {searchQuery ? "Search Results" : "Shop All Products"}
        </h1>
        {searchQuery && (
          <p className="text-gray-500 text-sm mt-2">
            Showing results for: <span className="font-bold text-red-600">"{searchQuery}"</span>
            <button onClick={clearSearch} className="ml-4 text-xs underline hover:text-red-600">Clear Search</button>
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* ================= LEFT SIDEBAR (Filters) ================= */}
        <aside className="w-full lg:w-[250px] shrink-0">
          <div className="sticky top-40">
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-900">
              Categories
            </h2>
            
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setSelectedCategory("All")}
                  className={`text-[13px] uppercase tracking-wide transition-colors ${selectedCategory === "All" ? "text-red-600 font-bold" : "text-gray-600 hover:text-red-600"}`}
                >
                  All Products
                </button>
              </li>
              
              {!loading && categories.map((cat) => (
                <li key={cat._id}>
                  <button 
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`text-[13px] uppercase tracking-wide transition-colors text-left ${selectedCategory === cat._id ? "text-red-600 font-bold" : "text-gray-600 hover:text-red-600"}`}
                  >
                    {cat.name}
                  </button>
                  
                  {/* Subcategories (If any) */}
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <ul className="pl-4 mt-2 space-y-2 border-l border-gray-200 ml-2">
                      {cat.subCategories.map(sub => (
                        <li key={sub._id}>
                          <button 
                            onClick={() => setSelectedCategory(sub._id)}
                            className={`text-[11px] uppercase transition-colors ${selectedCategory === sub._id ? "text-red-600 font-bold" : "text-gray-500 hover:text-red-600"}`}
                          >
                            - {sub.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <main className="flex-1">
          
          {/* Top Filtering / Sorting Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 mb-6 rounded-sm border border-gray-100">
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-4 sm:mb-0">
              Showing <span className="text-gray-900">{displayProducts.length}</span> Products
            </p>
            
            <div className="flex items-center space-x-3">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Sort By:</label>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 text-[12px] py-1.5 px-3 rounded-sm focus:outline-none focus:border-gray-900 bg-white"
              >
                <option value="default">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading / Error / Empty States */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-20 bg-red-50 rounded-lg font-medium">
              {error}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 border border-gray-100 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-500 mb-6 text-sm">Try adjusting your filters or search keywords.</p>
              <button 
                onClick={clearSearch} 
                className="bg-gray-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            
            /* Product Grid (Global ProductCard component use kora hoyeche) */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;