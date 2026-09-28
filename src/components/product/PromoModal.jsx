import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios"; 

const PromoModal = () => {
  const [promoBanner, setPromoBanner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // আগে চেক করবো ইউজার এই সেশনে (বা আজকে) ব্যানারটি কেটে দিয়েছে কি না
    const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");
    
    if (!hasSeenPromo) {
      const fetchPromoBanner = async () => {
        try {
          const { data } = await api.get('/api/banners?type=Promo');
          // যদি প্রোমো ব্যানার থাকে, তবে প্রথমটি সেট করবো
          if (data && data.length > 0) {
            setPromoBanner(data[0]);
            
            // একটু ডিলে (Delay) দিয়ে মডালটি ওপেন করবো যাতে পেজ লোড হওয়ার একটু পর আসে
            setTimeout(() => {
              setIsOpen(true);
            }, 1500); 
          }
        } catch (error) {
          console.error("Failed to fetch promo banner:", error);
        }
      };
      fetchPromoBanner();
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    // ইউজার একবার কেটে দিলে এই সেশনে আর দেখাবে না (Tab ক্লোজ না করা পর্যন্ত)
    // আপনি চাইলে localStorage ব্যবহার করে ২৪ ঘণ্টার লজিকও দিতে পারেন
    sessionStorage.setItem("hasSeenPromo", "true");
  };

  // যদি ব্যানার না থাকে বা মডাল ক্লোজ থাকে, তবে কিছু দেখাবে না
  if (!promoBanner || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* Background Overlay (ব্লার এবং ডার্ক) */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeModal}
      ></div>

      {/* Modal Content (উপর থেকে নিচে স্লাইড করে আসবে) */}
      <div 
        className={`relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden transform transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "-translate-y-full opacity-0 scale-90"
        }`}
      >
        
        {/* Close Button */}
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-800 hover:text-red-600 transition-colors z-10 shadow-sm cursor-pointer"
        >
          <span className="inter-bold text-xl leading-none">&times;</span>
        </button>

        {/* Banner Image */}
        {promoBanner.link ? (
          <Link to={promoBanner.link} onClick={closeModal} className="block w-full">
            <img 
              src={promoBanner.image.url} 
              alt={promoBanner.title || "Special Offer"} 
              className="w-full h-auto max-h-[70vh] object-cover hover:scale-105 transition-transform duration-700"
            />
          </Link>
        ) : (
          <img 
            src={promoBanner.image.url} 
            alt={promoBanner.title || "Special Offer"} 
            className="w-full h-auto max-h-[70vh] object-cover"
          />
        )}
        
      </div>
    </div>
  );
};

export default PromoModal;