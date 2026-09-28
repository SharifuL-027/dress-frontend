import { useState, useEffect } from "react";
import { Link } from "react-router"; 
import api from "../api/axios"; // আপনার api ফোল্ডারের পাথ অনুযায়ী ঠিক করে নেবেন

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ব্যাকএন্ড থেকে শুধুমাত্র Hero ব্যানার ফেচ করা
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const { data } = await api.get('/api/banners?type=Hero');
        setBanners(data);
      } catch (error) {
        console.error("Error fetching hero banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroBanners();
  }, []);

  // অটোমেটিক স্লাইডার লজিক (৫ সেকেন্ড পর পর ছবি চেঞ্জ হবে)
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);

  // লোডিং স্টেট
  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-[11px] inter-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  // যদি অ্যাডমিন প্যানেলে কোনো ব্যানার না থাকে, তবে ডিফল্ট আপনার আগের স্ট্যাটিক ছবিটি দেখাবে
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gray-100">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden group">
      
      {/* ================= BANNERS ================= */}
      {banners.map((banner, index) => (
        <div 
          key={banner._id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {banner.link ? (
            <Link to={banner.link} className="block w-full h-full">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${banner.image.url}')` }}
              ></div>
            </Link>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${banner.image.url}')` }}
            ></div>
          )}
        </div>
      ))}

      {/* ================= SLIDER INDICATORS (DOTS) ================= */}
      {banners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "w-12 bg-red-600" : "w-6 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}

      {/* ================= NAVIGATION ARROWS (VISIBLE ON HOVER) ================= */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={() => setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/80 text-white hover:text-black p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/80 text-white hover:text-black p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

    </div>
  );
};

export default Hero;