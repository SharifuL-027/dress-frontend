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
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const mainCategories = categories.filter(cat => !cat.parent);

  const getSubCatImage = (name) => {
    const n = name.toLowerCase();
    if(n.includes('t-shirt') || n.includes('polo')) return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop";
    if(n.includes('pant') || n.includes('trouser') || n.includes('pajama')) return "https://images.unsplash.com/photo-1624378439575-d10c550f250f?q=80&w=800&auto=format&fit=crop";
    if(n.includes('kurti') || n.includes('tops')) return "https://images.unsplash.com/photo-1583391733959-b903e67c8052?q=80&w=800&auto=format&fit=crop";
    if(n.includes('cap') || n.includes('belt') || n.includes('wallet')) return "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop";
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
  };

  return (
    <div className="w-full flex flex-col gap-6 md:gap-10 pb-24">
      {mainCategories.map((mainCategory) => {
        
        // 1. Get exact 6 products to match Fabrilife's 5-column layout perfectly
        const categoryProducts = products.filter(product => 
          product.category?._id === mainCategory._id || product.category === mainCategory._id
        ).slice(0, 6); 

        // 2. Get Sub-categories
        const subCategories = categories.filter(cat => {
          const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent;
          return parentId === mainCategory._id;
        });

        const categoryBanner = banners.find(b => 
          b.category?._id === mainCategory._id || b.category === mainCategory._id
        );
        const mainImageUrl = categoryBanner?.image?.url || mainCategory.image?.url || getSubCatImage(mainCategory.name);

        if (categoryProducts.length === 0 && subCategories.length === 0) return null;

        return (
          <section key={mainCategory._id} className="max-w-[1500px] mx-auto w-full px-3 md:px-6">
            
            {/* ================= FABRILIFE LAYOUT 1: BIG BANNER + 6 PRODUCTS ================= */}
            {categoryProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-4">
                
                {/* BIG BANNER (Left Side - Spans 2 Cols, Strict Portrait Ratio) */}
                <div className="col-span-2 lg:col-span-2 row-span-1 md:row-span-2 aspect-[3/4] md:aspect-auto md:h-full">
                  <Link 
                    to={categoryBanner?.link || `/category/${mainCategory.slug}`} 
                    className="block w-full h-full relative overflow-hidden group"
                  >
                    <img 
                      src={mainImageUrl} 
                      alt={mainCategory.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-0 w-full text-center px-4">
                      <h3 className="text-white inter-bold text-xl md:text-3xl uppercase drop-shadow-md">
                        {categoryBanner?.title || mainCategory.name}
                      </h3>
                    </div>
                  </Link>
                </div>

                {/* 6 PRODUCT CARDS (Right Side) */}
                {categoryProducts.map((product) => (
                  <div key={product._id} className="col-span-1">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {/* ================= FABRILIFE LAYOUT 2: SUB-CATEGORY 3-COLUMN GRID ================= */}
            {subCategories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
                {subCategories.map((sub) => (
                  <Link 
                    key={sub._id}
                    to={`/category/${sub.slug}`}
                    className="group relative aspect-square overflow-hidden bg-gray-100"
                  >
                    <img 
                      src={sub.image?.url || sub.image || getSubCatImage(sub.name)} 
                      alt={sub.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Dark gradient for bold white text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Big Sub-category Name */}
                    <div className="absolute bottom-4 md:bottom-6 left-0 w-full text-center px-4">
                      <span className="text-white inter-bold text-sm md:text-xl lg:text-2xl tracking-wide drop-shadow-md">
                        {sub.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </section>
        );
      })}
    </div>
  );
};

export default DynamicCategories;