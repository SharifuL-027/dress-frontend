import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AdminEditProduct = () => {
  const { id } = useParams(); // URL থেকে প্রোডাক্টের আইডি নিবে
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // সব ফিল্ডের স্টেট
  const [formData, setFormData] = useState({
    name: "", sku: "", category: "", subCategory: "", gender: "", brand: "",
    regularPrice: "", discountPrice: "", stock: "", sizes: "", colors: "",
    fabric: "", gsm: "", fitType: "", sleeveType: "", pattern: "", description: "",
    keyFeatures: "", sizeChart: "", washingInstructions: "", origin: "", deliveryInfo: "", returnPolicy: ""
  });

  // ডাটাবেস থেকে প্রোডাক্টের তথ্য এনে ফর্মে বসানো
  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        // Array গুলোকে কমা (,) দিয়ে String এ রূপান্তর করে ফর্মে বসানো
        setFormData({
          ...data,
          category: data.category?._id || data.category, // পপুলেট থাকলে শুধু আইডি নিবে
          sizes: data.sizes ? data.sizes.join(", ") : "",
          colors: data.colors ? data.colors.join(", ") : ""
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ডেটা আপডেট করার API কল (PUT request)
      await api.put(`/api/products/${id}`, formData);
      setMessage({ type: "success", text: "Product updated successfully!" });
      window.scrollTo(0, 0);
      
      // ২ সেকেন্ড পর প্রোডাক্ট লিস্ট পেজে পাঠিয়ে দিবে
      setTimeout(() => navigate('/admin/products'), 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update product." });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors bg-white";
  const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2";

  return (
    <div className="w-full max-w-5xl bg-white border border-gray-200 p-8 shadow-sm">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-widest">Edit Product</h2>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 border font-bold text-sm uppercase tracking-wider ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* শুধুমাত্র বেসিক কয়েকটি ফিল্ড উদাহরণস্বরূপ দিলাম (আপনি আপনার AdminAddProduct এর মতো বাকি সব ফিল্ড এখানে বসিয়ে নিবেন) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className={labelClass}>Available Stock</label>
            <input type="number" name="stock" value={formData.stock || ""} onChange={handleTextChange} required className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Available Sizes (Comma separated)</label>
            <input type="text" name="sizes" value={formData.sizes || ""} onChange={handleTextChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Available Colours (Comma separated)</label>
            <input type="text" name="colors" value={formData.colors || ""} onChange={handleTextChange} className={inputClass} />
          </div>
        </div>
        {/* Note: AdminAddProduct.jsx এর বাকি ফিল্ডগুলো হুবহু এখানে কপি করে বসাতে পারবেন, Value হিসেবে শুধু formData.propertyName দিয়ে দিবেন */}

        <div className="pt-6 mt-6 border-t border-gray-200">
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 transition-colors">
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;