import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  return (
    <div className="fixed bottom-12 right-6 z-50 flex items-center group">
      
      {/* Tooltip (Hover text with smooth slide-in animation) */}
      <div className="absolute right-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-x-4 group-hover:translate-x-0">
        <span className="relative bg-white text-black text-[11px] inter-bold uppercase tracking-widest px-5 py-3 shadow-xl whitespace-nowrap border border-gray-100 rounded flex items-center">
          Chat with us
          {/* Tooltip Arrow (ডানপাশের ছোট কোণা) */}
          <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-100 rotate-45"></span>
        </span>
      </div>

      {/* Button Wrapper with Ripple Effect */}
      <a
        href="https://wa.me/8801624541181"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-[60px] h-[60px] bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300"
        aria-label="Chat on WhatsApp"
      >
        {/* Continuous Ping Animation Layer (তরঙ্গের মতো ছড়াবে) */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"></span>
        
        {/* Main WhatsApp Icon */}
        <FaWhatsapp size={34} className="relative z-10" />
      </a>
      
    </div>
  );
};

export default WhatsAppButton;