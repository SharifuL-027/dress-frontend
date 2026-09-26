import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import api from "../../api/axios"; 
import ProductCard from "../product/ProductCard"; 

const CategoryPage = () => {
  const { slug } = useParams(); // URL থেকে বর্তমান ক্যাটাগরির slug
  
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

  // ১. ডেটা ফেচ এবং সাইডবার স্ট্রাকচার তৈরি করা
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

        // সাইডবারের জন্য ট্রি-স্ট্রাকচার (Main -> Sub) তৈরি করা
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

  // ২. ফিল্টারিং এবং সর্টিং লজিক (যখনই URL, Search, Price বা Sort চেঞ্জ হবে)
  useEffect(() => {
    if (allCategories.length === 0 || allProducts.length === 0) return;

    let result = [...allProducts];

    // ক) URL Slug অনুযায়ী ক্যাটাগরি ফিল্টার করা
    const activeCat = allCategories.find(c => c.slug === slug);
    setCurrentCategory(activeCat || null);

    if (activeCat) {
      const isMainCategory = !activeCat.parent;
      let allowedCategoryIds = [activeCat._id];
      
      // যদি মেইন ক্যাটাগরি হয়, তাহলে তার সব সাব-ক্যাটাগরির প্রোডাক্টও দেখাবে
      if (isMainCategory) {
        const subCats = allCategories.filter(c => {
          const parentId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
          return parentId === activeCat._id;
        });
        allowedCategoryIds = [...allowedCategoryIds, ...subCats.map(c => c._id)];
      }

      result = result.filter(product => {
        const pCatId = typeof product.category === 'object' ? product.category?._id : product.category;
        return allowedCategoryIds.includes(pCatId);
      });
    }

    // খ) নাম দিয়ে সার্চ ফিল্টার
    if (searchQuery.trim() !== "") {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // গ) প্রাইস ফিল্টার (Min / Max)
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

    // ঘ) সর্টিং লজিক
    if (sortOrder === "price-low") {
      result.sort((a, b) => (a.discountPrice || a.regularPrice) - (b.discountPrice || b.regularPrice));
    } else if (sortOrder === "price-high") {
      result.sort((a, b) => (b.discountPrice || b.regularPrice) - (a.discountPrice || a.regularPrice));
    }

    setFilteredProducts(result);
  }, [slug, allCategories, allProducts, searchQuery, minPrice, maxPrice, sortOrder]);


  if (loading) return <div className="h-screen flex justify-center items-center font-bold text-gray-500 uppercase tracking-widest">Loading Store...</div>;

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-24 mb-20 font-sans">
      
      {/* ---------------- BREADCRUMB ---------------- */}
      <div className="mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Shop</span>
        <span>/</span>
        <span className="text-gray-900">{currentCategory ? currentCategory.name : 'All Products'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        
        {/* ---------------- LEFT SIDEBAR (All Categories Tree) ---------------- */}
        <div className="w-full lg:w-[260px] shrink-0">
          <div className="sticky top-28 bg-white border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-200 pb-3">
              Categories
            </h3>
            
            <div className="space-y-6">
              {structuredCategories.map(mainCat => {
                const isActiveMain = slug === mainCat.slug;
                
                return (
                  <div key={mainCat._id}>
                    {/* Main Category Link */}
                    <Link 
                      to={`/category/${mainCat.slug}`} 
                      className={`block text-xs font-extrabold uppercase tracking-widest mb-3 transition-colors ${
                        isActiveMain ? 'text-red-600' : 'text-gray-900 hover:text-red-600'
                      }`}
                    >
                      {mainCat.name}
                    </Link>
                    
                    {/* Sub Categories List */}
                    {mainCat.subCats && mainCat.subCats.length > 0 && (
                      <ul className="pl-4 space-y-3 border-l-2 border-gray-100">
                        {mainCat.subCats.map(subCat => {
                          const isActiveSub = slug === subCat.slug;
                          return (
                            <li key={subCat._id}>
                              <Link 
                                to={`/category/${subCat.slug}`} 
                                className={`block text-[11px] font-bold uppercase tracking-wider transition-all relative ${
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
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
              {currentCategory ? currentCategory.name : 'Shop Collection'}
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
              Showing {filteredProducts.length} Results
            </p>
          </div>

          {/* ---------------- ADVANCED FILTER BAR ---------------- */}
          <div className="bg-gray-50 border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            
            {/* Search Box */}
            <div className="w-full md:w-1/3 relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 text-xs font-bold text-gray-700 py-3 px-4 focus:outline-none focus:border-gray-900 bg-white"
              />
            </div>

            {/* Price Filter */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min ৳" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 border border-gray-300 text-xs font-bold text-gray-700 py-3 px-3 focus:outline-none focus:border-gray-900 bg-white text-center"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="number" 
                placeholder="Max ৳" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 border border-gray-300 text-xs font-bold text-gray-700 py-3 px-3 focus:outline-none focus:border-gray-900 bg-white text-center"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden lg:block">Sort By:</label>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full md:w-auto border border-gray-300 text-xs font-bold text-gray-900 uppercase tracking-wider py-3 px-4 focus:outline-none focus:border-gray-900 bg-white cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* ---------------- PRODUCT GRID ---------------- */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center border border-gray-200 bg-gray-50 flex flex-col items-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">No Products Found</h3>
              <p className="text-sm text-gray-500 max-w-md">Try adjusting your search query, price range, or category filter to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(""); setMinPrice(""); setMaxPrice(""); }}
                className="mt-6 bg-gray-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
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