import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios"; // আপনার axios এর সঠিক পাথ দিন
import ProductCard from "./ProductCard"; 

const DynamicCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/products')
        ]);
        setCategories(catRes.data);
        
        // ব্যাকএন্ডের রেসপন্স অনুযায়ী প্রোডাক্ট সেট করা
        setProducts(prodRes.data.products || prodRes.data);
      } catch (error) {
        console.error("Failed to load category products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest">Loading Categories...</div>;

  // শুধুমাত্র Main Categories গুলো আলাদা করা
  const mainCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="max-w-[1500px] mx-auto px-6 lg:px-10 space-y-20 mb-20 mt-20">
      {mainCategories.map(category => {
        // এই নির্দিষ্ট ক্যাটাগরির প্রোডাক্টগুলো ফিল্টার করে আনা (সর্বোচ্চ ১০টি বা ২ লাইন)
        const categoryProducts = products.filter(product => 
          product.category?._id === category._id || product.category === category._id
        ).slice(0, 10); 

        // প্রোডাক্ট না থাকলে সেকশন দেখাবে না
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category._id}>
            
            {/* Section Title (New Arrivals এর ডিজাইনের সাথে মিল রেখে) */}
            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-2">
              <div>
                <h2 className="text-3xl ubuntu-bold text-gray-700 tracking-tight uppercase">
                  {category.name}
                </h2>
                <div className="h-1 w-16 bg-red-500 mt-2 rounded-full"></div>
              </div>
              <Link to={`/category/${category.slug}`} className="text-sm font-bold text-gray-500 hover:text-red-500 uppercase tracking-wider transition-colors hidden sm:block">
                View All →
              </Link>
            </div>
            
            {/* Asol Global Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {categoryProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
          </section>
        );
      })}
    </div>
  );
};

export default DynamicCategories;