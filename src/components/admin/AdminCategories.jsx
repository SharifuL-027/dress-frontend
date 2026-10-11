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
  const [sortOrder, setSortOrder] = useState(0);
  
  // Edit State (নতুন: কোন ক্যাটাগরি এডিট হচ্ছে তা ট্র্যাক করার জন্য)
  const [editId, setEditId] = useState(null);

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

  // Name লিখলে অটোমেটিক Slug তৈরি হওয়ার ফাংশন
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    
    // যদি এডিট মোডে না থাকে, তবেই অটো স্লাগ তৈরি হবে
    if (!editId) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  // ক্যাটাগরি এডিট বাটনে ক্লিক করলে ফর্ম ফিলআপ হবে
  const handleEdit = (category) => {
    setEditId(category._id);
    setName(category.name);
    setSlug(category.slug);
    setParent(category.parent?._id || category.parent || "");
    setImage(category.image || "");
    setSortOrder(category.sortOrder || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ক্লিক করলে পেজের উপরে চলে যাবে
  };

  // ফর্ম ক্লিয়ার করার ফাংশন
  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setParent("");
    setImage("");
    setSortOrder(0);
  };

  // নতুন ক্যাটাগরি অ্যাড বা আপডেট করা
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return toast.error("Name and Slug are required!");
    
    setLoading(true);
    try {
      const payload = {
        name,
        slug,
        parent: parent || null, 
        image,
        sortOrder
      };

      if (editId) {
        // Edit Mode: আপডেট API কল হবে
        await api.put(`/api/categories/${editId}`, payload);
        toast.success("Category updated successfully! ✅");
      } else {
        // Create Mode: নতুন তৈরি হবে
        await api.post("/api/categories", payload);
        toast.success("Category created successfully! 🎉");
      }
      
      fetchCategories(); 
      resetForm();
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category 😔");
    } finally {
      setLoading(false);
    }
  };

  // ক্যাটাগরি ডিলিট করা
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/api/categories/${id}`);
        setCategories(categories.filter((cat) => cat._id !== id));
        toast.success("Category deleted successfully! 🗑️");
        if(editId === id) resetForm(); // এডিট করা অবস্থায় ডিলিট করলে ফর্ম ক্লিয়ার হবে
      } catch (error) {
        toast.error("Failed to delete category!");
      }
    }
  };

  const inputClass = "w-full border border-gray-300 p-3 text-sm inter-medium focus:border-red-500 focus:outline-none transition-colors bg-white";
  const labelClass = "block text-[11px] inter-bold text-gray-400 uppercase tracking-widest mb-2";

  if (fetchLoading) return <div className="p-8 text-center inter-bold text-gray-500 uppercase">Loading Categories...</div>;

  // ================= SMART SORTING LOGIC =================
  const sortCategoriesLogic = (cats) => {
    return [...cats].sort((a, b) => {
      const orderA = a.sortOrder || 0;
      const orderB = b.sortOrder || 0;

      if (orderA > 0 && orderB > 0) return orderA - orderB;
      if (orderA > 0 && orderB === 0) return -1;
      if (orderB > 0 && orderA === 0) return 1;

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  };

  const mainCategories = categories.filter(cat => !cat.parent);
  const sortedMainCategories = sortCategoriesLogic(mainCategories);

  const displayCategories = [];

  sortedMainCategories.forEach(main => {
    displayCategories.push(main); 
    
    const subCats = categories.filter(cat => {
      const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent;
      return parentId === main._id;
    });

    const sortedSubCats = sortCategoriesLogic(subCats);
    displayCategories.push(...sortedSubCats);
  });

  const groupedIds = new Set(displayCategories.map(c => c._id));
  const orphans = categories.filter(c => !groupedIds.has(c._id));
  displayCategories.push(...sortCategoriesLogic(orphans));
  // =======================================================

  return (
    <div className="w-full bg-white border border-gray-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Left Side: Add/Edit Category Form */}
      <div className="md:col-span-1 border-r border-gray-100 md:pr-8">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl inter-bold text-gray-800 uppercase tracking-widest">
            {editId ? "Edit Category" : "Add Category"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-[10px] inter-bold bg-gray-100 px-3 py-1 text-gray-600 hover:bg-gray-200 uppercase tracking-wider cursor-pointer">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Category Name *</label>
            <input type="text" value={name} onChange={handleNameChange} required className={inputClass} placeholder="e.g. Winter Collection" />
          </div>

          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputClass} placeholder="e.g. winter-collection" />
          </div>

          <div>
            <label className={labelClass}>Parent Category</label>
            <select value={parent} onChange={(e) => setParent(e.target.value)} className={inputClass}>
              <option value="">None (Main Category)</option>
              {sortedMainCategories.map(cat => (
                <option key={cat._id} value={cat._id} disabled={cat._id === editId}>{cat.name}</option> // নিজে নিজের প্যারেন্ট হতে পারবে না
              ))}
            </select>
            <p className="text-[10px] inter-medium text-gray-400 mt-1">Leave empty to create a Main Category.</p>
          </div>

          <div>
            <label className={labelClass}>Display Position</label>
            <input 
              type="number" 
              value={sortOrder} 
              onChange={(e) => setSortOrder(Number(e.target.value))} 
              className={inputClass} 
              placeholder="e.g. 1" 
              min="0"
            />
            <p className="text-[10px] inter-medium text-gray-400 mt-1">1 = First, 2 = Second. Leave 0 to show at top (Newest).</p>
          </div>

          <div>
            <label className={labelClass}>Image URL (Optional)</label>
            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="https://example.com/image.jpg" />
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white inter-bold text-sm uppercase tracking-widest px-6 py-3 transition-colors mt-4 cursor-pointer shadow-sm ${editId ? 'bg-black hover:bg-gray-800' : 'bg-red-500 hover:bg-red-600'}`}>
            {loading ? "Saving..." : editId ? "Update Category" : "Create Category"}
          </button>
        </form>
      </div>

      {/* Right Side: Category List */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl inter-bold text-gray-800 uppercase tracking-widest">All Categories</h2>
            <p className="text-sm inter-medium text-gray-500 mt-1">Manage your mega menu structure ({categories.length} found).</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-[11px] inter-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4">Image</th>
                <th className="p-4">Category Name</th>
                <th className="p-4">Pos</th>
                <th className="p-4">Type / Parent</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center inter-medium text-gray-500">No categories found.</td>
                </tr>
              ) : (
                displayCategories.map((category) => {
                  const isSub = !!category.parent; 
                  const isEditing = editId === category._id;
                  
                  return (
                    <tr key={category._id} className={`border-b border-gray-100 transition-colors ${isEditing ? 'bg-blue-50/50 border-blue-200' : isSub ? 'bg-gray-50/40 hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-10 h-10 object-cover border border-gray-200 rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center text-xs inter-medium">N/A</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isSub && <span className="text-gray-300 ml-2 inter-bold text-lg">↳</span>}
                          <div>
                            <p className={`inter-bold text-sm ${isSub ? 'text-gray-600' : 'text-gray-900'}`}>{category.name}</p>
                            <p className="text-xs inter-medium text-gray-400">/{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] inter-bold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded">
                          {category.sortOrder > 0 ? `#${category.sortOrder}` : '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        {category.parent ? (
                          <span className="text-[10px] inter-bold px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase tracking-wider">
                            Sub of: {category.parent.name}
                          </span>
                        ) : (
                          <span className="text-[10px] inter-bold px-2 py-1 bg-green-50 text-green-700 rounded uppercase tracking-wider">
                            Main Category
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 inter-bold text-[11px] uppercase tracking-wider cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-800 inter-bold text-[11px] uppercase tracking-wider cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AdminCategories;