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

  // Clean Slug Generator
  const generateCleanSlug = (text) => {
    return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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

  // 3-LEVEL LOGIC (Unchanged)
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

  // ================= PREMIUM UI CLASSES =================
  const inputClass = "w-full border border-gray-300 p-3.5 text-sm inter-medium focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none transition-all bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-md";
  const labelClass = "block text-[11px] md:text-xs inter-bold text-gray-600 uppercase tracking-widest mb-2";

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 bg-[#f8f9fa] min-h-screen">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-8 md:mb-10 pb-5 border-b border-gray-200">
        <h2 className="text-2xl md:text-3xl inter-bold text-gray-900 uppercase tracking-wider">Categories</h2>
        <p className="text-xs md:text-sm text-gray-500 mt-2 inter-medium">Manage your store's mega menu and 3-level product categorization structure.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* ================= LEFT: ADD/EDIT CATEGORY FORM ================= */}
        <div className="w-full xl:w-[400px] shrink-0">
          <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl xl:sticky top-24">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-sm md:text-base inter-bold text-gray-900 uppercase tracking-wider">
                {editId ? "Edit Category" : "Add New Category"}
              </h3>
              {editId && (
                <button type="button" onClick={resetForm} className="text-[10px] inter-bold bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 uppercase tracking-wider cursor-pointer rounded-md transition-colors">
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={labelClass}>Category Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={handleNameChange} required className={inputClass} placeholder="e.g. Graphic T-Shirt" />
              </div>

              <div>
                <label className={labelClass}>Slug (URL) <span className="text-red-500">*</span></label>
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
                <p className="text-[10px] inter-medium text-gray-400 mt-2 leading-relaxed">
                   Select a <span className="text-gray-600 font-bold">Main category</span> to make a Sub-category. Select a <span className="text-gray-600 font-bold">Sub-category</span> to make a Sub-Sub-category.
                </p>
              </div>

              <div>
                <label className={labelClass}>Display Position</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputClass} placeholder="e.g. 1" min="0" />
              </div>

              <div>
                <label className={labelClass}>Category Image</label>
                <div className="border-2 border-dashed border-gray-300 p-6 text-center relative group hover:border-gray-900 transition-colors bg-gray-50 hover:bg-gray-50/50 rounded-lg cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {imagePreview ? (
                    <div className="relative inline-block">
                       <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto object-cover rounded-md shadow-sm" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <span className="text-white text-[10px] inter-bold uppercase tracking-widest border border-white px-3 py-1 rounded">Change</span>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 group-hover:border-gray-400 transition-colors">
                        <span className="text-xl text-gray-400 group-hover:text-gray-600">📸</span>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm inter-bold text-gray-700">Upload Image</p>
                        <p className="text-[10px] inter-medium text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full text-white inter-bold text-xs uppercase tracking-[0.15em] py-4 transition-all cursor-pointer mt-2 rounded-md shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${editId ? 'bg-gray-900 hover:bg-black' : 'bg-red-600 hover:bg-red-700'}`}>
                {loading ? "Processing..." : editId ? "Update Category" : "Save Category"}
              </button>
            </form>
          </div>
        </div>

        {/* ================= RIGHT: CATEGORY LIST ================= */}
        <div className="flex-1 w-full">
          <div className="bg-white border border-gray-100 p-6 md:p-8 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-sm md:text-base inter-bold text-gray-900 uppercase tracking-wider">
                Category List 
                <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full ml-3 text-[10px] align-middle">{categories.length} items</span>
              </h3>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest">
                      <th className="p-4 w-20">Image</th>
                      <th className="p-4">Category Detail</th>
                      <th className="p-4">Type / Hierarchy</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm divide-y divide-gray-100">
                    {fetchLoading ? (
                      <tr>
                        <td colSpan="4" className="p-12 text-center">
                          <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                          <p className="mt-3 text-xs inter-bold text-gray-400 uppercase tracking-widest">Loading...</p>
                        </td>
                      </tr>
                    ) : displayCategories.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-16 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                            <span className="text-2xl opacity-50">📂</span>
                          </div>
                          <p className="text-sm inter-bold text-gray-600 uppercase tracking-widest">No categories found</p>
                          <p className="text-[11px] text-gray-400 inter-medium mt-1">Start by adding a new main category.</p>
                        </td>
                      </tr>
                    ) : (
                      displayCategories.map((category) => {
                        const level = category.level;
                        const isEditing = editId === category._id;
                        const imgUrl = category.image?.url || category.image;

                        return (
                          <tr key={category._id} className={`transition-colors ${isEditing ? 'bg-blue-50/30' : level > 1 ? 'bg-gray-50/20 hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                            
                            <td className="p-4">
                              {imgUrl ? (
                                <img src={imgUrl} className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-md border border-gray-200 shadow-sm" alt={category.name}/>
                              ) : (
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center rounded-md text-[10px] inter-medium">N/A</div>
                              )}
                            </td>
                            
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {/* Visual Hierarchy Indicators */}
                                {level === 2 && <span className="text-gray-300 inter-bold text-xl ml-2">↳</span>}
                                {level === 3 && <span className="text-red-300 inter-bold text-xl ml-8">↳</span>}
                                
                                <div>
                                  <p className={`inter-bold text-xs md:text-sm ${level === 1 ? 'text-gray-900' : level === 2 ? 'text-gray-700' : 'text-gray-500'}`}>
                                    {category.name}
                                  </p>
                                  <p className="text-[10px] inter-medium text-gray-400 mt-1 hidden md:block">/{category.slug}</p>
                                </div>
                              </div>
                            </td>
                            
                            <td className="p-4">
                              {level === 1 ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] inter-bold bg-green-50 text-green-700 uppercase tracking-wider border border-green-100">
                                  Main Category
                                </span>
                              ) : level === 2 ? (
                                <div className="flex flex-col items-start gap-1">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] inter-bold bg-blue-50 text-blue-700 uppercase tracking-wider border border-blue-100">
                                    Subcategory
                                  </span>
                                  <span className="text-[9px] inter-medium text-gray-400">of {category.parentName}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-start gap-1">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] inter-bold bg-purple-50 text-purple-700 uppercase tracking-wider border border-purple-100">
                                    Sub-Subcategory
                                  </span>
                                  <span className="text-[9px] inter-medium text-gray-400">of {category.parentName}</span>
                                </div>
                              )}
                            </td>
                            
                            <td className="p-4 text-right">
                              <div className="flex justify-end items-center gap-3">
                                <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 inter-bold text-[10px] md:text-xs uppercase tracking-wider transition-colors cursor-pointer">
                                  Edit
                                </button>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <button onClick={() => handleDelete(category._id)} className="text-red-500 hover:text-red-700 inter-bold text-[10px] md:text-xs uppercase tracking-wider transition-colors cursor-pointer">
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
    </div>
  );
};

export default AdminCategories;