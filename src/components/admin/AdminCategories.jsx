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
  
  // Edit State
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
        if(editId === id) resetForm(); 
      } catch (error) {
        toast.error("Failed to delete category!");
      }
    }
  };

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

  // ================= PREMIUN RESPONSIVE CLASSES =================
  const inputClass = "w-full border border-gray-300 p-3 text-[13px] md:text-sm inter-medium focus:border-red-500 focus:outline-none transition-colors bg-white rounded-sm";
  const labelClass = "block text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2";
  // ==============================================================

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-6 md:mb-8 pb-4 md:pb-5 border-b border-gray-200">
        <h2 className="text-xl md:text-2xl inter-bold text-gray-800 uppercase tracking-widest">Manage Categories</h2>
        <p className="text-[11px] md:text-sm text-gray-500 mt-1 md:mt-1.5 inter-medium">Organize your store's mega menu and product categorization.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
        
        {/* ================= LEFT: ADD/EDIT CATEGORY FORM ================= */}
        <div className="w-full xl:w-100 shrink-0">
          <div className="bg-white border border-gray-200 p-5 md:p-6 shadow-sm xl:sticky top-24 rounded-sm">
            <div className="flex justify-between items-center mb-5 md:mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-[13px] md:text-sm inter-bold text-gray-900 uppercase tracking-widest">
                {editId ? "Edit Category" : "Add Category"}
              </h3>
              {editId && (
                <button onClick={resetForm} className="text-[9px] md:text-[10px] inter-bold bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 uppercase tracking-wider cursor-pointer rounded-sm">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    <option key={cat._id} value={cat._id} disabled={cat._id === editId}>{cat.name}</option> 
                  ))}
                </select>
                <p className="text-[9px] md:text-[10px] inter-medium text-gray-400 mt-1.5">Leave empty to create a Main Category.</p>
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
                <p className="text-[9px] md:text-[10px] inter-medium text-gray-400 mt-1.5">1 = First, 2 = Second. Leave 0 to show at top (Newest).</p>
              </div>

              <div>
                <label className={labelClass}>Image URL (Optional)</label>
                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} placeholder="https://example.com/image.jpg" />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full text-white inter-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-3.5 md:py-4 transition-colors cursor-pointer mt-2 md:mt-4 rounded-sm shadow-sm ${editId ? 'bg-black hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loading ? "Saving..." : editId ? "Update Category" : "Create Category"}
              </button>
            </form>
          </div>
        </div>

        {/* ================= RIGHT: CATEGORY LIST ================= */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 p-5 md:p-6 shadow-sm rounded-sm">
            <h3 className="text-[13px] md:text-sm inter-bold text-gray-900 uppercase tracking-widest mb-5 md:mb-6 border-b border-gray-100 pb-3 flex justify-between items-center">
              <span>All Categories <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm ml-2 text-[10px]">{categories.length}</span></span>
            </h3>

            <div className="overflow-x-auto rounded-sm border border-gray-200">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[9px] md:text-[10px] inter-bold text-gray-500 uppercase tracking-widest">
                    <th className="p-3 md:p-4 whitespace-nowrap">Image</th>
                    <th className="p-3 md:p-4 whitespace-nowrap">Category Name</th>
                    <th className="p-3 md:p-4 whitespace-nowrap">Pos</th>
                    <th className="p-3 md:p-4 whitespace-nowrap">Type / Parent</th>
                    <th className="p-3 md:p-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm">
                  {fetchLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 md:p-12 text-center text-[10px] md:text-xs inter-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Categories...</td>
                    </tr>
                  ) : displayCategories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 md:p-16 text-center">
                        <span className="text-3xl md:text-4xl block mb-3 opacity-50">📂</span>
                        <p className="text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest">No categories found.</p>
                      </td>
                    </tr>
                  ) : (
                    displayCategories.map((category) => {
                      const isSub = !!category.parent; 
                      const isEditing = editId === category._id;
                      
                      return (
                        <tr key={category._id} className={`border-b border-gray-100 transition-colors ${isEditing ? 'bg-blue-50/50 border-blue-200' : isSub ? 'bg-gray-50/40 hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                          
                          <td className="p-3 md:p-4">
                            {category.image ? (
                              <img src={category.image} alt={category.name} className="w-8 h-8 md:w-10 md:h-10 object-cover border border-gray-200 rounded-sm" />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] md:text-xs inter-medium rounded-sm">N/A</div>
                            )}
                          </td>
                          
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              {isSub && <span className="text-gray-300 ml-1 md:ml-2 inter-bold text-base md:text-lg">↳</span>}
                              <div className="min-w-0">
                                <p className={`inter-bold text-xs md:text-sm truncate ${isSub ? 'text-gray-700' : 'text-gray-900'}`}>{category.name}</p>
                                <p className="text-[9px] md:text-[10px] inter-medium text-gray-400 truncate mt-0.5">/{category.slug}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-3 md:p-4">
                            <span className="text-[10px] md:text-[11px] inter-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 md:px-2.5 md:py-1 rounded-sm">
                              {category.sortOrder > 0 ? `#${category.sortOrder}` : '-'}
                            </span>
                          </td>
                          
                          <td className="p-3 md:p-4">
                            {category.parent ? (
                              <span className="text-[9px] md:text-[10px] inter-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-sm uppercase tracking-wider whitespace-nowrap">
                                Sub of: <span className="text-gray-800">{category.parent.name}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] md:text-[10px] inter-bold px-2 py-1 bg-green-50 text-green-700 rounded-sm uppercase tracking-wider whitespace-nowrap">
                                Main Category
                              </span>
                            )}
                          </td>
                          
                          <td className="p-3 md:p-4 text-right">
                            <div className="flex justify-end gap-2 md:gap-3">
                              <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 inter-bold text-[10px] md:text-[11px] uppercase tracking-wider cursor-pointer">
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => handleDelete(category._id)} className="text-red-500 hover:text-red-700 inter-bold text-[10px] md:text-[11px] uppercase tracking-wider cursor-pointer">
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

      </div>
    </div>
  );
};

export default AdminCategories;