import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router'; 
import ChangePasswordModal from '../LogReg/ChangePasswordModal';
import EditProfileModal from './EditProfileModal';
import { FiBox, FiHeart, FiMapPin, FiLock } from 'react-icons/fi'; // 아이কন যুক্ত করা হলো

const Profile = () => {
  const { user, setUser } = useAuth(); // AuthContext থেকে setUser আনুন ডাটা রিফ্রেশ করার জন্য
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false); 

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6 md:mt-32 pb-24 min-h-screen relative font-sans">
      
      {/* ================= HEADER ================= */}
      <div className="mb-8 md:mb-12 text-center md:text-left mt-4 md:mt-0">
        <h1 className="text-2xl md:text-3xl inter-bold text-gray-900 uppercase tracking-widest">My Account</h1>
        <div className="w-16 h-1 bg-red-600 mx-auto md:mx-0 mt-3 rounded-full"></div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* ================= Left Side - Profile Info ================= */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100 flex flex-col items-center text-center">
            
            <div className="w-20 h-20 md:w-24 md:h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl md:text-4xl inter-bold mb-4 border border-red-100 shadow-sm relative">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              {/* Green online dot */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <h2 className="text-lg md:text-xl inter-bold text-gray-900 tracking-wide">{user?.name || 'User Name'}</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1 mb-6 md:mb-8 inter-medium">{user?.email || 'user@email.com'}</p>
            
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full bg-black text-white font-bold py-3 md:py-3.5 text-[11px] md:text-xs rounded-sm hover:bg-red-600 transition-colors uppercase tracking-[0.15em] shadow-sm cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* ================= Right Side - Quick Links / Stats ================= */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          
          {/* My Orders */}
          <Link to="/my-orders" className="bg-white p-5 md:p-6 rounded-sm shadow-sm border border-gray-100 hover:border-black hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-center">
            <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
              <div className="p-2.5 md:p-3 bg-gray-50 text-gray-700 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <FiBox size={22} className="md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">My Orders</h3>
            </div>
            <p className="text-gray-500 text-[11px] md:text-xs inter-regular ml-[52px] md:ml-[60px]">Track, return, or view past purchases</p>
          </Link>
          
          {/* Wishlist */}
          <Link to="/wishlist" className="bg-white p-5 md:p-6 rounded-sm shadow-sm border border-gray-100 hover:border-black hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-center">
            <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
              <div className="p-2.5 md:p-3 bg-gray-50 text-gray-700 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <FiHeart size={22} className="md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">Wishlist</h3>
            </div>
            <p className="text-gray-500 text-[11px] md:text-xs inter-regular ml-[52px] md:ml-[60px]">Items you saved for later</p>
          </Link>
          
          {/* DYNAMIC ADDRESS BLOCK */}
          <div className="bg-white p-5 md:p-6 rounded-sm shadow-sm border border-gray-100 hover:border-black hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="p-2.5 md:p-3 bg-gray-50 text-gray-700 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                  <FiMapPin size={22} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-base md:text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">Default Address</h3>
              </div>
              
              <div className="ml-[52px] md:ml-[60px]">
                {user?.address ? (
                  <div className="text-[11px] md:text-xs text-gray-600 leading-relaxed inter-regular">
                    <p className="inter-bold text-gray-900 text-xs md:text-sm mb-0.5">{user.name}</p>
                    {user.phone && <p>{user.phone}</p>}
                    <p className="mt-1">{user.address}</p>
                    {(user.city || user.postalCode) && (
                      <p>{user.city} {user.postalCode}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-[11px] md:text-xs inter-regular leading-relaxed">
                    No default address saved. It will update automatically after your first order.
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-5 ml-[52px] md:ml-[60px]">
              <span className="text-[9px] md:text-[10px] inter-bold text-gray-400 group-hover:text-red-600 uppercase tracking-widest transition-colors">
                {user?.address ? 'Update at checkout' : 'Added at checkout'}
              </span>
            </div>
          </div>

          {/* Security */}
          <div 
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-white p-5 md:p-6 rounded-sm shadow-sm border border-gray-100 hover:border-black hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
                <div className="p-2.5 md:p-3 bg-gray-50 text-gray-700 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                  <FiLock size={22} className="md:w-6 md:h-6" />
                </div>
                <h3 className="text-base md:text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">Security</h3>
              </div>
              <p className="text-gray-500 text-[11px] md:text-xs inter-regular ml-[52px] md:ml-[60px]">Change password & account settings</p>
            </div>
            <div className="mt-4 md:mt-5 ml-[52px] md:ml-[60px]">
              <span className="text-[10px] md:text-[11px] inter-bold text-gray-400 group-hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1">
                Manage Settings <span className="text-sm">→</span>
              </span>
            </div>
          </div>
          
        </div>

      </div>

      {/* ================= MODALS ================= */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
      
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        user={user}
        onUpdateSuccess={(updatedData) => {
          if(setUser) setUser({ ...user, ...updatedData });
        }}
      />

    </div>
  );
};

export default Profile;