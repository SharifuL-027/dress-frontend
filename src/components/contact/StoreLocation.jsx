import { FiMapPin, FiClock, FiPhone, FiNavigation } from "react-icons/fi";

const StoreLocation = () => {
  return (
    <div className="max-w-300 mx-auto px-4 md:px-8 mt-32 mb-24">
      
      {/* Page Header */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl md:text-4xl inter-bold text-black uppercase tracking-[0.15em]">
          Our Store Location
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4 mb-4"></div>
        <p className="inter-medium text-sm text-gray-500 uppercase tracking-widest">
          Visit DressTown Flagship to experience our premium collection
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 bg-white border border-gray-200 shadow-sm p-6 md:p-10 mb-16">
        
        {/* ================= LEFT: LOCATION DETAILS ================= */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-10">
          
          {/* Address Block */}
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3.5 rounded-full text-red-600 shrink-0">
              <FiMapPin size={24} />
            </div>
            <div>
              <h3 className="text-xs inter-bold uppercase tracking-widest text-gray-400 mb-2">Visit Us</h3>
              <h2 className="inter-bold text-lg text-gray-900 mb-2">DressTown Flagship</h2>
              <p className="inter-medium text-sm text-gray-600 leading-relaxed">
                House 2, Road 18, Rabindra Sarani,<br />
                Uttara Sector 7,<br />
                Dhaka, Bangladesh, 1230
              </p>
            </div>
          </div>

          {/* Hours Block */}
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3.5 rounded-full text-red-600 shrink-0">
              <FiClock size={24} />
            </div>
            <div>
              <h3 className="text-xs inter-bold uppercase tracking-widest text-gray-400 mb-2">Opening Hours</h3>
              <p className="inter-medium text-sm text-gray-600 leading-relaxed">
                Monday - Sunday<br />
                <span className="text-green-600 inter-bold mt-1 block">Always Open</span>
              </p>
            </div>
          </div>

          {/* Contact Block */}
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3.5 rounded-full text-red-600 shrink-0">
              <FiPhone size={24} />
            </div>
            <div>
              <h3 className="text-xs inter-bold uppercase tracking-widest text-gray-400 mb-2">Call Us</h3>
              <p className="inter-medium text-sm text-gray-600 leading-relaxed">
                +880 1624-541181
              </p>
            </div>
          </div>

          {/* Get Directions Button */}
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=23.86948578453086,90.39200447599723" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-3 bg-black text-white px-8 py-4 text-xs inter-bold uppercase tracking-widest hover:bg-red-600 transition-colors w-full"
          >
            <FiNavigation size={16} />
            Get Directions
          </a>

        </div>

        {/* ================= RIGHT: GOOGLE MAP ================= */}
        <div className="w-full lg:w-2/3 h-100 lg:h-125 bg-gray-100 relative border border-gray-200">
          <iframe 
            title="Dress Town Store Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.566270549722!2d90.39200447599723!3d23.86948578453086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c5003cdd695b%3A0xf24c39133081441c!2sDress%20Town!5e0!3m2!1sen!2sbd!4v1715000000000!5m2!1sen!2sbd" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>

      </div>

    </div>
  );
};

export default StoreLocation;