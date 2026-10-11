import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    type: "Hero",
    category: "",
    link: ""
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ডাটা ফেচ করা (ব্যানার এবং ক্যাটাগরি)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const [bannerRes, catRes] = await Promise.all([
        api.get('/api/banners'),
        api.get('/api/categories')
      ]);
      setBanners(bannerRes.data);
      // শুধুমাত্র মেইন ক্যাটাগরিগুলো ফিল্টার করছি
      setCategories(catRes.data.filter(cat => !cat.parent));
    } catch (error) {
      toast.error("Failed to load data!");
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ব্যানার সাবমিট করা
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      return toast.error("Please upload a banner image!");
    }
    if (formData.type === "Category" && !formData.category) {
      return toast.error("Please select a category for this banner!");
    }

    setLoading(true);

    try {
      // 1. Cloudinary তে ইমেজ আপলোড
      const cloudName = "wtbwxhmc"; 
      const uploadPreset = "dresstown"; 

      const imageFormData = new FormData();
      imageFormData.append("file", image);
      imageFormData.append("upload_preset", uploadPreset);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        imageFormData
      );

      const uploadedImage = {
        url: cloudinaryRes.data.secure_url,
        public_id: cloudinaryRes.data.public_id
      };

      // 2. ডাটাবেসে সেভ করা
      const bannerData = {
        title: formData.title,
        type: formData.type,
        category: formData.type === "Category" ? formData.category : null,
        link: formData.link,
        image: uploadedImage
      };

      await api.post('/api/banners', bannerData);
      
      toast.success("Banner added successfully! 🎉");
      
      // ফর্ম রিসেট করা
      setFormData({ title: "", type: "Hero", category: "", link: "" });
      setImage(null);
      setImagePreview(null);
      
      // নতুন ব্যানার লিস্ট আপডেট করা
      fetchData();

    } catch (error) {
      toast.error("Failed to add banner!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ব্যানার ডিলিট করা
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      await api.delete(`/api/banners/${id}`);
      toast.success("Banner deleted successfully!");
      setBanners(banners.filter(banner => banner._id !== id));
    } catch (error) {
      toast.error("Failed to delete banner!");
      console.error(error);
    }
  };

  // ================= PREMIUN RESPONSIVE CLASSES =================
  const inputClass = "w-full border border-gray-300 p-3 text-xs md:text-sm focus:border-red-500 focus:outline-none transition-colors bg-white inter-regular rounded-sm";
  const labelClass = "block text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2";
  // ==============================================================

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-6 md:mb-8 pb-4 md:pb-5 border-b border-gray-200">
        <h2 className="text-xl md:text-2xl inter-bold text-gray-800 uppercase tracking-widest">Manage Banners</h2>
        <p className="text-[11px] md:text-sm text-gray-500 mt-1 md:mt-1.5 inter-medium">Upload and organize hero, category, and promotional banners.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
        
        {/* ================= LEFT: ADD BANNER FORM ================= */}
        <div className="w-full xl:w-100 shrink-0">
          <div className="bg-white border border-gray-200 p-5 md:p-6 shadow-sm xl:sticky top-24 rounded-sm">
            <h3 className="text-[13px] md:text-sm inter-bold text-gray-900 uppercase tracking-widest mb-5 md:mb-6 border-b border-gray-100 pb-3">
              Add New Banner
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className={labelClass}>Banner Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleTextChange} required className={inputClass} placeholder="e.g. Eid Mega Sale" />
              </div>

              <div>
                <label className={labelClass}>Banner Type *</label>
                <select name="type" value={formData.type} onChange={handleTextChange} className={inputClass}>
                  <option value="Hero">Hero (Main Slider)</option>
                  <option value="Category">Category Banner</option>
                  <option value="Promo">Promotional Banner</option>
                </select>
              </div>

              {formData.type === "Category" && (
                <div className="animate-fade-in-up">
                  <label className={labelClass}>Select Category *</label>
                  <select name="category" value={formData.category} onChange={handleTextChange} required className={inputClass}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className={labelClass}>Target Link (Optional)</label>
                <input type="text" name="link" value={formData.link} onChange={handleTextChange} className={inputClass} placeholder="e.g. /category/men" />
              </div>

              <div>
                <label className={labelClass}>Banner Image *</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center relative group hover:border-red-500 transition-colors bg-gray-50 rounded-sm cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  
                  {imagePreview ? (
                    <div className="relative group/preview">
                      <img src={imagePreview} alt="Preview" className="max-h-24 md:max-h-32 mx-auto object-contain rounded-sm" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                        <span className="text-white text-[10px] inter-bold uppercase tracking-widest border border-white px-3 py-1 rounded-sm">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl md:text-3xl text-gray-400">🖼️</span>
                      <p className="text-xs md:text-sm inter-bold text-gray-700">Upload Image</p>
                      <p className="text-[9px] md:text-[10px] inter-medium text-gray-400 uppercase tracking-wider">Recommended: 1920x600px</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-black hover:bg-red-600 text-white inter-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-3.5 md:py-4 transition-colors disabled:bg-gray-400 cursor-pointer mt-2 md:mt-4 rounded-sm shadow-sm"
              >
                {loading ? "Uploading..." : "Save Banner"}
              </button>

            </form>
          </div>
        </div>

        {/* ================= RIGHT: BANNER LIST ================= */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 p-5 md:p-6 shadow-sm rounded-sm">
            <h3 className="text-[13px] md:text-sm inter-bold text-gray-900 uppercase tracking-widest mb-5 md:mb-6 border-b border-gray-100 pb-3 flex justify-between items-center">
              <span>Active Banners <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm ml-2 text-[10px]">{banners.length}</span></span>
            </h3>

            {fetchLoading ? (
              <div className="text-center py-10 md:py-16 text-[10px] md:text-xs inter-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading banners...</div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12 md:py-16 bg-gray-50 border border-gray-100 rounded-sm">
                <span className="text-3xl md:text-4xl block mb-3 opacity-50">📭</span>
                <p className="text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest">No banners found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {banners.map((banner) => (
                  <div key={banner._id} className="border border-gray-200 bg-white group hover:shadow-md transition-all duration-300 relative rounded-sm overflow-hidden">
                    
                    <div className="aspect-[21/9] md:aspect-video w-full overflow-hidden bg-gray-100 relative">
                      <img 
                        src={banner.image.url} 
                        alt={banner.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <span className="absolute top-2 left-2 bg-black/80 text-white text-[8px] md:text-[9px] inter-bold uppercase tracking-widest px-2 py-1 backdrop-blur-sm rounded-sm shadow-sm">
                        {banner.type}
                      </span>
                    </div>
                    
                    <div className="p-3 md:p-4 flex justify-between items-start gap-3 md:gap-4 bg-white">
                      <div className="min-w-0">
                        <h4 className="text-xs md:text-sm inter-bold text-gray-900 line-clamp-1 truncate">{banner.title}</h4>
                        <p className="text-[9px] md:text-[10px] inter-medium text-gray-500 uppercase tracking-wider mt-1 line-clamp-1 truncate">
                          {banner.type === 'Category' && banner.category ? `Cat: ${banner.category.name}` : `Link: ${banner.link || 'None'}`}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-500 hover:text-white bg-red-50 hover:bg-red-600 p-2 md:p-2.5 rounded-full transition-colors cursor-pointer shrink-0 shadow-sm"
                        title="Delete Banner"
                      >
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminBanners;