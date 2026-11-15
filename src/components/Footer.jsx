import { Link } from "react-router";
import { FiMapPin, FiPhone, FiMail, FiClock } from "react-icons/fi";
import { useSiteSettings } from "../hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();

  const supportLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Shop Page", path: "/shop" },
    { name: "Order Tracking", path: "/my-orders" },
    { name: "Contact Us", path: "/contact" },
  ];

  const serviceLinks = [
    { name: "Men Collection", path: "/shop?gender=Men" },
    { name: "Women Collection", path: "/shop?gender=Women" },
    { name: "Accessories", path: "/shop" },
    { name: "Flash Sale", path: "/shop" },
    { name: "Size Guide", path: "/contact" },
  ];

  return (
    <footer className="w-full">
      {/* ============================================== */}
      {/* FLOATING CONTACT BANNER (UNCHANGED) */}
      {/* ============================================== */}
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 relative z-20 mt-16 md:mt-24">
        <div className="bg-red-700 rounded-md shadow-2xl flex flex-col xl:flex-row justify-between items-center p-6 md:p-8 gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full xl:w-auto items-start md:items-center text-left">
            {/* Phone */}
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-4 w-full md:w-auto group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-red-200 inter-bold uppercase tracking-widest">Phone</p>
                <p className="text-white inter-bold text-sm tracking-wide">
                  {settings.phone || "+880 1624 541181"}
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${settings.email}`}
              className="flex items-center gap-4 w-full md:w-auto group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-red-200 inter-bold uppercase tracking-widest">Email</p>
                <p className="text-white inter-bold text-sm tracking-wide">
                  {settings.email || "dresstownofficial@gmail.com"}
                </p>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-red-200 inter-bold uppercase tracking-widest">Location</p>
                <p className="text-white inter-bold text-sm tracking-wide">
                  {settings.address || "Uttara Sector 7, Dhaka"}
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/contact"
            className="w-full xl:w-auto bg-white text-red-600 px-8 py-3.5 text-[11px] inter-bold uppercase tracking-[0.2em] text-center hover:bg-gray-100 transition-colors shrink-0 shadow-lg mt-2 xl:mt-0 rounded-sm"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* ============================================== */}
      {/* MAIN FOOTER CONTENT (UPGRADED & PREMIUM) */}
      {/* ============================================== */}
      <div className="bg-[#0a0a0a] pt-32 md:pt-28 -mt-12 md:-mt-16 relative z-10 border-t border-white/10">
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
            
            {/* Column 1: Brand Logo, Bio & Larger Social Icons (5 cols) */}
            <div className="lg:col-span-5 text-left">
              <a
                href="/"
                className="inline-block bg-white px-5 py-4 mb-7 rounded-sm shadow-lg hover:opacity-95 transition-opacity"
              >
                <img
                  src={
                    settings.logoUrl ||
                    "https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png"
                  }
                  alt="Dress Town Flagship"
                  className="h-12 md:h-16 w-auto object-contain"
                />
              </a>

              <p className="text-sm md:text-[15px] inter-regular text-gray-300 leading-relaxed mb-8 max-w-md">
                {settings.footerAbout ||
                  "Dress Town Flagship is your ultimate destination for premium clothing. We bring you the finest quality fabrics and modern designs to elevate your everyday style."}
              </p>

              {/* Larger Premium Social Buttons */}
              <div>
                <p className="text-xs inter-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                  Follow Us
                </p>
                <div className="flex flex-wrap gap-3.5 justify-start">
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-11 h-11 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 text-white flex items-center justify-center transition-all duration-300 rounded-sm hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                  )}

                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-11 h-11 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 text-white flex items-center justify-center transition-all duration-300 rounded-sm hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z" />
                        <circle cx="16.806" cy="7.207" r="1.078" />
                        <path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.08 5.08 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z" />
                      </svg>
                    </a>
                  )}

                  {settings.tiktokUrl && (
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                      className="w-11 h-11 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 text-white flex items-center justify-center transition-all duration-300 rounded-sm hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </a>
                  )}

                  {settings.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube"
                      className="w-11 h-11 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 text-white flex items-center justify-center transition-all duration-300 rounded-sm hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Support Links (2 cols) */}
            <div className="lg:col-span-2 text-left">
              <h3 className="text-white inter-bold text-base mb-2 uppercase tracking-widest">
                Support
              </h3>
              <div className="w-10 h-0.5 bg-red-600 mb-6"></div>
              <ul className="space-y-3.5">
                {supportLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="text-gray-300 hover:text-white inter-medium text-sm flex items-center justify-start gap-2.5 transition-colors group"
                    >
                      <span className="text-red-600 text-base font-bold group-hover:translate-x-1 transition-transform">
                        ›
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services Links (2 cols) */}
            <div className="lg:col-span-2 text-left">
              <h3 className="text-white inter-bold text-base mb-2 uppercase tracking-widest">
                Services
              </h3>
              <div className="w-10 h-0.5 bg-red-600 mb-6"></div>
              <ul className="space-y-3.5">
                {serviceLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="text-gray-300 hover:text-white inter-medium text-sm flex items-center justify-start gap-2.5 transition-colors group"
                    >
                      <span className="text-red-600 text-base font-bold group-hover:translate-x-1 transition-transform">
                        ›
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Store & Flagship Info (3 cols) */}
            <div className="lg:col-span-3 text-left">
              <h3 className="text-white inter-bold text-base mb-2 uppercase tracking-widest">
                Flagship Store
              </h3>
              <div className="w-10 h-0.5 bg-red-600 mb-6"></div>
              <ul className="space-y-4 text-sm inter-regular text-gray-300">
                <li className="flex items-start gap-3">
                  <FiMapPin className="text-red-500 shrink-0 mt-1" size={18} />
                  <span className="leading-relaxed">
                    {settings.address || "Uttara Sector 7, Dhaka, Bangladesh"}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <FiPhone className="text-red-500 shrink-0" size={18} />
                  <a
                    href={`tel:${settings.phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.phone || "+880 1624 541181"}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <FiMail className="text-red-500 shrink-0" size={18} />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors break-all"
                  >
                    {settings.email || "dresstownofficial@gmail.com"}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FiClock className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <span>{settings.workingHours || "Sat - Thu: 10:00 AM - 10:00 PM"}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* ============================================== */}
        {/* COPYRIGHT BOTTOM BAR (LARGER & CLEANER) */}
        {/* ============================================== */}
        <div className="border-t border-white/10 bg-[#050505] pb-24 md:pb-0">
          <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 inter-medium text-xs md:text-sm text-center md:text-left">
              Copyright &copy; {new Date().getFullYear()} DRESS TOWN FLAGSHIP. All Right Reserved.
              <span className="mx-2.5 text-gray-700">|</span>
              Developed by{" "}
              <a
                href="https://genesysltd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-red-500 inter-bold underline decoration-red-600/60 underline-offset-4 transition-colors"
              >
                Genesys Tech
              </a>
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8 text-xs md:text-sm inter-medium text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;