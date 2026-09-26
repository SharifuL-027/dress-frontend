import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // ফর্ম স্টেট
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("");
  const [image, setImage] = useState("");

  // ক্যাটাগরি লোড করা
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/categories");
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories!");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Name লিখলে অটোমেটিক Slug তৈরি হওয়ার ফাংশন
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    // নাম থেকে স্পেস ও স্পেশাল ক্যারেক্টার সরিয়ে স্লাগ বানানো
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  };

  // নতুন ক্যাটাগরি অ্যাড করা
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return toast.error("Name and Slug are required!");
    
    setLoading(true);
    try {
      const payload = {
        name,
        slug,
        parent: parent || null, // ড্রপডাউন ফাঁকা থাকলে null যাবে (Main Category)
        image
      };

      const { data } = await api.post("/api/categories", payload);
      
      // নতুন ডেটা লিস্টে আপডেট করা (অটো রিফ্রেশ ছাড়া)
      fetchCategories(); 
      
      // ফর্ম ক্লিয়ার করা
      setName("");
      setSlug("");
      setParent("");
      setImage("");
      
      toast.success("Category created successfully! 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category 😔");
    } finally {
      setLoading(false);
    }
  };

  // ক্যাটাগরি ডিলিট করা (আপনার ব্যাকএন্ডে delete রাউট থাকতে হবে)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/api/categories/${id}`);
        setCategories(categories.filter((cat) => cat._id !== id));
        toast.success("Category deleted successfully! 🗑️");
      } catch (error) {
        toast.error("Failed to delete category!");
      }
    }
  };

  const inputClass = "w-full border border-gray-300 p-3 text-sm focus:border-red-500 focus:outline-none transition-colors bg-white";
  const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2";

  if (fetchLoading) return <div className="p-8 text-center font-bold text-gray-500 uppercase">Loading Categories...</div>;

  // ড্রপডাউনে দেখানোর জন্য শুধুমাত্র মেইন ক্যাটাগরিগুলো ফিল্টার করা
  const mainCategories = categories.filter(cat => !cat.parent);

  return (
    <div className="w-full bg-white border border-gray-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Left Side: Add Category Form */}
      <div className="md:col-span-1 border-r border-gray-100 md:pr-8">
        <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-200 pb-4">
          Add Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className={labelClass}>Category Name *</label>
            <input 
              type="text" 
              value={name} 
              onChange={handleNameChange} 
              required 
              className={inputClass} 
              placeholder="e.g. Winter Collection" 
            />
          </div>

          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <input 
              type="text" 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              required 
              className={inputClass} 
              placeholder="e.g. winter-collection" 
            />
          </div>

          <div>
            <label className={labelClass}>Parent Category</label>
            <select 
              value={parent} 
              onChange={(e) => setParent(e.target.value)} 
              className={inputClass}
            >
              <option value="">None (Main Category)</option>
              {mainCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 mt-1">Leave empty to create a Main Category.</p>
          </div>

          <div>
            <label className={labelClass}>Image URL (Optional)</label>
            <input 
              type="text" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              className={inputClass} 
              placeholder="https://example.com/image.jpg" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 transition-colors mt-4"
          >
            {loading ? "Saving..." : "Create Category"}
          </button>
        </form>
      </div>

      {/* Right Side: Category List */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest">All Categories</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your mega menu structure ({categories.length} found).</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4">Image</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Type / Parent</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No categories found.</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-10 h-10 object-cover border border-gray-200 rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center text-xs">N/A</div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-gray-800">{category.name}</p>
                      <p className="text-xs text-gray-400">/{category.slug}</p>
                    </td>
                    <td className="p-4">
                      {category.parent ? (
                        <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded">
                          Sub of: {category.parent.name}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-600 rounded">
                          Main Category
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(category._id)} 
                        className="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AdminCategories;