import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router'; 
import ChangePasswordModal from '../LogReg/ChangePasswordModal';
import EditProfileModal from './EditProfileModal';

const Profile = () => {
  const { user, setUser } = useAuth(); // AuthContext থেকে setUser আনুন ডাটা রিফ্রেশ করার জন্য
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false); 

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-32 pb-20 min-h-screen relative">
      <h1 className="text-3xl inter-bold text-gray-900 mb-8 uppercase tracking-widest">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ================= Left Side - Profile Info ================= */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-4xl inter-bold mb-4 border border-red-100 shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-xl inter-bold text-gray-900 tracking-wide">{user?.name || 'User Name'}</h2>
          <p className="text-gray-500 text-sm mb-8 inter-medium">{user?.email || 'user@email.com'}</p>
          
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full bg-gray-900 text-white font-bold py-3.5 text-xs rounded-sm hover:bg-red-600 transition-colors uppercase tracking-[0.2em] shadow-md cursor-pointer"
          >
            Edit Profile
          </button>
        </div>

        {/* ================= Right Side - Quick Links / Stats ================= */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* My Orders */}
          <Link to="/my-orders" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-900 transition-colors group cursor-pointer flex flex-col justify-center">
            <h3 className="text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">My Orders</h3>
            <p className="text-gray-500 text-sm mt-2 inter-regular">Track, return, or view past purchases</p>
          </Link>
          
          {/* Wishlist */}
          <Link to="/wishlist" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-900 transition-colors group cursor-pointer flex flex-col justify-center">
            <h3 className="text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">Wishlist</h3>
            <p className="text-gray-500 text-sm mt-2 inter-regular">Items you saved for later</p>
          </Link>
          
          {/* DYNAMIC ADDRESS BLOCK */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-900 transition-colors group flex flex-col justify-between">
            <div>
              <h3 className="text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors mb-3">Default Address</h3>
              
              {user?.address ? (
                <div className="text-sm text-gray-600 leading-relaxed inter-regular">
                  <p className="inter-bold text-gray-900">{user.name}</p>
                  {user.phone && <p>{user.phone}</p>}
                  <p className="mt-1">{user.address}</p>
                  {(user.city || user.postalCode) && (
                    <p>{user.city} {user.postalCode}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm inter-regular">
                  No default address saved. It will update automatically after your first order.
                </p>
              )}
            </div>
            
            <button className="mt-5 text-[11px] inter-bold text-gray-400 group-hover:text-red-600 uppercase tracking-widest text-left transition-colors cursor-default">
              {user?.address ? 'Update at checkout' : 'Added at checkout'}
            </button>
          </div>

          {/* Security */}
          <div 
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-gray-900 transition-colors group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg inter-bold text-gray-900 group-hover:text-red-600 transition-colors">Security</h3>
              <p className="text-gray-500 text-sm mt-2 inter-regular">Change password & account settings</p>
            </div>
            <button className="mt-5 text-[11px] inter-bold text-gray-400 group-hover:text-red-600 uppercase tracking-widest text-left transition-colors">
              Manage Settings →
            </button>
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