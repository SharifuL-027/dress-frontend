import { useState, useEffect } from "react";
import { Link } from "react-router"; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Menu items list
  const menuItems = [
    "Home", "New Arrivals", "Men", "Women", "Kids", "Sports", 
    "Winter Collection", "Ethnic Wear", "Co-Ord Sets", "Best Sellers", 
    "Special Offers", "Clearance Sale", "Track Order", "Size Guide", 
    "About Us", "Contact Us"
  ];

  useEffect(() => {
    const handleScroll = () => {
      // 20px nicha namlei transparent theke sada (white) hoye jabe
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      // Background and shadow changes dynamically based on scroll
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled ? "bg-white shadow-md py-0" : "bg-transparent py-2"
      }`}
    >
      <div className="max-w-375 mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-24">
          
          {/* Left - Logo Area */}
          <div className="shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
                alt="DressTown Logo" 
                className="h-25 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Center - Navigation Links with Hidden Scrollbar for large lists */}
          <div className="hidden lg:flex flex-1 mx-8 items-center space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {menuItems.map((item, index) => (
              <div key={index} className="shrink-0 flex items-center text-[13px] font-bold text-gray-800 uppercase tracking-wide cursor-pointer hover:text-red-500 transition">
                {item}
              </div>
            ))}
          </div>

          {/* Right - Search Box & Action Icons */}
          <div className="flex items-center space-x-8 text-gray-800 shrink-0">
            
            {/* Search Box - Rounded */}
            <div className="relative hidden xl:block mr-2">
              <input 
                type="text" 
                placeholder="Search..." 
                className={`w-64 border rounded-full focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 pl-4 pr-10 py-2 text-base transition-all duration-300 ${
                  isScrolled ? "bg-gray-50 border-gray-300 focus:bg-white" : "bg-white/50 border-gray-400 focus:bg-white backdrop-blur-sm"
                }`}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {/* User Profile Icon */}
            <Link to="/profile" className="flex flex-col items-center hover:text-red-500 transition group mt-1">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-semibold text-gray-800 group-hover:text-red-500">Profile</span>
            </Link>

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="flex flex-col items-center hover:text-red-500 transition group mt-1">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-semibold text-gray-800 group-hover:text-red-500">Wishlist</span>
            </Link>

            {/* Shopping Bag Icon with Badge */}
            <Link to="/cart" className="flex flex-col items-center hover:text-red-500 transition group mt-1">
              <div className="relative">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  0
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-800 group-hover:text-red-500">Cart</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;