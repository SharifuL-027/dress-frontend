import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios";

const CategoryBentoGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        // শুধুমাত্র প্রথম ৩টি মেইন ক্যাটাগরি নেওয়া হলো
        const mainCats = data.filter(cat => !cat.parent).slice(0, 3);
        setCategories(mainCats);
      } catch (error) {
        console.error("Failed to load categories for grid", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400 inter-bold uppercase">Loading Categories...</div>;
  if (categories.length === 0) return null;

  // ৩টি আইটেমের জন্য স্পেশাল ফ্ল্যাগশিপ লেআউট
  const gridClasses = [
    "md:col-span-1 md:row-span-2", // ১ নম্বর আইটেম (বাম দিকের ফুল হাইট)
    "md:col-span-1 md:row-span-1", // ২ নম্বর আইটেম (ডান দিকের উপরের অর্ধেক)
    "md:col-span-1 md:row-span-1"  // ৩ নম্বর আইটেম (ডান দিকের নিচের অর্ধেক)
  ];

  // স্মার্ট ইমেজ ম্যাচার (ডাটাবেসে ছবি না থাকলে নামের সাথে ম্যাচ করে ছবি বসাবে)
  const getFallbackImage = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('women') || name.includes('girl')) return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop"; 
    if (name.includes('men') || name.includes('boy')) return "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"; 
    if (name.includes('kid') || name.includes('baby')) return "https://flow-content.google/image/fd0395a4-af13-4e52-8624-d3c534256058?Expires=1790614801&KeyName=labs-flow-prod-cdn-key&Signature=0AbI4LYebG7yYMPQYWXxZxZ9NGI"; 
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"; 
  };

  return (
    <section className="max-w-[1500px] mx-auto px-4 md:px-8 py-16">
      
      {/* ================= SECTION TITLE ================= */}
      <div className="flex flex-col items-center mb-10 text-center">
        <h2 className="text-2xl md:text-3xl inter-bold text-gray-900 uppercase tracking-[0.15em]">
          Shop By Category
        </h2>
        <div className="h-1 w-16 bg-red-600 mt-4 rounded-full"></div>
      </div>

      {/* ================= 3-ITEM FLAGSHIP GRID ================= */}
      {/* Desktop: 2 Columns, 2 Rows. Mobile: 1 Column (Stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4 h-[900px] md:h-[650px] lg:h-[750px]">
        
        {categories.map((category, index) => {
          const layoutClass = gridClasses[index] || "md:col-span-1 md:row-span-1";
          const imageUrl = category.image?.url || getFallbackImage(category.name);

          return (
            <Link 
              key={category._id} 
              to={`/category/${category.slug}`} 
              className={`group relative overflow-hidden bg-gray-100 rounded-sm w-full h-full ${layoutClass}`}
            >
              {/* Background Image */}
              <img 
                src={imageUrl} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
              />
              
              {/* Premium Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              
              {/* Text & Button Area (Centered for 3-item layout) */}
              <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                <h3 className="text-white inter-bold text-2xl md:text-3xl lg:text-4xl uppercase tracking-[0.2em] transform translate-y-4 group-hover:-translate-y-2 transition-transform duration-500">
                  {category.name}
                </h3>
                
                {/* Reveal 'Explore' Button on hover */}
                <span className="text-white bg-red-600 px-6 py-3 mt-2 inter-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                  Explore Collection
                </span>
              </div>
            </Link>
          );
        })}
        
      </div>
    </section>
  );
};

export default CategoryBentoGrid;