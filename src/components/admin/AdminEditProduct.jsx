import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../../api/axios";
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
  const [variants, setVariants] = useState([]); // [{ color: "Red", size: "M", stock: 10 }]
  const [newVariant, setNewVariant] = useState({ color: "", size: "", stock: "" });

  // ডাটাবেস থেকে প্রোডাক্টের তথ্য এনে ফর্মে বসানো
  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setFormData({
          ...data,
          category: data.category?._id || data.category,
        });
        
        // যদি প্রোডাক্টের আগে থেকেই variants থাকে, সেটি সেভ করা
        if (data.variants && data.variants.length > 0) {
          setVariants(data.variants);
        }
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
  // Submit Logic
  // =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (variants.length < 1) {
      toast.error("Please add at least 1 product variant (Color/Size/Stock).");
      return;
    }

    setLoading(true);

    try {
      // Total stock হিসাব করা
      const totalStock = variants.reduce((acc, curr) => acc + curr.stock, 0);

      // Color এবং Size গুলোর ইউনিক লিস্ট তৈরি করা
      const uniqueColors = [...new Set(variants.map(v => v.color))];
      const uniqueSizes = [...new Set(variants.map(v => v.size))];

      const productData = {
        ...formData,
        variants: variants,
        totalStock: totalStock,
        colors: uniqueColors.join(', '),
        sizes: uniqueSizes.join(', ')
      };

      await api.put(`/api/products/${id}`, productData);
      
      setMessage({ type: "success", text: "Product updated successfully!" });
      window.scrollTo(0, 0);
      
      setTimeout(() => navigate('/admin/products'), 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update product." });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 p-3 text-sm inter-medium focus:border-blue-500 focus:outline-none transition-colors bg-white";
  const labelClass = "block text-[11px] inter-bold text-gray-400 uppercase tracking-widest mb-2";

  return (
    <div className="w-full max-w-5xl bg-white border border-gray-200 p-8 shadow-sm">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl inter-bold text-gray-800 uppercase tracking-widest">Edit Product</h2>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 border inter-bold text-sm uppercase tracking-wider ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
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
            <label className={labelClass}>Discount Price (৳)</label>
            <input type="number" name="discountPrice" value={formData.discountPrice || ""} onChange={handleTextChange} className={inputClass} />
          </div>
        </div>

        {/* ===================================== */}
        {/* Variant Manager (Same as Add Product) */}
        {/* ===================================== */}
        <div className="bg-gray-50 border border-gray-200 p-6 mt-8">
          <h4 className="text-[11px] inter-bold text-gray-800 uppercase tracking-widest mb-4">Manage Product Variants (Color, Size & Stock)</h4>
          
          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div className="flex-1 min-w-[150px]">
              <label className={labelClass}>Color</label>
              <input type="text" value={newVariant.color} onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })} placeholder="e.g. Black" className={inputClass} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className={labelClass}>Size</label>
              <input type="text" value={newVariant.size} onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })} placeholder="e.g. M" className={inputClass} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className={labelClass}>Stock Qty</label>
              <input type="number" value={newVariant.stock} onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })} placeholder="e.g. 10" className={inputClass} />
            </div>
            <button type="button" onClick={handleAddVariant} className="bg-gray-900 text-white inter-bold text-sm uppercase tracking-widest px-6 h-[46px] hover:bg-blue-600 transition-colors">Add</button>
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
                    <td className="p-3 border border-gray-200 inter-bold text-blue-600">{v.stock} pcs</td>
                    <td className="p-3 border border-gray-200 text-center">
                      <button type="button" onClick={() => handleRemoveVariant(idx)} className="text-red-500 inter-bold hover:underline cursor-pointer">Remove</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="2" className="p-3 border border-gray-200 inter-bold text-right uppercase text-[11px] tracking-widest">Total Stock:</td>
                  <td colSpan="2" className="p-3 border border-gray-200 inter-bold text-blue-600">
                    {variants.reduce((acc, curr) => acc + curr.stock, 0)} pcs
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        {/* ===================================== */}

        <div className="pt-6 mt-6 border-t border-gray-200">
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white inter-bold text-sm uppercase tracking-widest px-8 py-4 transition-colors cursor-pointer">
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;