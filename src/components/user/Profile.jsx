import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-250 mx-auto px-6 lg:px-10 pt-32 pb-10 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side - Profile Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-4xl font-bold mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name || 'User Name'}</h2>
          <p className="text-gray-500 text-sm mb-6">{user?.email || 'user@email.com'}</p>
          
          <button className="w-full bg-red-50 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
            Edit Profile
          </button>
        </div>

        {/* Right Side - Quick Links / Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/my-orders" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-500 transition-colors group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-500">My Orders</h3>
            <p className="text-gray-500 text-sm mt-1">Track, return, or buy things again</p>
          </Link>
          
          <Link to="/wishlist" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-500 transition-colors group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-500">Wishlist</h3>
            <p className="text-gray-500 text-sm mt-1">Items you saved for later</p>
          </Link>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-500 transition-colors group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-500">Addresses</h3>
            <p className="text-gray-500 text-sm mt-1">Edit delivery addresses</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-red-500 transition-colors group cursor-pointer">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-500">Security</h3>
            <p className="text-gray-500 text-sm mt-1">Change password</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;