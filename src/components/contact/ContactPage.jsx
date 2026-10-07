import { FiMapPin, FiPhone, FiMail, FiClock, FiGlobe, FiMessageSquare, FiCheckCircle } from "react-icons/fi";

const ContactPage = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-32 mb-24">
      
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

      {/* ================= INFO GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

        {/* Block 1: Location */}
        <div className="bg-gray-50 border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full text-red-600 shadow-sm mb-6 border border-gray-100">
            <FiMapPin size={24} />
          </div>
          <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4">Store Location</h3>
          <p className="inter-medium text-sm text-gray-600 leading-relaxed">
            House 2, Road 18, Rabindra Sarani,<br />
            Uttara Sector 7, Dhaka, 1230<br />
            Bangladesh
          </p>
        </div>

        {/* Block 2: Contact Methods */}
        <div className="bg-gray-50 border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full text-red-600 shadow-sm mb-6 border border-gray-100">
            <FiPhone size={24} />
          </div>
          <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4">Get in Touch</h3>
          <div className="space-y-4 inter-medium text-sm text-gray-600 w-full">
            <p className="flex items-center justify-center gap-3">
              <FiPhone className="text-gray-400" size={16}/> 
              <span>+880 1624-541181</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <FiMail className="text-gray-400" size={16}/> 
              <span>dresstownofficial@gmail.com</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <FiMessageSquare className="text-gray-400" size={16}/> 
              <span>Dresstown Flagship</span>
            </p>
          </div>
        </div>

        {/* Block 3: Hours & Web */}
        <div className="bg-gray-50 border border-gray-200 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="bg-white p-4 rounded-full text-red-600 shadow-sm mb-6 border border-gray-100">
            <FiClock size={24} />
          </div>
          <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4">Business Hours</h3>
          <div className="space-y-4 inter-medium text-sm text-gray-600 w-full">
            <p className="flex items-center justify-center gap-3">
              <FiClock className="text-gray-400" size={16}/> 
              <span>Always open</span>
            </p>
            <p className="flex items-center justify-center gap-3">
              <FiGlobe className="text-gray-400" size={16}/> 
              <a href="https://dresstownbd.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
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
          {['Online booking', 'In-store pickup', 'Delivery', 'In-store shopping', 'Reservations'].map((service, idx) => (
            <div key={idx} className="flex items-center gap-2.5 bg-gray-50 px-5 py-3 border border-gray-200 transition-colors hover:border-red-200">
              <FiCheckCircle className="text-green-500" size={16} />
              <span className="inter-bold text-[11px] uppercase tracking-wider text-gray-700">{service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= EXACT GOOGLE MAP ================= */}
      <div className="border border-gray-200 p-2 bg-white shadow-sm">
        <iframe 
          title="Dress Town Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.566270549722!2d90.39200447599723!3d23.86948578453086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c5003cdd695b%3A0xf24c39133081441c!2sDress%20Town!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd" 
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