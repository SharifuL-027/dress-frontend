import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose, user, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  // মডাল ওপেন হলে ইউজারের বর্তমান ডাটা ফর্মে বসিয়ে দেবে
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || ""
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // ব্যাকএন্ডের প্রোফাইল আপডেট API (আপনার রাউট অনুযায়ী পরিবর্তন হতে পারে)
      const { data } = await api.put('/api/users/profile', formData);
      
      toast.success("Profile updated successfully!");
      onUpdateSuccess(data); // প্রোফাইল পেজে নতুন ডাটা আপডেট করা
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden z-10 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl">&times;</button>

        <h2 className="text-xl inter-bold text-gray-900 mb-6 uppercase tracking-widest">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-1.5">Full Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-gray-900 outline-none text-sm inter-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-1.5">Phone Number</label>
            <input 
              type="text" name="phone" value={formData.phone} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:border-gray-900 outline-none text-sm inter-medium"
              placeholder="+880 1..."
            />
          </div>

          {/* ইমেইল সাধারণত চেঞ্জ করতে দেওয়া হয় না, তাই disabled রাখা হয়েছে */}
          <div>
            <label className="block text-[11px] inter-bold text-gray-400 uppercase tracking-widest mb-1.5">Email (Cannot be changed)</label>
            <input 
              type="email" value={user?.email || ""} disabled
              className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-sm text-gray-400 text-sm inter-medium cursor-not-allowed"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-gray-900 text-white font-bold py-3.5 text-xs rounded-sm uppercase tracking-[0.2em] hover:bg-red-600 transition-colors">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;