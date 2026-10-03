import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminAddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]); 
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "", 
    subCategory: "", 
    gender: "Unisex",
    brand: "",
    regularPrice: "",
    discountPrice: "",
    fabric: "",
    gsm: "",
    fitType: "",
    sleeveType: "",
    pattern: "",
    description: "",
    keyFeatures: "",
    sizeChart: "",
    washingInstructions: "Hand wash preferred. Do not bleach.",
    origin: "Bangladesh",
    deliveryInfo: "Inside Dhaka: 2-3 Days | Outside Dhaka: 3-5 Days",
    returnPolicy: "7 Days Return & Exchange Policy Applicable."
  });

  // =====================================
  // NEW: Variant Management State
  // =====================================
  const [variants, setVariants] = useState([]); // [{ color: "Red", size: "M", stock: 10 }]
  const [newVariant, setNewVariant] = useState({ color: "", size: "", stock: "" });

  const handleAddVariant = () => {
    if (!newVariant.color || !newVariant.size || !newVariant.stock) {
      toast.error("Please fill color, size, and stock to add a variant.");
      return;
    }
    
    // চেক করা যে এই কালার-সাইজ কম্বিনেশন আগে থেকেই আছে কিনা
    const exists = variants.find(v => v.color.toLowerCase() === newVariant.color.toLowerCase() && v.size.toLowerCase() === newVariant.size.toLowerCase());
    if (exists) {
      toast.error("This color and size combination already exists.");
      return;
    }

    setVariants([...variants, { ...newVariant, stock: Number(newVariant.stock) }]);
    setNewVariant({ color: "", size: "", stock: "" }); // ইনপুট ক্লিয়ার
  };

  const handleRemoveVariant = (indexToRemove) => {
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };
  // =====================================

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  const mainCategories = categories.filter(cat => !cat.parent);
  
  const availableSubCategories = categories.filter(cat => {
    if (!cat.parent || !formData.category) return false;
    const parentId = cat.parent._id ? cat.parent._id : cat.parent;
    return String(parentId) === String(formData.category);
  });

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData(prev => ({ ...prev, category: value, subCategory: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) {
      toast.error("You can upload a maximum of 6 images.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setVideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length < 1) {
      toast.error("Please upload at least 1 product image.");
      return;
    }
    if (variants.length < 1) {
      toast.error("Please add at least 1 product variant (Color/Size/Stock).");
      return;
    }

    setLoading(true);

    try {
      const cloudName = "wtbwxhmc"; 
      const uploadPreset = "dresstown"; 

      let uploadedImages = [];
      for (const pic of images) {
        const imageFormData = new FormData();
        imageFormData.append("file", pic);
        imageFormData.append("upload_preset", uploadPreset);

        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, imageFormData);
        uploadedImages.push({ url: res.data.secure_url, public_id: res.data.public_id });
      }

      let uploadedVideo = null;
      if (video) {
        const videoFormData = new FormData();
        videoFormData.append("file", video);
        videoFormData.append("upload_preset", uploadPreset);

        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, videoFormData);
        uploadedVideo = { url: res.data.secure_url, public_id: res.data.public_id };
      }

      const generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      
      // Total stock হিসাব করা
      const totalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);

      // Color এবং Size গুলোর ইউনিক লিস্ট তৈরি করা (যাতে ডিটেইলস পেজে ফিল্টার দেখানো যায়)
      const uniqueColors = [...new Set(variants.map(v => v.color))];
      const uniqueSizes = [...new Set(variants.map(v => v.size))];

      const productData = {
        ...formData,
        slug: generatedSlug,
        images: uploadedImages, 
        video: uploadedVideo || undefined,
        variants: variants,           // নতুন ভেরিয়েন্ট ডেটা
        totalStock: totalStock,       // মোট স্টক
        colors: uniqueColors.join(', '), // পুরোনো ফরম্যাট সাপোর্ট করার জন্য কমা দিয়ে জোড়া লাগানো
        sizes: uniqueSizes.join(', ')    // পুরোনো ফরম্যাট সাপোর্ট করার জন্য
      };

      await api.post('/api/products', productData); 
      
      toast.success("Product published successfully! 🎉");
      
      setFormData({ name: "", sku: "", category: "", subCategory: "", gender: "Unisex", brand: "", regularPrice: "", discountPrice: "", fabric: "", gsm: "", fitType: "", sleeveType: "", pattern: "", description: "", keyFeatures: "", sizeChart: "", washingInstructions: "Hand wash preferred. Do not bleach.", origin: "Bangladesh", deliveryInfo: "Inside Dhaka: 2-3 Days | Outside Dhaka: 3-5 Days", returnPolicy: "7 Days Return & Exchange Policy Applicable." }); 
      setVariants([]);
      setImages([]);
      setImagePreviews([]);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product 😔");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 p-3 text-sm inter-medium focus:border-red-500 focus:outline-none transition-colors bg-white";
  const labelClass = "block text-[11px] inter-bold text-gray-400 uppercase tracking-widest mb-2";
  const sectionTitleClass = "text-sm inter-bold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-200 pb-2";

  return (
    <div className="w-full max-w-5xl bg-white border border-gray-200 p-8 shadow-sm">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl inter-bold text-gray-800 uppercase tracking-widest">Add New Product</h2>
        <p className="text-sm inter-medium text-gray-500 mt-1">Fill all the required details below to list a new item.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* --- 1. Basic Information --- */}
        <div>
          <h3 className={sectionTitleClass}>1. Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className={labelClass}>Product Name *</label><input type="text" name="name" value={formData.name} onChange={handleTextChange} required className={inputClass} placeholder="e.g. Premium Cotton Panjabi" /></div>
            <div><label className={labelClass}>Product Code / SKU *</label><input type="text" name="sku" value={formData.sku} onChange={handleTextChange} required className={inputClass} placeholder="e.g. PNJ-2026-BLK" /></div>
            <div><label className={labelClass}>Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleTextChange} className={inputClass} placeholder="e.g. DressTown Exclusives" /></div>
          </div>
        </div>

        {/* --- 2. Categorization --- */}
        <div>
          <h3 className={sectionTitleClass}>2. Categorization</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Main Category *</label>
              <select name="category" value={formData.category} onChange={handleTextChange} required className={inputClass}>
                <option value="">Select Category</option>
                {mainCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Subcategory</label>
              <select name="subCategory" value={formData.subCategory} onChange={handleTextChange} className={inputClass}>
                <option value="">{!formData.category ? "Select Main Category First" : availableSubCategories.length === 0 ? "No subcategories found" : "Select Subcategory"}</option>
                {availableSubCategories.map(subCat => <option key={subCat._id} value={subCat._id}>{subCat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleTextChange} className={inputClass}>
                <option value="Men">Men</option><option value="Women">Women</option><option value="Boys">Boys</option><option value="Girls">Girls</option><option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- 3. Pricing & Variants (NEW) --- */}
        <div>
          <h3 className={sectionTitleClass}>3. Pricing & Inventory Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div><label className={labelClass}>Regular Price (৳) *</label><input type="number" name="regularPrice" value={formData.regularPrice} onChange={handleTextChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Discount Price (৳)</label><input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleTextChange} className={inputClass} placeholder="Optional" /></div>
          </div>

          {/* Variant Manager */}
          <div className="bg-gray-50 border border-gray-200 p-6">
            <h4 className="text-[11px] inter-bold text-gray-800 uppercase tracking-widest mb-4">Add Product Variants (Color, Size & Stock)</h4>
            
            <div className="flex flex-wrap gap-4 items-end mb-6">
              <div className="flex-1 min-w-[150px]"><label className={labelClass}>Color</label><input type="text" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} placeholder="e.g. Black" className={inputClass} /></div>
              <div className="flex-1 min-w-[150px]"><label className={labelClass}>Size</label><input type="text" value={newVariant.size} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} placeholder="e.g. M" className={inputClass} /></div>
              <div className="flex-1 min-w-[150px]"><label className={labelClass}>Stock Qty</label><input type="number" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} placeholder="e.g. 10" className={inputClass} /></div>
              <button type="button" onClick={handleAddVariant} className="bg-gray-900 text-white inter-bold text-sm uppercase tracking-widest px-6 h-[46px] hover:bg-red-600 transition-colors">Add</button>
            </div>

            {/* Variants Table */}
            {variants.length > 0 && (
              <table className="w-full text-left text-sm border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-100 uppercase text-[10px] tracking-widest text-gray-500">
                    <th className="p-3 border border-gray-200 inter-bold">Color</th>
                    <th className="p-3 border border-gray-200 inter-bold">Size</th>
                    <th className="p-3 border border-gray-200 inter-bold">Stock</th>
                    <th className="p-3 border border-gray-200 text-center inter-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => (
                    <tr key={idx}>
                      <td className="p-3 border border-gray-200 inter-bold">{v.color}</td>
                      <td className="p-3 border border-gray-200 inter-bold">{v.size}</td>
                      <td className="p-3 border border-gray-200 inter-bold text-red-600">{v.stock} pcs</td>
                      <td className="p-3 border border-gray-200 text-center"><button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 inter-bold hover:underline">Remove</button></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan="2" className="p-3 border border-gray-200 inter-bold text-right uppercase text-[11px] tracking-widest">Total Stock:</td>
                    <td colSpan="2" className="p-3 border border-gray-200 inter-bold text-red-600">{variants.reduce((acc, curr) => acc + curr.stock, 0)} pcs</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* --- 4. Product Specifications --- */}
        <div>
          <h3 className={sectionTitleClass}>4. Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className={labelClass}>Fabric / Material</label><input type="text" name="fabric" value={formData.fabric} onChange={handleTextChange} className={inputClass} placeholder="e.g. 100% Cotton" /></div>
            <div><label className={labelClass}>GSM</label><input type="text" name="gsm" value={formData.gsm} onChange={handleTextChange} className={inputClass} placeholder="e.g. 160 GSM" /></div>
            <div><label className={labelClass}>Fit Type</label><input type="text" name="fitType" value={formData.fitType} onChange={handleTextChange} className={inputClass} placeholder="e.g. Slim Fit, Regular" /></div>
            <div><label className={labelClass}>Sleeve Type</label><input type="text" name="sleeveType" value={formData.sleeveType} onChange={handleTextChange} className={inputClass} placeholder="e.g. Full Sleeve, Half" /></div>
            <div><label className={labelClass}>Pattern / Design</label><input type="text" name="pattern" value={formData.pattern} onChange={handleTextChange} className={inputClass} placeholder="e.g. Solid, Printed, Check" /></div>
            <div><label className={labelClass}>Country of Origin</label><input type="text" name="origin" value={formData.origin} onChange={handleTextChange} className={inputClass} /></div>
          </div>
        </div>

        {/* --- 5. Detailed Description --- */}
        <div>
          <h3 className={sectionTitleClass}>5. Details & Policies</h3>
          <div className="space-y-6">
            <div><label className={labelClass}>Product Description</label><textarea name="description" value={formData.description} onChange={handleTextChange} rows="3" className={inputClass}></textarea></div>
            <div><label className={labelClass}>Key Features (Bullet points)</label><textarea name="keyFeatures" value={formData.keyFeatures} onChange={handleTextChange} rows="3" className={inputClass} placeholder="- 100% Export Quality&#10;- Color Guarantee"></textarea></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelClass}>Size Chart Info</label><textarea name="sizeChart" value={formData.sizeChart} onChange={handleTextChange} rows="2" className={inputClass} placeholder="M: Chest 38, Length 28..."></textarea></div>
              <div><label className={labelClass}>Washing Instructions</label><textarea name="washingInstructions" value={formData.washingInstructions} onChange={handleTextChange} rows="2" className={inputClass}></textarea></div>
              <div><label className={labelClass}>Delivery Information</label><textarea name="deliveryInfo" value={formData.deliveryInfo} onChange={handleTextChange} rows="2" className={inputClass}></textarea></div>
              <div><label className={labelClass}>Return & Exchange Policy</label><textarea name="returnPolicy" value={formData.returnPolicy} onChange={handleTextChange} rows="2" className={inputClass}></textarea></div>
            </div>
          </div>
        </div>

        {/* --- 6. Media Upload --- */}
        <div>
          <h3 className={sectionTitleClass}>6. Product Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-300 p-6 bg-gray-50 text-center relative group hover:border-red-500 transition-colors">
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">📸</span>
                <p className="text-sm inter-bold text-gray-700">Upload Images *</p>
                <p className="text-[11px] inter-medium text-gray-400 uppercase tracking-wider">Min 1, Max 6 Images</p>
              </div>
            </div>
            <div className="border border-gray-300 p-6 bg-gray-50 text-center relative group hover:border-red-500 transition-colors">
              <input type="file" accept="video/*" onChange={handleVideoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🎥</span>
                <p className="text-sm inter-bold text-gray-700">{video ? video.name : "Upload Video"}</p>
                <p className="text-[11px] inter-medium text-gray-400 uppercase tracking-wider">Optional, Max 1 File</p>
              </div>
            </div>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] inter-bold text-gray-400 uppercase tracking-widest mb-3">Selected Images ({imagePreviews.length}/6)</p>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative w-24 h-24 border border-gray-200 group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs inter-bold">X</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-8 mt-8 border-t border-gray-200 flex gap-4">
          <button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 text-white inter-bold text-sm uppercase tracking-widest px-8 py-4 w-full md:w-auto transition-colors">
            {loading ? "Publishing Product..." : "Publish Product"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminAddProduct;