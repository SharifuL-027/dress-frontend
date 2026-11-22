import { useState, useEffect } from "react";
import { Link } from "react-router"; 
import api from "../api/axios"; 

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ================= Dynamic Fallback Word Animation =================
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
  // ===================================================================

  // ব্যাকএন্ড থেকে শুধুমাত্র Hero ব্যানার ফেচ করা
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const { data } = await api.get('/banners?type=Hero');
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
      <div className="w-full h-[50vh] md:h-[600px] bg-gray-50 flex items-center justify-center border-b border-gray-100">
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
      <div className="relative w-full aspect-4/3 sm:aspect-video md:h-137.5 lg:h-150 bg-gray-100">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-top sm:bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dsrs8hryx/image/upload/v1791007439/Sunlit_South_Asian_Family_Portrait_skjr0z.png')" }}
        ></div>
      </div>
    );
  }

  // বর্তমান স্লাইডের ডাইনামিক ডেটা বের করা
  const activeBanner = banners[currentIndex] || {};
  const dynamicTitle = activeBanner.title?.trim();
  const dynamicDescription = (activeBanner.subtitle || activeBanner.description)?.trim();
  const dynamicButtonText = activeBanner.buttonText?.trim() || "Explore Collection";
  const dynamicLink = activeBanner.link?.trim() || "/shop";

  return (
    <div className="relative w-full aspect-4/3 sm:aspect-video md:h-137.5 lg:h-150 xl:h-[70vh] bg-gray-100 overflow-hidden group">
      
      {/* ================= BANNERS ================= */}
   {/* ================= BANNERS ================= */}
      {banners.map((banner, index) => (
        <div 
          key={banner._id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* প্রিমিয়াম বাম-থেকে-ডানে গ্রেডিয়েন্ট ওভারলে (ছবি উজ্জ্বল রেখে টেক্সট ফুটিয়ে তুলবে) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/35 md:to-transparent z-10 pointer-events-none"></div>

          {banner.link ? (
            <Link to={banner.link} className="block w-full h-full">
              <div 
                className="w-full h-full bg-cover bg-center md:bg-top bg-no-repeat transition-transform duration-10000 ease-linear scale-100 group-hover:scale-105"
                style={{ backgroundImage: `url('${banner.image.url}')` }}
              ></div>
            </Link>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center md:bg-top bg-no-repeat"
              style={{ backgroundImage: `url('${banner.image.url}')` }}
            ></div>
          )}
        </div>
      ))}

      {/* ================= STYLISH EDITORIAL TITLE, DESCRIPTION & CTA ================= */}
      <div 
        key={activeBanner._id || currentIndex}
        className="absolute bottom-10 sm:bottom-14 md:bottom-20 left-5 sm:left-8 md:left-14 lg:left-20 z-30 flex flex-col items-start w-[90%] sm:max-w-lg md:max-w-2xl"
      >
        {/* Top Luxury Brand Tag / Eyebrow */}
        <div className="flex items-center gap-2.5 mb-2.5 md:mb-4">
          <span className="w-6 md:w-10 h-[2px] bg-red-600 inline-block"></span>
          <span className="text-[9px] sm:text-[10px] md:text-xs inter-bold uppercase tracking-[0.28em] text-red-400 drop-shadow">
            DressTown Exclusive
          </span>
        </div>

        {/* Dynamic Title (শেষ শব্দটি লাল হাইলাইটসহ প্রিমিয়াম লুক) */}
        {dynamicTitle ? (
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl inter-bold text-white uppercase tracking-tight mb-3 md:mb-4 leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            {(() => {
              const words = dynamicTitle.split(" ");
              if (words.length <= 1) return dynamicTitle;
              const lastWord = words.pop();
              return (
                <>
                  {words.join(" ")}{" "}
                  <span className="text-red-500">{lastWord}</span>
                </>
              );
            })()}
          </h2>
        ) : (
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl inter-bold text-white uppercase tracking-tight mb-3 md:mb-4 leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            Style For <br className="hidden sm:block" /> Every{" "}
            <span 
              className={`inline-block text-red-500 transition-all duration-500 ease-in-out transform ${
                fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              {dynamicWords[wordIndex]}
            </span>
          </h2>
        )}
        
        {/* Stylish Left-Border Editorial Description */}
        <p className="border-l-2 border-red-600 pl-3 md:pl-4 text-gray-100 text-[11px] sm:text-xs md:text-base inter-medium mb-5 md:mb-8 max-w-[290px] sm:max-w-md md:max-w-lg leading-relaxed drop-shadow">
          {dynamicDescription || "Elevate your everyday look with our exclusive, handpicked collections."}
        </p>
        
        {/* Luxury Animated CTA Button */}
        <Link 
          to={dynamicLink} 
          className="group relative overflow-hidden bg-white text-gray-950 px-6 py-3 md:px-9 md:py-4 text-[10px] sm:text-[11px] md:text-xs inter-bold uppercase tracking-[0.2em] hover:text-white transition-colors duration-300 shadow-[0_10px_25px_rgba(0,0,0,0.4)] flex items-center gap-3 cursor-pointer"
        >
          {/* Hover Red Fill Layer */}
          <span className="absolute inset-0 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full z-0"></span>
          
          <span className="relative z-10">{dynamicButtonText}</span>
          <svg className="relative z-10 w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* ================= SLIDER INDICATORS (DOTS) ================= */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 md:h-1.5 rounded-full transition-all duration-500 cursor-pointer shadow-sm ${
                index === currentIndex ? "w-6 md:w-10 bg-red-600" : "w-1.5 md:w-2.5 bg-white/70 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}

      {/* ================= NAVIGATION ARROWS (VISIBLE ON DESKTOP HOVER ONLY) ================= */}
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