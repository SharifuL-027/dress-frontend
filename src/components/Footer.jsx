import { Link } from "react-router"; 

const Footer = () => {
  return (
    // মোবাইলে অ্যাপ বটম মেনুর জন্য pb-24 প্যাডিং দেওয়া আছে
    <footer className="w-full pb-20 md:pb-0 bg-white">
      
      {/* ============================================== */}
      {/* FLOATING CONTACT BANNER (Fixed Overlap Issue) */}
      {/* ============================================== */}
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 relative z-20 mt-16 md:mt-24">
        <div className="bg-red-700 rounded-md shadow-2xl flex flex-col xl:flex-row justify-between items-center p-6 md:p-8 gap-6 md:gap-8">
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full xl:w-auto items-start md:items-center text-left">
            {/* Phone */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-red-200 inter-bold uppercase tracking-widest">Phone</p>
                <p className="text-white inter-bold text-sm tracking-wide">+880 1624 541181</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-red-200 inter-bold uppercase tracking-widest">Email</p>
                <p className="text-white inter-bold text-sm tracking-wide">dresstownofficial@gmail.com</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-red-200 inter-bold uppercase tracking-widest">Location</p>
                <p className="text-white inter-bold text-sm tracking-wide">Uttara Sector 7, Dhaka</p>
              </div>
            </div>
          </div>

          <Link to="/contact" className="w-full xl:w-auto bg-white text-red-600 px-8 py-3.5 text-[11px] inter-bold uppercase tracking-[0.2em] text-center hover:bg-gray-100 transition-colors shrink-0 shadow-lg mt-2 xl:mt-0 rounded-sm">
            Contact Us
          </Link>
          
        </div>
      </div>

      {/* ============================================== */}
      {/* MAIN FOOTER CONTENT */}
      {/* ============================================== */}
      {/* নেগেটিভ মার্জিন (-mt-16) দিয়ে ফুটারটিকে লাল বক্সের নিচে ঢুকিয়ে দেওয়া হয়েছে, তাই ওভারল্যাপের কোনো চান্স নেই */}
      <div className="bg-[#0a0a0a] pt-28 md:pt-24 -mt-12 md:-mt-16 relative z-10 border-t border-gray-900">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 pb-12">
          
          {/* Mobile a Double Column Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            
            {/* Column 1: Brand Info (Full width on mobile, half on desktop) */}
            <div className="col-span-2 lg:col-span-2 text-left">
              <Link to="/" className="inline-block bg-white px-4 py-4 mb-6 rounded-sm shadow-md">
                <img 
                  src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
                  alt="Dress Town Flagship" 
                  className="h-10 md:h-14 w-auto object-contain" 
                />
              </Link>
              
              <p className="text-sm inter-regular text-gray-400 leading-relaxed mb-6 lg:max-w-md">
                Dress Town Flagship is your ultimate destination for premium clothing. We bring you the finest quality fabrics and modern designs to elevate your everyday style.
              </p>
              
              <div className="flex gap-3 justify-start">
                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors rounded-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors rounded-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-red-600 text-white flex items-center justify-center transition-colors rounded-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z"/><circle cx="16.806" cy="7.207" r="1.078"/><path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.08 5.08 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Support Links (1 Column on mobile) */}
            <div className="col-span-1 text-left">
              <h3 className="text-white inter-bold text-[11px] mb-5 uppercase tracking-widest">Support</h3>
              <ul className="space-y-3">
                {['Home', 'About Us', 'Shop Page', 'Order Tracking', 'Contact Us'].map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-gray-400 hover:text-white inter-regular text-xs flex items-center justify-start gap-2 transition-colors group">
                      <span className="text-red-600 group-hover:translate-x-1 transition-transform">›</span> {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services/Categories (1 Column on mobile) */}
            <div className="col-span-1 text-left">
              <h3 className="text-white inter-bold text-[11px] mb-5 uppercase tracking-widest">Services</h3>
              <ul className="space-y-3">
                {['Men Collection', 'Women Collection', 'Accessories', 'Flash Sale', 'Size Guide'].map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-gray-400 hover:text-white inter-regular text-xs flex items-center justify-start gap-2 transition-colors group">
                      <span className="text-red-600 group-hover:translate-x-1 transition-transform">›</span> {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ============================================== */}
        {/* COPYRIGHT BOTTOM BAR */}
        {/* ============================================== */}
        <div className="border-t border-gray-900 bg-[#050505]">
          <div className="max-w-375 mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 inter-regular text-[11px] text-center md:text-left">
              Copyright &copy; {new Date().getFullYear()} DRESS TOWN FLAGSHIP. All Right Reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-[11px] inter-regular text-gray-500">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;