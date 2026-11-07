import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../../api/axios";
import axios from "axios";
import toast from "react-hot-toast";

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // সব ফিল্ডের স্টেট
  const [formData, setFormData] = useState({
    name: "", sku: "", category: "", subCategory: "", gender: "", brand: "",
    regularPrice: "", discountPrice: "", fabric: "", gsm: "", fitType: "", 
    sleeveType: "", pattern: "", description: "", keyFeatures: "", sizeChart: "", 
    washingInstructions: "", origin: "", deliveryInfo: "", returnPolicy: ""
  });

  // =====================================
  // Variant Management State
  // =====================================
  const [variants, setVariants] = useState([]); 
  const [newVariant, setNewVariant] = useState({ color: "", size: "", stock: "" });

  // =====================================
  // Media Management State (Images & Video)
  // =====================================
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]);

  const [existingVideo, setExistingVideo] = useState("");
  const [newVideo, setNewVideo] = useState(null); // File object
  const [videoPreview, setVideoPreview] = useState("");

  // ডাটাবেস থেকে প্রোডাক্টের তথ্য এনে ফর্মে বসানো
  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setFormData({
          ...data,
          category: data.category?._id || data.category,
        });
        
        if (data.variants && data.variants.length > 0) setVariants(data.variants);
        if (data.images && data.images.length > 0) setExistingImages(data.images);
        if (data.video) setExistingVideo(data.video?.url || data.video);

      } catch (error) {
        console.error("Failed to fetch product", error);
        setMessage({ type: "error", text: "Product not found!" });
      }
    };
    fetchSingleProduct();
  }, [id]);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =====================================
  // Media Handlers (Images & Video)
  // =====================================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + newImages.length > 5) {
      toast.error("Maximum 5 images allowed.");
      return;
    }
    setNewImages((prev) => [...prev, ...files]);
    
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Video size should be less than 10MB");
        return;
      }
      setNewVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setExistingVideo(""); // Remove existing video if new one is selected
    }
  };

  const removeVideo = () => {
    setNewVideo(null);
    setVideoPreview("");
    setExistingVideo("");
  };


  // =====================================
  // Variant Logic
  // =====================================
  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size || !newVariant.stock) {
      toast.error("Please fill color, size, and stock to add a variant.");
      return;
    }
    
    const exists = variants.find(v => v.color.toLowerCase() === newVariant.color.toLowerCase() && v.size.toLowerCase() === newVariant.size.toLowerCase());
    if (exists) {
      toast.error("This color and size combination already exists.");
      return;
    }

    setVariants([...variants, { ...newVariant, stock: Number(newVariant.stock) }]);
    setNewVariant({ color: "", size: "", stock: "" });
  };

  const handleRemoveVariant = (indexToRemove) => {
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };


  // =====================================
  // Cloudinary Upload Helper
  // =====================================
  const uploadToCloudinary = async (file, resourceType = "image") => {
    const cloudName = "wtbwxhmc"; // Replace with your Cloudinary Cloud Name
    const uploadPreset = "dresstown"; // Replace with your Upload Preset
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, formData);
    
    return {
      public_id: res.data.public_id,
      url: res.data.secure_url,
    };
  };

  // =====================================
  // Submit Logic
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (variants.length < 1) {
      toast.error("Please add at least 1 product variant (Color/Size/Stock).");
      return;
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("At least one product image is required.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload New Images
      const uploadedImages = [];
      if (newImages.length > 0) {
        toast.loading("Uploading new images...", { id: "upload" });
        for (const file of newImages) {
          const imgData = await uploadToCloudinary(file, "image");
          uploadedImages.push(imgData);
        }
      }

      // 2. Upload New Video (if selected)
      let uploadedVideo = existingVideo;
      if (newVideo) {
        toast.loading("Uploading video...", { id: "upload" });
        const videoData = await uploadToCloudinary(newVideo, "video");
        uploadedVideo = videoData; 
      }
      toast.dismiss("upload");

      // 3. Prepare Final Data
      const finalImages = [...existingImages, ...uploadedImages];
      const totalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);
      const uniqueColors = [...new Set(variants.map(v => v.color))];
      const uniqueSizes = [...new Set(variants.map(v => v.size))];

      const productData = {
        ...formData,
        images: finalImages,
        video: uploadedVideo || null,
        variants: variants,
        totalStock: totalStock,
        colors: uniqueColors.join(', '),
        sizes: uniqueSizes.join(', ')
      };

      // 4. Update Database
      await api.put(`/api/products/${id}`, productData);
      
      toast.success("Product updated successfully! 🎉");
      window.scrollTo(0, 0);
      setTimeout(() => navigate('/admin/products'), 1500);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // ================= PREMIUN RESPONSIVE CLASSES =================
  const inputClass = "w-full border border-gray-300 p-3 text-[13px] md:text-sm inter-medium focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-md";
  const labelClass = "block text-[11px] md:text-xs inter-bold text-gray-600 uppercase tracking-widest mb-2";
  // ==============================================================

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-[#f8f9fa] min-h-screen">
      
      {/* ================= HEADER ================= */}
      <div className="mb-8 md:mb-10 pb-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl inter-bold text-gray-900 uppercase tracking-wider">Edit Product</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2 inter-medium">Modify existing product details, variants, and media files.</p>
        </div>
        <button onClick={() => navigate('/admin/products')} className="text-[10px] inter-bold bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 uppercase tracking-wider cursor-pointer rounded-md transition-colors">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        
        <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl">
          <h3 className="text-sm md:text-base inter-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className={labelClass}>Product Name</label>
              <input type="text" name="name" value={formData.name || ""} onChange={handleTextChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Product Code / SKU</label>
              <input type="text" name="sku" value={formData.sku || ""} onChange={handleTextChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Regular Price (৳)</label>
              <input type="number" name="regularPrice" value={formData.regularPrice || ""} onChange={handleTextChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Discount Price (৳)</label>
              <input type="number" name="discountPrice" value={formData.discountPrice || ""} onChange={handleTextChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* ===================================== */}
        {/* Media Manager (Images & Video) */}
        {/* ===================================== */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl">
          <h3 className="text-sm md:text-base inter-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">Product Media</h3>
          
          {/* ----- IMAGES ----- */}
          <div className="mb-8">
            <label className={labelClass}>Product Images (Max 5)</label>
            <div className="flex flex-wrap gap-4 mt-3">
              
              {/* Existing Images */}
              {existingImages.map((img, idx) => (
                <div key={`exist-${idx}`} className="relative w-24 h-24 md:w-32 md:h-32 border border-gray-200 rounded-lg overflow-hidden group">
                  <img src={img.url || img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeExistingImage(idx)} className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700">🗑</button>
                  </div>
                  <span className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-2 py-0.5 rounded-sm">Old</span>
                </div>
              ))}

              {/* New Image Previews */}
              {imagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative w-24 h-24 md:w-32 md:h-32 border border-blue-200 rounded-lg overflow-hidden group">
                  <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeNewImage(idx)} className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700">🗑</button>
                  </div>
                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-sm">New</span>
                </div>
              ))}

              {/* Upload Button */}
              {existingImages.length + newImages.length < 5 && (
                <label className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-2xl text-gray-400">📸</span>
                  <span className="text-[10px] md:text-xs inter-medium text-gray-500 mt-2">Add Image</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* ----- VIDEO ----- */}
          <div>
            <label className={labelClass}>Product Video (Optional, Max 10MB)</label>
            <div className="mt-3">
              {(existingVideo || videoPreview) ? (
                <div className="relative w-full max-w-sm border border-gray-200 rounded-lg overflow-hidden group bg-black">
                  <video src={videoPreview || (existingVideo.url ? existingVideo.url : existingVideo)} controls className="w-full h-48 object-contain"></video>
                  <button type="button" onClick={removeVideo} className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-sm shadow-md hover:bg-red-700">
                    Remove Video
                  </button>
                  {videoPreview && <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] px-2 py-1 rounded-sm">New File Selected</span>}
                </div>
              ) : (
                <label className="w-full max-w-sm h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-2xl text-gray-400">🎥</span>
                  <span className="text-xs inter-medium text-gray-500 mt-2">Upload Short Video</span>
                  <input type="file" accept="video/mp4,video/webm" onChange={handleVideoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ===================================== */}
        {/* Variant Manager */}
        {/* ===================================== */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl">
          <h3 className="text-sm md:text-base inter-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">Manage Variants (Color & Size)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="w-full">
              <label className={labelClass}>Color</label>
              <input type="text" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} placeholder="e.g. Black" className={inputClass} />
            </div>
            <div className="w-full">
              <label className={labelClass}>Size</label>
              <input type="text" value={newVariant.size} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} placeholder="e.g. XL" className={inputClass} />
            </div>
            <div className="w-full">
              <label className={labelClass}>Stock Quantity</label>
              <input type="number" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} placeholder="e.g. 50" className={inputClass} />
            </div>
            <button type="button" onClick={handleAddVariant} className="w-full bg-gray-900 text-white inter-bold text-[11px] md:text-sm uppercase tracking-widest h-[46px] hover:bg-black transition-colors rounded-md shadow-sm cursor-pointer">
              + Add
            </button>
          </div>

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-left text-xs md:text-sm border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50 uppercase text-[9px] md:text-[10px] tracking-widest text-gray-500">
                    <th className="p-3 md:p-4 border-b border-gray-200 inter-bold">Color</th>
                    <th className="p-3 md:p-4 border-b border-gray-200 inter-bold">Size</th>
                    <th className="p-3 md:p-4 border-b border-gray-200 inter-bold">Stock</th>
                    <th className="p-3 md:p-4 border-b border-gray-200 text-right inter-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 md:p-4 inter-bold text-gray-800">{v.color}</td>
                      <td className="p-3 md:p-4 inter-bold text-gray-800">{v.size}</td>
                      <td className="p-3 md:p-4 inter-bold text-blue-600">{v.stock} pcs</td>
                      <td className="p-3 md:p-4 text-right">
                        <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-[10px] md:text-[11px] uppercase tracking-widest text-red-500 inter-bold hover:text-red-700 cursor-pointer px-3 py-1 bg-red-50 rounded-md">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-900">
                    <td colSpan="2" className="p-3 md:p-4 inter-bold text-right uppercase text-[10px] md:text-[11px] tracking-widest text-gray-300">Total Stock Available:</td>
                    <td colSpan="2" className="p-3 md:p-4 inter-bold text-white text-[13px] md:text-sm">
                      {variants.reduce((acc, curr) => acc + curr.stock, 0)} pcs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================================== */}
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading} className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white inter-bold text-xs md:text-sm uppercase tracking-widest px-10 py-4 transition-colors cursor-pointer rounded-md shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] disabled:bg-gray-400 disabled:shadow-none">
            {loading ? "Updating Product..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;