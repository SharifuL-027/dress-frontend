import { useState, useEffect } from "react";
import { Link } from "react-router"; 
import api from "../api/axios"; 

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ================= NEW: Dynamic Text Animation Logic =================
  const dynamicWords = ["Story", "Occasion", "Moment", "Season", "Journey"];
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setFade(false); 
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % dynamicWords.length);
        setFade(true); 
      }, 500); 
    }, 3000); 

    return () => clearInterval(wordInterval);
  }, []);
  // ====================================================================

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

  // অটোমেটিক স্লাইডার লজিক 
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
      <div className="w-full h-[60vh] md:h-[70vh] lg:h-[600px] bg-gray-50 flex items-center justify-center border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Loading Banner...
          </span>
        </div>
      </div>
    );
  }

  // ডিফল্ট স্ট্যাটিক ছবি 
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[75vh] md:h-[550px] lg:h-[600px] xl:h-[70vh] bg-gray-100">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dsrs8hryx/image/upload/v1791007439/Sunlit_South_Asian_Family_Portrait_skjr0z.png')" }}
        ></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[75vh] md:h-[550px] lg:h-[600px] xl:h-[70vh] bg-gray-100 overflow-hidden group">
      
      {/* ================= BANNERS ================= */}
      {banners.map((banner, index) => (
        <div 
          key={banner._id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* কালো ওভারলে (মোবাইলে একটু ডার্ক করা হয়েছে যেন টেক্সট ক্লিয়ার বোঝা যায়) */}
          <div className="absolute inset-0 bg-black/20 md:bg-black/10 z-10 pointer-events-none"></div>

          {banner.link ? (
            <Link to={banner.link} className="block w-full h-full">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-10000 ease-linear hover:scale-105"
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

      {/* ================= STYLISH TITLE & CTA BUTTON ================= */}
      {/* মোবাইলে টেক্সট সেন্টারড করা হয়েছে (left-1/2 -translate-x-1/2 text-center) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center md:text-left md:translate-x-0 md:bottom-20 md:left-12 lg:left-20 z-30 flex flex-col items-center md:items-start w-[90%] md:max-w-lg transition-all duration-700 transform translate-y-0 opacity-100">
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl inter-bold text-red-600 uppercase tracking-tight mb-3 drop-shadow-xl leading-tight">
          Style For <br className="hidden md:block" /> Every{' '}
          {/* অ্যানিমেটেড পরিবর্তনশীল শব্দ */}
          <span 
            className={`inline-block text-white md:text-gray-900 transition-all duration-500 ease-in-out transform ${
              fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {dynamicWords[wordIndex]}
          </span>
        </h2>
        
        <p className="text-white/90 md:text-gray-800 text-[11px] sm:text-xs inter-medium md:text-base mb-6 md:mb-8 drop-shadow-md max-w-[280px] md:max-w-none">
          Elevate your everyday look with our exclusive, handpicked collections.
        </p>
        
        {/* CTA Button */}
        <Link 
          to="/shop" 
          className="group bg-white text-gray-900 px-8 py-3.5 md:px-8 md:py-3.5 text-[11px] md:text-sm inter-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors duration-300 shadow-xl flex items-center gap-3 cursor-pointer"
        >
          Explore Collection
          <svg className="w-4 h-4 transition-transform duration-300 transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* ================= SLIDER INDICATORS (DOTS) ================= */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer shadow-sm ${
                index === currentIndex ? "w-8 md:w-10 bg-red-600" : "w-2 md:w-2.5 bg-white/70 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}

      {/* ================= NAVIGATION ARROWS (VISIBLE ON DESKTOP HOVER ONLY) ================= */}
      {/* মোবাইলে hidden করা হয়েছে কারণ টাচ স্ক্রিনে এর দরকার নেই এবং জায়গা নষ্ট করে */}
      {banners.length > 1 && (
        <div className="hidden md:block">
          <button 
            onClick={() => setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)}
            className="absolute right-24 bottom-20 bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 w-12 h-12 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer transform translate-y-4 group-hover:translate-y-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)}
            className="absolute right-8 bottom-20 bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 w-12 h-12 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer transform translate-y-4 group-hover:translate-y-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
};

export default Hero;