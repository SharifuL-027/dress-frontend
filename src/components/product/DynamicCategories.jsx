import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios"; 
import ProductCard from "../product/ProductCard"; // Update path if needed

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

  // Updated with new category keywords (Winter, Ethnic, Innerwear etc.)
  const getSubCatImage = (name) => {
    const n = name.toLowerCase();
    if(n.includes('t-shirt') || n.includes('polo') || n.includes('shirt') || n.includes('top')) return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop";
    if(n.includes('pant') || n.includes('trouser') || n.includes('jeans') || n.includes('short') || n.includes('bottom') || n.includes('legging')) return "https://images.unsplash.com/photo-1624378439575-d10c550f250f?q=80&w=800&auto=format&fit=crop";
    if(n.includes('winter') || n.includes('hoodie') || n.includes('jacket') || n.includes('sweater') || n.includes('sweatshirt')) return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop";
    if(n.includes('ethnic') || n.includes('panjabi') || n.includes('kurti') || n.includes('pajama')) return "https://images.unsplash.com/photo-1583391733959-b903e67c8052?q=80&w=800&auto=format&fit=crop";
    if(n.includes('innerwear') || n.includes('nightwear') || n.includes('undergarment')) return "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800&auto=format&fit=crop";
    if(n.includes('boy') || n.includes('girl') || n.includes('kid')) return "https://images.unsplash.com/photo-1519238263530-99abca9665ae?q=80&w=800&auto=format&fit=crop";
    
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop";
  };

  // Helper to find all sub and sub-sub categories for a main category
  const getDescendantIds = (parentId) => {
    let ids = [];
    const children = categories.filter(c => {
       const pId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
       return pId === parentId;
    });
    children.forEach(child => {
       ids.push(child._id);
       ids = [...ids, ...getDescendantIds(child._id)];
    });
    return ids;
  };

  return (
    <div className="w-full flex flex-col gap-6 md:gap-10 pb-24">
      {mainCategories.map((mainCategory) => {
        
        // 1. 3-Level Robust Product Filtering
        const allowedCategoryIds = [mainCategory._id, ...getDescendantIds(mainCategory._id)];
        
        const categoryProducts = products.filter(product => {
          const pCatId = typeof product.category === 'object' ? product.category?._id : product.category;
          const pSubCatId = typeof product.subCategory === 'object' ? product.subCategory?._id : product.subCategory;
          const pSubSubCatId = typeof product.subSubCategory === 'object' ? product.subSubCategory?._id : product.subSubCategory;
          
          return allowedCategoryIds.includes(pCatId) || allowedCategoryIds.includes(pSubCatId) || allowedCategoryIds.includes(pSubSubCatId);
        }).slice(0, 6); // Keep exactly 6 for layout

        // 2. Get ONLY Sub-categories (Level 2) for the visual grid
        const subCategories = categories.filter(cat => {
          const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent;
          return parentId === mainCategory._id;
        });

        // 3. Setup Banner
        const categoryBanner = banners.find(b => 
          b.category?._id === mainCategory._id || b.category === mainCategory._id
        );
        const mainImageUrl = categoryBanner?.image?.url || mainCategory.image?.url || getSubCatImage(mainCategory.name);

        // Hide section if no products AND no sub-categories
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
                    className="block w-full h-full relative overflow-hidden group rounded-sm shadow-sm"
                  >
                    <img 
                      src={mainImageUrl} 
                      alt={mainCategory.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-0 w-full text-center px-4">
                      <h3 className="text-white inter-bold text-2xl md:text-4xl uppercase tracking-wide drop-shadow-lg">
                        {categoryBanner?.title || mainCategory.name}
                      </h3>
                      <span className="inline-block mt-3 text-[10px] md:text-xs inter-bold text-white uppercase tracking-widest border border-white px-4 py-1.5 hover:bg-white hover:text-black transition-colors">
                        Explore All
                      </span>
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
                    className="group relative aspect-square overflow-hidden bg-gray-100 rounded-sm shadow-sm"
                  >
                    <img 
                      src={sub.image?.url || sub.image || getSubCatImage(sub.name)} 
                      alt={sub.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Dark gradient for bold white text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Sub-category Name */}
                    <div className="absolute bottom-4 md:bottom-6 left-0 w-full text-center px-4">
                      <span className="text-white inter-bold text-sm md:text-xl lg:text-2xl uppercase tracking-wide drop-shadow-md">
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