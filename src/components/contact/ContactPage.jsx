import { FiMapPin, FiPhone, FiMail, FiClock, FiGlobe, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const ContactPage = () => {
  const { settings } = useSiteSettings();

  const defaultMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.566270549722!2d90.39200447599723!3d23.86948578453086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c5003cdd695b%3A0xf24c39133081441c!2sDress%20Town!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd";

  const phone = settings.phone || "+880 1624-541181";
  const whatsapp = settings.whatsapp || "+880 1624-541181";
  const email = settings.email || "dresstownofficial@gmail.com";
  const address =
    settings.address ||
    "House 2, Road 18, Rabindra Sarani, Uttara Sector 7, Dhaka, 1230, Bangladesh";
  const workingHours = settings.workingHours || "Always open";
  const mapUrl = settings.googleMapEmbedUrl?.trim() ? settings.googleMapEmbedUrl : defaultMapUrl;

  // WhatsApp direct chat link format
  const whatsappCleanNumber = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="max-w-300 mx-auto px-4 md:px-8 mt-32 mb-24">
      
      {/* Page Header */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl md:text-4xl inter-bold text-black uppercase tracking-[0.15em]">
          Contact Us
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4 mb-4"></div>
        <p className="inter-medium text-sm text-gray-500 uppercase tracking-widest">
          Get in touch with DressTown Flagship
        </p>
      </div>

      {/* ================= INFO GRID (DYNAMIC) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

        {/* Block 1: Location */}
        <div className="bg-gray-50 border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full text-red-600 shadow-sm mb-6 border border-gray-100">
            <FiMapPin size={24} />
          </div>
          <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4">
            Store Location
          </h3>
          <p className="inter-medium text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {address}
          </p>
        </div>

        {/* Block 2: Contact Methods */}
        <div className="bg-gray-50 border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full text-red-600 shadow-sm mb-6 border border-gray-100">
            <FiPhone size={24} />
          </div>
          <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4">
            Get in Touch
          </h3>
          <div className="space-y-4 inter-medium text-sm text-gray-600 w-full">
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-3 hover:text-red-600 transition-colors"
            >
              <FiPhone className="text-gray-400 shrink-0" size={16} />
              <span>{phone}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-3 hover:text-red-600 transition-colors"
            >
              <FiMail className="text-gray-400 shrink-0" size={16} />
              <span>{email}</span>
            </a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsappCleanNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 hover:text-emerald-600 transition-colors"
              >
                <FiMessageSquare className="text-gray-400 shrink-0" size={16} />
                <span>WhatsApp: {whatsapp}</span>
              </a>
            )}
          </div>
        </div>

        {/* Block 3: Hours & Web */}
        <div className="bg-gray-50 border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full text-red-600 shadow-sm mb-6 border border-gray-100">
            <FiClock size={24} />
          </div>
          <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4">
            Business Hours
          </h3>
          <div className="space-y-4 inter-medium text-sm text-gray-600 w-full">
            <p className="flex items-center justify-center gap-3">
              <FiClock className="text-gray-400 shrink-0" size={16} />
              <span>{workingHours}</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <FiGlobe className="text-gray-400 shrink-0" size={16} />
              <a
                href="https://dresstownbd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors"
              >
                dresstownbd.com
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* ================= SERVICES SECTION ================= */}
      <div className="bg-white border border-gray-200 p-8 md:p-12 mb-16 text-center shadow-sm">
        <h2 className="text-lg inter-bold text-gray-900 uppercase tracking-widest mb-8">
          Our Services
        </h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {["Online booking", "In-store pickup", "Delivery", "In-store shopping", "Reservations"].map(
            (service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 bg-gray-50 px-5 py-3 border border-gray-200 transition-colors hover:border-red-200"
              >
                <FiCheckCircle className="text-green-500" size={16} />
                <span className="inter-bold text-[11px] uppercase tracking-wider text-gray-700">
                  {service}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* ================= EXACT GOOGLE MAP (DYNAMIC) ================= */}
      <div className="border border-gray-200 p-2 bg-white shadow-sm">
        <iframe
          title="Dress Town Location Map"
          src={mapUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

    </div>
  );
};

export default ContactPage;