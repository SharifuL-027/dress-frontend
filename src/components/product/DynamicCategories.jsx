import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios"; 
import ProductCard from "./ProductCard"; 

const DynamicCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, bannerRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products'),
          api.get('/api/banners?type=Category') 
        ]);
        
        // ===============================================
        // Categories Sorting (Smart Logic for Home Page)
        // ===============================================
        const fetchedCategories = catRes.data;
        const sortedCategories = fetchedCategories.sort((a, b) => {
          const orderA = a.sortOrder || 0;
          const orderB = b.sortOrder || 0;
          
          if (orderA > 0 && orderB > 0) return orderA - orderB;
          if (orderA > 0 && orderB === 0) return -1;
          if (orderB > 0 && orderA === 0) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setCategories(sortedCategories);
        setProducts(prodRes.data.products || prodRes.data);
        setBanners(bannerRes.data);

      } catch (error) {
        console.error("Failed to load category products and banners", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400 inter-bold uppercase tracking-widest animate-pulse">
        Loading Categories...
      </div>
    );
  }

  // মেইন ক্যাটাগরিগুলো ফিল্টার করা
  const mainCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 space-y-24 mb-24 mt-20 inter-regular">
      {mainCategories.map(category => {
        
        const categoryProducts = products.filter(product => 
          product.category?._id === category._id || product.category === category._id
        ).slice(0, 10); 

        if (categoryProducts.length === 0) return null;

        // এই ক্যাটাগরির জন্য ব্যানার খোঁজা
        const categoryBanner = banners.find(b => 
          b.category?._id === category._id || b.category === category._id
        );

        return (
          <section key={category._id} className="relative">
            
            {/* ================= SECTION TITLE ================= */}
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-2xl md:text-3xl inter-bold text-gray-900 tracking-tight uppercase">
                  {category.name}
                </h2>
                <div className="h-1 w-16 bg-red-600 mt-2 rounded-full"></div>
              </div>
              <Link 
                to={`/category/${category.slug}`} 
                className="text-xs md:text-sm inter-bold text-gray-500 hover:text-red-600 uppercase tracking-wider transition-colors hidden sm:block"
              >
                View All &rarr;
              </Link>
            </div>
            
            {/* ================= PRODUCT GRID (WITH EMBEDDED BANNER) ================= */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
              
              {/* ব্যানার থাকলে সেটি গ্রিডের প্রথম আইটেম হিসেবে ২ কলাম ও ২ রো এর জায়গা নেবে */}
              {categoryBanner && (
                <Link 
                  to={categoryBanner.link || `/category/${category.slug}`} 
                  className="col-span-2 row-span-2 block w-full h-full relative overflow-hidden group rounded-xl bg-gray-50"
                >
                  <img 
                    src={categoryBanner.image.url} 
                    alt={categoryBanner.title || category.name} 
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle Dark Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                  
                  {/* Option: ব্যানারের ওপর হালকা টেক্সট দেখাতে চাইলে নিচের কোডটি রাখতে পারেন */}
                  <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 hidden md:block">
                    <span className="bg-white text-black px-4 py-2 text-[11px] inter-bold uppercase tracking-widest shadow-md">
                      Shop {category.name} Collection
                    </span>
                  </div>
                </Link>
              )}

              {/* বাকি প্রোডাক্টগুলো */}
              {categoryProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Mobile View All Button */}
            <div className="mt-6 text-center sm:hidden">
              <Link 
                to={`/category/${category.slug}`} 
                className="inline-block px-6 py-3 border border-gray-300 text-xs inter-bold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 uppercase tracking-widest transition-all"
              >
                View All {category.name}
              </Link>
            </div>

          </section>
        );
      })}
    </div>
  );
};

export default DynamicCategories;