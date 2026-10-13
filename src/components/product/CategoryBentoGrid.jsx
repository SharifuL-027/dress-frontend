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
        // শুধুমাত্র প্রথম ৩টি মেইন ক্যাটাগরি নেওয়া হলো Fabrilife লেআউটের জন্য
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

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );
  
  if (categories.length === 0) return null;

  // Fabrilife স্টাইল গ্রিড ক্লাস: বামে ১টি বড় (Men), ডানে ২টি ছোট (Women, Kids)
  const gridClasses = [
    "md:col-span-1 md:row-span-2", // ১ নম্বর আইটেম (বামের ফুল হাইট)
    "md:col-span-1 md:row-span-1", // ২ নম্বর আইটেম (ডানের উপরের অংশ)
    "md:col-span-1 md:row-span-1"  // ৩ নম্বর আইটেম (ডানের নিচের অংশ)
  ];

  // স্মার্ট ইমেজ ম্যাচার (ডাটাবেসে ছবি না থাকলে নামের সাথে ম্যাচ করে ছবি বসাবে)
  const getFallbackImage = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('women') || name.includes('girl')) return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop"; 
    if (name.includes('men') || name.includes('boy')) return "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop"; 
    if (name.includes('kid') || name.includes('baby')) return "https://images.unsplash.com/photo-1519238263530-99abad674e40?q=80&w=800&auto=format&fit=crop"; 
    return "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"; 
  };

  return (
    <div className="w-full mb-16 md:mb-24">
      
      {/* ================= SECTION TITLE ================= */}
      <div className="flex flex-col items-center mb-8 md:mb-12 text-center">
        <h2 className="text-xl md:text-3xl inter-bold text-gray-900 uppercase tracking-[0.2em] relative inline-block">
          Shop By Category
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-red-600 rounded-full hidden md:block"></div>
        </h2>
      </div>

      {/* ================= 3-ITEM FLAGSHIP GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4 h-[600px] md:h-[500px] lg:h-[600px]">
        
        {categories.map((category, index) => {
          const layoutClass = gridClasses[index] || "md:col-span-1 md:row-span-1";
          const imageUrl = category.image?.url || category.image || getFallbackImage(category.name);

          return (
            <Link 
              key={category._id} 
              to={`/category/${category.slug}`} 
              className={`group relative overflow-hidden bg-gray-100 rounded-sm w-full h-full block ${layoutClass}`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              ></div>
              
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500"></div>
              
              {/* Text Area (Centered) */}
              <div className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center">
                <h3 className="text-white inter-bold text-3xl md:text-4xl lg:text-5xl uppercase tracking-[0.2em] drop-shadow-lg transform transition-transform duration-500 group-hover:-translate-y-2">
                  {category.name}
                </h3>
              </div>
            </Link>
          );
        })}
        
      </div>
    </div>
  );
};

export default CategoryBentoGrid;