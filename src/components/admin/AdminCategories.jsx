import { useState, useEffect } from "react";
import api from "../../api/axios";
import axios from "axios";
import toast from "react-hot-toast";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [editId, setEditId] = useState(null);

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

  // Clean Slug Generator (Removes quotes properly)
  const generateCleanSlug = (text) => {
    return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  // ================================================================
  // 🚀 AUTOMATED 3-LEVEL SEED SCRIPT (ONLY FOR KIDS)
  // ================================================================
  const handleSeedKids = async () => {
    if(!window.confirm("Are you sure? This will add the complete 3-Level Kids' Category Tree.")) return;
    
    setLoading(true);

    const tree = {
      main: "Kids",
      subs: [
        { 
          name: "Boys", 
          subSubs: [
            "Boys' T-Shirt", "Boys' Polo Shirt", "Boys' Shirt", "Boys' Denim Pants", 
            "Boys' Twill Pants", "Boys' Cargo Pants", "Boys' Shorts", "Boys' Co-Ord Set", 
            "Boys' Hoodie", "Boys' Jacket", "Boys' Panjabi Set"
          ] 
        },
        { 
          name: "Girls", 
          subSubs: [
            "Girls' T-Shirt", "Girls' Tops", "Girls' Frock", "Girls' Dress", 
            "Girls' Denim Pants", "Girls' Leggings", "Girls' Winter Collection"
          ] // আপনি চাইলে কোডের এই জায়গাটি পরিবর্তন করে নিতে পারেন
        }
      ]
    };

    try {
      // 1. Create Main Category (Sort order 3, so it shows after Men & Women)
      const mainRes = await api.post('/api/categories', { name: tree.main, slug: generateCleanSlug(tree.main), parent: null, sortOrder: 3 });
      const mainId = mainRes.data._id || mainRes.data.category?._id || mainRes.data.data?._id;

      // 2. Create Sub and Sub-Sub Categories
      for (const sub of tree.subs) {
        const subRes = await api.post('/api/categories', { name: sub.name, slug: generateCleanSlug(`kids-${sub.name}`), parent: mainId, sortOrder: 0 });
        const subId = subRes.data._id || subRes.data.category?._id || subRes.data.data?._id;

        for (const subSub of sub.subSubs) {
          await api.post('/api/categories', { name: subSub, slug: generateCleanSlug(`kids-${sub.name}-${subSub}`), parent: subId, sortOrder: 0 });
        }
      }
      toast.success("Kids' 3-level categories inserted successfully! 🎉");
      fetchCategories(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to seed categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!editId) {
      setSlug(generateCleanSlug(val));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (category) => {
    setEditId(category._id);
    setName(category.name);
    setSlug(category.slug);
    
    let parentId = "";
    if (category.parent) {
      parentId = typeof category.parent === 'object' ? category.parent._id : category.parent;
    }
    setParent(parentId);
    setSortOrder(category.sortOrder || 0);
    
    const imgUrl = category.image?.url || category.image || "";
    setExistingImageUrl(imgUrl);
    setImagePreview(imgUrl || null);
    setImageFile(null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setParent("");
    setSortOrder(0);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return toast.error("Name and Slug are required!");
    
    setLoading(true);
    try {
      let finalImageUrl = existingImageUrl;
      if (imageFile) {
        const cloudName = "wtbwxhmc"; 
        const uploadPreset = "dresstown"; 
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);
        imageFormData.append("upload_preset", uploadPreset);
        const cloudinaryRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, imageFormData);
        finalImageUrl = cloudinaryRes.data.secure_url;
      }

      const payload = { name, slug, parent: parent || null, image: finalImageUrl, sortOrder };

      if (editId) {
        await api.put(`/api/categories/${editId}`, payload);
        toast.success("Category updated successfully! ✅");
      } else {
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

  // 3-LEVEL LOGIC
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
    displayCategories.push({ ...main, level: 1 }); 
    const subCats = categories.filter(cat => {
      const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent;
      return parentId === main._id;
    });
    const sortedSubCats = sortCategoriesLogic(subCats);
    
    sortedSubCats.forEach(sub => {
        displayCategories.push({ ...sub, level: 2, parentName: main.name });
        const subSubCats = categories.filter(cat => {
            const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent;
            return parentId === sub._id;
        });
        const sortedSubSubCats = sortCategoriesLogic(subSubCats);
        sortedSubSubCats.forEach(subSub => {
             displayCategories.push({ ...subSub, level: 3, parentName: sub.name, grandParentName: main.name });
        });
    });
  });

  const groupedIds = new Set(displayCategories.map(c => c._id));
  const orphans = categories.filter(c => !groupedIds.has(c._id));
  if(orphans.length > 0) {
     displayCategories.push(...sortCategoriesLogic(orphans).map(o => ({...o, level: 4})));
  }

  const dropdownOptions = [];
  sortedMainCategories.forEach(main => {
      dropdownOptions.push({ id: main._id, name: main.name, type: 'Main' });
      const subCats = categories.filter(cat => {
        const parentId = typeof cat.parent === 'object' ? cat.parent?._id : cat.parent;
        return parentId === main._id;
      });
      sortCategoriesLogic(subCats).forEach(sub => {
           dropdownOptions.push({ id: sub._id, name: `↳ ${sub.name} (Sub of ${main.name})`, type: 'Sub' });
      })
  });

  const inputClass = "w-full border border-gray-300 p-3 text-[13px] md:text-sm inter-medium focus:border-red-500 focus:outline-none transition-colors bg-white rounded-sm";
  const labelClass = "block text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2";

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-gray-50/50 min-h-screen">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-6 md:mb-8 pb-4 md:pb-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl inter-bold text-gray-800 uppercase tracking-widest">Manage Categories</h2>
          <p className="text-[11px] md:text-sm text-gray-500 mt-1 md:mt-1.5 inter-medium">Organize your store's mega menu and 3-level product categorization.</p>
        </div>
        
        {/* MAGIC SEED BUTTON FOR KIDS */}
        <button 
          onClick={handleSeedKids} 
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-sm text-xs inter-bold uppercase tracking-widest cursor-pointer hover:bg-blue-700 shadow-md transition-colors"
        >
          {loading ? "Inserting..." : "🚀 Auto Insert Kids' List"}
        </button>
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
                <button type="button" onClick={resetForm} className="text-[9px] md:text-[10px] inter-bold bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 uppercase tracking-wider cursor-pointer rounded-sm">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Category Name *</label>
                <input type="text" value={name} onChange={handleNameChange} required className={inputClass} placeholder="e.g. Graphic T-Shirt" />
              </div>

              <div>
                <label className={labelClass}>Slug (URL) *</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputClass} placeholder="e.g. graphic-t-shirt" />
              </div>

              <div>
                <label className={labelClass}>Parent Category</label>
                <select value={parent} onChange={(e) => setParent(e.target.value)} className={inputClass}>
                  <option value="">None (Make this a Main Category)</option>
                  {dropdownOptions.map(opt => (
                    <option key={opt.id} value={opt.id} disabled={opt.id === editId}>{opt.name}</option> 
                  ))}
                </select>
                <p className="text-[9px] md:text-[10px] inter-medium text-gray-400 mt-1.5">
                   Select a Main category to make a Sub-category. Select a Sub-category to make a Sub-Sub-category.
                </p>
              </div>

              <div>
                <label className={labelClass}>Display Position</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputClass} placeholder="e.g. 1" min="0" />
              </div>

              <div>
                <label className={labelClass}>Category Image</label>
                <div className="border-2 border-dashed border-gray-300 p-4 md:p-6 text-center relative group hover:border-red-500 transition-colors bg-gray-50 rounded-sm cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-24 md:max-h-32 mx-auto object-contain rounded-sm" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-2xl md:text-3xl text-gray-400">🖼️</span>
                      <p className="text-xs md:text-sm inter-bold text-gray-700">Upload Image</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full text-white inter-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-3.5 md:py-4 transition-colors cursor-pointer mt-2 md:mt-4 rounded-sm shadow-sm ${editId ? 'bg-black hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'}`}>
                {loading ? "Working..." : editId ? "Update Category" : "Create Category"}
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
                    <th className="p-3 md:p-4 whitespace-nowrap">Type / Structure</th>
                    <th className="p-3 md:p-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm">
                  {fetchLoading ? (
                    <tr><td colSpan="4" className="p-8 text-center animate-pulse">Loading...</td></tr>
                  ) : displayCategories.length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center">No categories found.</td></tr>
                  ) : (
                    displayCategories.map((category) => {
                      const level = category.level;
                      const isEditing = editId === category._id;
                      const imgUrl = category.image?.url || category.image;

                      return (
                        <tr key={category._id} className={`border-b border-gray-100 transition-colors ${isEditing ? 'bg-blue-50/50 border-blue-200' : level > 1 ? 'bg-gray-50/40 hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                          <td className="p-3 md:p-4">
                            {imgUrl ? <img src={imgUrl} className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-sm" /> : <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 border text-gray-400 flex items-center justify-center rounded-sm">N/A</div>}
                          </td>
                          <td className="p-3 md:p-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              {level === 2 && <span className="text-gray-400 ml-2 inter-bold text-lg">↳</span>}
                              {level === 3 && <span className="text-red-400 ml-6 inter-bold text-lg">↳</span>}
                              <div className="min-w-0">
                                <p className={`inter-bold text-xs md:text-sm truncate ${level === 1 ? 'text-gray-900' : level === 2 ? 'text-gray-700' : 'text-gray-600'}`}>{category.name}</p>
                                <p className="text-[9px] md:text-[10px] inter-medium text-gray-400 truncate mt-0.5">/{category.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 md:p-4">
                            {level === 1 ? <span className="text-[9px] inter-bold px-2 py-1 bg-green-50 text-green-700 rounded-sm uppercase tracking-wider">Main Category</span> : 
                             level === 2 ? <span className="text-[9px] inter-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-sm uppercase tracking-wider">Sub of: {category.parentName}</span> : 
                             <span className="text-[9px] inter-bold px-2 py-1 bg-purple-50 text-purple-600 rounded-sm uppercase tracking-wider">Sub-Sub of: {category.parentName}</span>}
                          </td>
                          <td className="p-3 md:p-4 text-right">
                            <div className="flex justify-end gap-2 md:gap-3">
                              <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 inter-bold text-[10px] uppercase cursor-pointer">Edit</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => handleDelete(category._id)} className="text-red-500 hover:text-red-700 inter-bold text-[10px] uppercase cursor-pointer">Delete</button>
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