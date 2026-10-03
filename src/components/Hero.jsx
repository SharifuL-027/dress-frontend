import { useState, useEffect } from "react";
import { Link } from "react-router"; 
import api from "../api/axios"; 

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

  // লোডিং স্টেট (Premium minimalist loading)
  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-50 flex items-center justify-center border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Loading Banner...
          </span>
        </div>
      </div>
    );
  }

  // যদি অ্যাডমিন প্যানেলে কোনো ব্যানার না থাকে, তবে ডিফল্ট স্ট্যাটিক ছবিটি দেখাবে
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] xl:h-[70vh] bg-gray-100">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
      </div>
    );
  }

  return (
    // Height adjusted to be responsive and fit perfectly under the sticky navbar
    <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] xl:h-[70vh] bg-gray-100 overflow-hidden group">
      
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
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear hover:scale-105"
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
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-500 cursor-pointer shadow-sm ${
                index === currentIndex ? "w-10 bg-red-600" : "w-2.5 bg-white/70 hover:bg-white"
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
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer transform -translate-x-4 group-hover:translate-x-0"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer transform translate-x-4 group-hover:translate-x-0"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

    </div>
  );
};

export default Hero;