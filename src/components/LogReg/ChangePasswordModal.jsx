import { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // পাসওয়ার্ড শো/হাইড করার জন্য স্টেট
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // পাসওয়ার্ড ভ্যালিডেশন
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      await api.put('/api/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      toast.success("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); 
      
      // মডাল ক্লোজ করার আগে শো/হাইড স্টেটগুলো রিসেট করে দেওয়া
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      onClose(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password!");
    } finally {
      setLoading(false);
    }
  };

  // Eye Icon SVG Component (কোড ক্লিন রাখার জন্য)
  const EyeIcon = ({ isVisible }) => (
    isVisible ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    )
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden z-10 transform transition-all p-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl inter-bold text-gray-900 mb-2 uppercase tracking-widest">Change Password</h2>
        <p className="text-sm text-gray-500 mb-6 inter-regular">Please enter your current password to update a new one.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Current Password */}
          <div>
            <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-1.5">Current Password</label>
            <div className="relative">
              <input 
                type={showCurrent ? "text" : "password"} 
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-gray-900 transition-colors text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <EyeIcon isVisible={showCurrent} />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-1.5">New Password</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"} 
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-gray-900 transition-colors text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <EyeIcon isVisible={showNew} />
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} 
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-sm focus:outline-none focus:border-gray-900 transition-colors text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <EyeIcon isVisible={showConfirm} />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-4 bg-red-600 text-white font-bold py-3.5 text-xs rounded-sm uppercase tracking-[0.2em] shadow-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChangePasswordModal;