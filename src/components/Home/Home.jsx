import { useEffect } from "react";
import Hero from "../Hero";
import CategoryBentoGrid from "../product/CategoryBentoGrid";
import DynamicCategories from "../product/DynamicCategories";
import NewArrivals from "../product/NewArrivals";
import PromoModal from "../product/PromoModal";
import { FiTruck, FiRefreshCcw, FiHeadphones, FiShield } from "react-icons/fi"; // Fabrilife style icons

const Home = () => {
  // Page load holei ekdom top-e scroll hobe
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fabrilife style trust badges / features
  const features = [
    { icon: <FiTruck />, title: "Free Shipping", desc: "On orders over ৳2000" },
    { icon: <FiRefreshCcw />, title: "Easy Returns", desc: "7 Days return policy" },
    { icon: <FiShield />, title: "Secure Payment", desc: "100% secure checkout" },
    { icon: <FiHeadphones />, title: "24/7 Support", desc: "Dedicated support" },
  ];

  return (
    <div className="w-full bg-white font-sans overflow-hidden">
      
      {/* Promotional Modal */}
      <PromoModal />

      {/* 1. Hero Section (Slider) */}
      <Hero />

      {/* 2. Trust Badges / Features Bar (Fabrilife Style) */}
      <div className="border-b border-gray-100 bg-gray-50 py-4 hidden md:block">
        <div className="max-w-[1500px] mx-auto px-8">
          <div className="grid grid-cols-4 gap-4 divide-x divide-gray-200">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center justify-center gap-4 px-4 group cursor-pointer">
                <div className="text-gray-400 group-hover:text-red-600 transition-colors text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-[11px] inter-bold text-gray-900 uppercase tracking-widest">{feature.title}</h4>
                  <p className="text-[10px] text-gray-500 inter-medium mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. New Arrivals */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-12 md:mt-20">
        <NewArrivals />
      </div>

      {/* 4. Category Bento Grid (Fabrilife er promotional banner hisebe kaj korbe) */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-16 md:mt-24">
        <CategoryBentoGrid />
      </div>

      {/* 5. Dynamic Categories (Fabrilife Mixed Grid Layout) */}
      <div className="w-full mt-16 md:mt-24">
        <DynamicCategories />
      </div>

    </div>
  );
};

export default Home;