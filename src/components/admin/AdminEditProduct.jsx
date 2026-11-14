import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "axios";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    subCategory: "",
    subSubCategory: "",
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
    returnPolicy: "7 Days Return & Exchange Policy Applicable.",
  });

  // =====================================
  // Variant Management State
  // =====================================
  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({ color: "", size: "", stock: "" });

  // নতুন ভ্যারিয়েন্ট যোগ করলে যদি একই Color + Size আগে থেকেই থাকে, তবে স্টক অটোমেটিক যোগ হবে
  const handleAddVariant = () => {
    if (!newVariant.color.trim() || !newVariant.size.trim() || newVariant.stock === "") {
      toast.error("Please fill color, size, and stock to add a variant.");
      return;
    }

    const addedStock = Number(newVariant.stock);
    if (addedStock < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    const existingIndex = variants.findIndex(
      (v) =>
        v.color.trim().toLowerCase() === newVariant.color.trim().toLowerCase() &&
        v.size.trim().toLowerCase() === newVariant.size.trim().toLowerCase()
    );

    if (existingIndex !== -1) {
      const updatedVariants = [...variants];
      updatedVariants[existingIndex] = {
        ...updatedVariants[existingIndex],
        stock: Number(updatedVariants[existingIndex].stock) + addedStock,
      };
      setVariants(updatedVariants);
      toast.success(
        `Added +${addedStock} pcs to existing ${updatedVariants[existingIndex].color} (${updatedVariants[existingIndex].size})!`
      );
    } else {
      setVariants([
        ...variants,
        {
          color: newVariant.color.trim(),
          size: newVariant.size.trim(),
          stock: addedStock,
        },
      ]);
      toast.success("New variant added!");
    }

    setNewVariant({ color: "", size: "", stock: "" });
  };

  // সরাসরি টেবিল থেকে স্টক এডিট করার ফাংশন
  const handleDirectStockChange = (index, value) => {
    const updatedVariants = [...variants];
    const parsed = value === "" ? 0 : Math.max(0, Number(value));
    updatedVariants[index].stock = parsed;
    setVariants(updatedVariants);
  };

  // + বা - বাটন দিয়ে দ্রুত স্টক বাড়ানো/কমানোর ফাংশন
  const handleAdjustStock = (index, delta) => {
    const updatedVariants = [...variants];
    const currentStock = Number(updatedVariants[index].stock) || 0;
    updatedVariants[index].stock = Math.max(0, currentStock + delta);
    setVariants(updatedVariants);
  };

  const handleRemoveVariant = (indexToRemove) => {
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };
  // =====================================

  // Existing Media (Cloudinary URLs) + New Uploads (Files)
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [existingVideo, setExistingVideo] = useState(null);
  const [newVideo, setNewVideo] = useState(null);

  // Fetch Categories & Single Product Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get(`/products/${id}`),
        ]);

        setCategories(catRes.data || []);
        const product = prodRes.data;

        // Category IDs নিরাপদে বের করা (Object বা String যাই আসুক)
        const getCatId = (field) => {
          if (!field) return "";
          return typeof field === "object" ? field._id : field;
        };

        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          category: getCatId(product.category),
          subCategory: getCatId(product.subCategory),
          subSubCategory: getCatId(product.subSubCategory),
          gender: product.gender || "Unisex",
          brand: product.brand || "",
          regularPrice: product.regularPrice ?? "",
          discountPrice: product.discountPrice ?? "",
          fabric: product.fabric || "",
          gsm: product.gsm || "",
          fitType: product.fitType || "",
          sleeveType: product.sleeveType || "",
          pattern: product.pattern || "",
          description: product.description || "",
          keyFeatures: product.keyFeatures || "",
          sizeChart: product.sizeChart || "",
          washingInstructions: product.washingInstructions || "Hand wash preferred. Do not bleach.",
          origin: product.origin || "Bangladesh",
          deliveryInfo: product.deliveryInfo || "Inside Dhaka: 2-3 Days | Outside Dhaka: 3-5 Days",
          returnPolicy: product.returnPolicy || "7 Days Return & Exchange Policy Applicable.",
        });

        setVariants(product.variants || []);
        setExistingImages(product.images || []);
        setExistingVideo(product.video || null);
      } catch (error) {
        console.error("Failed to load product data:", error);
        toast.error(error.response?.data?.message || "Failed to load product details!");
      } finally {
        setFetching(false);
      }
    };

    if (id) loadData();
  }, [id]);

  // 1. Get Main Categories
  const mainCategories = categories.filter((cat) => !cat.parent);

  // 2. Get Sub Categories based on selected Main Category
  const availableSubCategories = categories.filter((cat) => {
    if (!cat.parent || !formData.category) return false;
    const parentId = typeof cat.parent === "object" ? cat.parent._id : cat.parent;
    return String(parentId) === String(formData.category);
  });

  // 3. Get Sub-Sub Categories based on selected Sub Category
  const availableSubSubCategories = categories.filter((cat) => {
    if (!cat.parent || !formData.subCategory) return false;
    const parentId = typeof cat.parent === "object" ? cat.parent._id : cat.parent;
    return String(parentId) === String(formData.subCategory);
  });

  const handleTextChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData((prev) => ({ ...prev, category: value, subCategory: "", subSubCategory: "" }));
    } else if (name === "subCategory") {
      setFormData((prev) => ({ ...prev, subCategory: value, subSubCategory: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image Handlers (Existing + New combined max 6)
  const totalImagesCount = existingImages.length + newImages.length;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (totalImagesCount + files.length > 6) {
      toast.error("You can have a maximum of 6 images total.");
      return;
    }
    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages(newImages.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews(newImagePreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewVideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalImagesCount < 1) {
      toast.error("Please keep or upload at least 1 product image.");
      return;
    }
    if (variants.length < 1) {
      toast.error("Please add at least 1 product variant (Color/Size/Stock).");
      return;
    }
    if (!formData.category) {
      toast.error("Main Category is required.");
      return;
    }

    setLoading(true);

    try {
      const cloudName = "wtbwxhmc";
      const uploadPreset = "dresstown";

      // Upload only newly selected images
      let newlyUploadedImages = [];
      for (const pic of newImages) {
        const imageFormData = new FormData();
        imageFormData.append("file", pic);
        imageFormData.append("upload_preset", uploadPreset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          imageFormData
        );
        newlyUploadedImages.push({ url: res.data.secure_url, public_id: res.data.public_id });
      }

      const finalImages = [...existingImages, ...newlyUploadedImages];

      // Video handling
      let finalVideo = existingVideo;
      if (newVideo) {
        const videoFormData = new FormData();
        videoFormData.append("file", newVideo);
        videoFormData.append("upload_preset", uploadPreset);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          videoFormData
        );
        finalVideo = { url: res.data.secure_url, public_id: res.data.public_id };
      }

      const totalStock = variants.reduce((acc, curr) => acc + Number(curr.stock), 0);
      const uniqueColors = [...new Set(variants.map((v) => v.color))];
      const uniqueSizes = [...new Set(variants.map((v) => v.size))];

      const updatedProductData = {
        ...formData,
        images: finalImages,
        video: finalVideo || null,
        variants: variants,
        totalStock: totalStock,
        colors: uniqueColors.join(", "),
        sizes: uniqueSizes.join(", "),
      };

      await api.put(`/products/${id}`, updatedProductData);

      toast.success("Product updated successfully! 🎉");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update product 😔");
    } finally {
      setLoading(false);
    }
  };

  // ================= PREMIUM RESPONSIVE CLASSES =================
  const inputClass =
    "w-full border border-gray-300 p-3 text-[13px] md:text-sm inter-medium focus:border-red-500 focus:outline-none transition-colors bg-white rounded-sm";
  const labelClass =
    "block text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest mb-2";
  const sectionTitleClass =
    "text-sm md:text-[15px] inter-bold text-gray-900 uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-200 pb-2 md:pb-3";
  // ==============================================================

  if (fetching) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 p-12 text-center shadow-sm rounded-sm">
        <span className="text-xs inter-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Product Details...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 p-5 md:p-8 shadow-sm rounded-sm mb-10">
      <div className="mb-6 md:mb-8 border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl inter-bold text-gray-900 uppercase tracking-widest">
            Edit Product
          </h2>
          <p className="text-[11px] md:text-sm inter-medium text-gray-500 mt-1.5">
            Update product details, pricing, stock variants, and media.
          </p>
        </div>
        <Link
          to="/admin/products"
          className="text-xs inter-bold text-gray-600 hover:text-black uppercase tracking-widest border border-gray-300 px-4 py-2.5 rounded-sm transition-colors"
        >
          ← Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
        {/* --- 1. Basic Information --- */}
        <div>
          <h3 className={sectionTitleClass}>1. Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
                className={inputClass}
                placeholder="e.g. Premium Cotton Panjabi"
              />
            </div>
            <div>
              <label className={labelClass}>Product Code / SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleTextChange}
                required
                className={inputClass}
                placeholder="e.g. PNJ-2026-BLK"
              />
            </div>
            <div>
              <label className={labelClass}>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="e.g. DressTown Exclusives"
              />
            </div>
          </div>
        </div>

        {/* --- 2. Categorization (3-Level) --- */}
        <div>
          <h3 className={sectionTitleClass}>2. Categorization</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            <div>
              <label className={labelClass}>Main Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleTextChange}
                required
                className={inputClass}
              >
                <option value="">Select Main Category</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Subcategory</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleTextChange}
                className={inputClass}
                disabled={!formData.category}
              >
                <option value="">
                  {!formData.category
                    ? "Select Main First"
                    : availableSubCategories.length === 0
                    ? "No Subcategory"
                    : "Select Subcategory"}
                </option>
                {availableSubCategories.map((subCat) => (
                  <option key={subCat._id} value={subCat._id}>
                    {subCat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Sub-Subcategory</label>
              <select
                name="subSubCategory"
                value={formData.subSubCategory}
                onChange={handleTextChange}
                className={inputClass}
                disabled={!formData.subCategory}
              >
                <option value="">
                  {!formData.subCategory
                    ? "Select Sub First"
                    : availableSubSubCategories.length === 0
                    ? "No Sub-Subcategory"
                    : "Select Sub-Subcategory"}
                </option>
                {availableSubSubCategories.map((subSubCat) => (
                  <option key={subSubCat._id} value={subSubCat._id}>
                    {subSubCat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleTextChange}
                className={inputClass}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- 3. Pricing & Variants --- */}
        <div>
          <h3 className={sectionTitleClass}>3. Pricing & Inventory Variants</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 mb-6">
            <div>
              <label className={labelClass}>Regular Price (৳) *</label>
              <input
                type="number"
                name="regularPrice"
                value={formData.regularPrice}
                onChange={handleTextChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Discount Price (৳)</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Variant Manager */}
          <div className="bg-gray-50 border border-gray-200 p-4 md:p-6 rounded-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 md:mb-5">
              <h4 className="text-[11px] md:text-xs inter-bold text-gray-800 uppercase tracking-widest">
                Manage Product Variants (Add New or Restock Existing)
              </h4>
              <span className="text-[10px] inter-medium text-gray-500">
                Tip: Adding an existing Color + Size auto-adds to its stock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6">
              <div className="w-full">
                <label className={labelClass}>Color</label>
                <input
                  type="text"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                  placeholder="e.g. Black"
                  className={inputClass}
                />
              </div>
              <div className="w-full">
                <label className={labelClass}>Size</label>
                <input
                  type="text"
                  value={newVariant.size}
                  onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                  placeholder="e.g. M"
                  className={inputClass}
                />
              </div>
              <div className="w-full">
                <label className={labelClass}>Add Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                  placeholder="e.g. 10"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="w-full bg-gray-900 text-white inter-bold text-[11px] md:text-sm uppercase tracking-widest h-[46px] hover:bg-red-600 transition-colors rounded-sm shadow-sm cursor-pointer"
              >
                Add / Restock
              </button>
            </div>

            {/* Variants Table with Direct Stock Edit */}
            {variants.length > 0 && (
              <div className="overflow-x-auto border border-gray-200 rounded-sm shadow-sm">
                <table className="w-full text-left text-xs md:text-sm border-collapse bg-white min-w-[550px]">
                  <thead>
                    <tr className="bg-gray-100 uppercase text-[9px] md:text-[10px] tracking-widest text-gray-500">
                      <th className="p-3 md:p-4 border-b border-gray-200 inter-bold">Color</th>
                      <th className="p-3 md:p-4 border-b border-gray-200 inter-bold">Size</th>
                      <th className="p-3 md:p-4 border-b border-gray-200 inter-bold">
                        Current Stock (Direct Edit)
                      </th>
                      <th className="p-3 md:p-4 border-b border-gray-200 text-center inter-bold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 md:p-4 border-b border-gray-100 inter-bold text-gray-800">
                          {v.color}
                        </td>
                        <td className="p-3 md:p-4 border-b border-gray-100 inter-bold text-gray-800">
                          {v.size}
                        </td>
                        <td className="p-3 md:p-4 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(idx, -1)}
                              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-800 inter-bold rounded-sm border border-gray-300 cursor-pointer"
                              title="Decrease 1"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={(e) => handleDirectStockChange(idx, e.target.value)}
                              className="w-20 border border-gray-300 px-2.5 py-1 text-center inter-bold text-red-600 rounded-sm focus:border-black focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(idx, 1)}
                              className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-800 inter-bold rounded-sm border border-gray-300 cursor-pointer"
                              title="Increase 1"
                            >
                              +
                            </button>
                            <span className="text-xs inter-medium text-gray-400">pcs</span>
                          </div>
                        </td>
                        <td className="p-3 md:p-4 border-b border-gray-100 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="text-[10px] md:text-[11px] uppercase tracking-widest text-red-500 inter-bold hover:text-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-red-50/30">
                      <td
                        colSpan="2"
                        className="p-3 md:p-4 border-t border-gray-200 inter-bold text-right uppercase text-[10px] md:text-[11px] tracking-widest text-gray-600"
                      >
                        Total Stock:
                      </td>
                      <td
                        colSpan="2"
                        className="p-3 md:p-4 border-t border-gray-200 inter-bold text-red-600 text-[13px] md:text-sm"
                      >
                        {variants.reduce((acc, curr) => acc + Number(curr.stock || 0), 0)} pcs
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* --- 4. Product Specifications --- */}
        <div>
          <h3 className={sectionTitleClass}>4. Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            <div>
              <label className={labelClass}>Fabric / Material</label>
              <input
                type="text"
                name="fabric"
                value={formData.fabric}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="e.g. 100% Cotton"
              />
            </div>
            <div>
              <label className={labelClass}>GSM</label>
              <input
                type="text"
                name="gsm"
                value={formData.gsm}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="e.g. 160 GSM"
              />
            </div>
            <div>
              <label className={labelClass}>Fit Type</label>
              <input
                type="text"
                name="fitType"
                value={formData.fitType}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="e.g. Slim Fit, Regular"
              />
            </div>
            <div>
              <label className={labelClass}>Sleeve Type</label>
              <input
                type="text"
                name="sleeveType"
                value={formData.sleeveType}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="e.g. Full Sleeve, Half"
              />
            </div>
            <div>
              <label className={labelClass}>Pattern / Design</label>
              <input
                type="text"
                name="pattern"
                value={formData.pattern}
                onChange={handleTextChange}
                className={inputClass}
                placeholder="e.g. Solid, Printed, Check"
              />
            </div>
            <div>
              <label className={labelClass}>Country of Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleTextChange}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* --- 5. Detailed Description --- */}
        <div>
          <h3 className={sectionTitleClass}>5. Details & Policies</h3>
          <div className="space-y-5 md:space-y-6">
            <div>
              <label className={labelClass}>Product Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                rows="3"
                className={inputClass}
              ></textarea>
            </div>
            <div>
              <label className={labelClass}>Key Features (Bullet points)</label>
              <textarea
                name="keyFeatures"
                value={formData.keyFeatures}
                onChange={handleTextChange}
                rows="3"
                className={inputClass}
                placeholder="- 100% Export Quality&#10;- Color Guarantee"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className={labelClass}>Size Chart Info</label>
                <textarea
                  name="sizeChart"
                  value={formData.sizeChart}
                  onChange={handleTextChange}
                  rows="2"
                  className={inputClass}
                  placeholder="M: Chest 38, Length 28..."
                ></textarea>
              </div>
              <div>
                <label className={labelClass}>Washing Instructions</label>
                <textarea
                  name="washingInstructions"
                  value={formData.washingInstructions}
                  onChange={handleTextChange}
                  rows="2"
                  className={inputClass}
                ></textarea>
              </div>
              <div>
                <label className={labelClass}>Delivery Information</label>
                <textarea
                  name="deliveryInfo"
                  value={formData.deliveryInfo}
                  onChange={handleTextChange}
                  rows="2"
                  className={inputClass}
                ></textarea>
              </div>
              <div>
                <label className={labelClass}>Return & Exchange Policy</label>
                <textarea
                  name="returnPolicy"
                  value={formData.returnPolicy}
                  onChange={handleTextChange}
                  rows="2"
                  className={inputClass}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* --- 6. Media Upload --- */}
        <div>
          <h3 className={sectionTitleClass}>6. Product Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="border-2 border-dashed border-gray-300 p-6 bg-gray-50 text-center relative group hover:border-red-500 hover:bg-red-50/20 transition-all rounded-sm cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">📸</span>
                <p className="text-[13px] md:text-sm inter-bold text-gray-700">Add More Images</p>
                <p className="text-[10px] md:text-[11px] inter-medium text-gray-400 uppercase tracking-wider">
                  Total {totalImagesCount}/6 Images Used
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 p-6 bg-gray-50 text-center relative group hover:border-red-500 hover:bg-red-50/20 transition-all rounded-sm cursor-pointer">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🎥</span>
                <p className="text-[13px] md:text-sm inter-bold text-gray-700 truncate w-full px-4">
                  {newVideo
                    ? newVideo.name
                    : existingVideo?.url
                    ? "Replace Existing Video"
                    : "Upload Video"}
                </p>
                <p className="text-[10px] md:text-[11px] inter-medium text-gray-400 uppercase tracking-wider">
                  Optional, Max 1 File
                </p>
              </div>
            </div>
          </div>

          {/* Existing Video Preview */}
          {existingVideo?.url && !newVideo && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-sm flex items-center justify-between">
              <span className="text-xs inter-bold text-gray-700">
                Current Video Attached ✓
              </span>
              <button
                type="button"
                onClick={() => setExistingVideo(null)}
                className="text-[11px] inter-bold text-red-600 hover:underline uppercase cursor-pointer"
              >
                Remove Video
              </button>
            </div>
          )}

          {/* Combined Images Preview (Existing + New) */}
          {totalImagesCount > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-sm">
              <p className="text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest mb-4">
                Product Images ({totalImagesCount}/6)
              </p>
              <div className="flex flex-wrap gap-4">
                {/* Existing Cloudinary Images */}
                {existingImages.map((img, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative w-20 h-24 md:w-24 md:h-28 border border-gray-200 group rounded-sm overflow-hidden shadow-sm"
                  >
                    <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 uppercase rounded-sm">
                      Saved
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-[10px] inter-bold rounded-sm cursor-pointer shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Newly Selected Local Images */}
                {newImagePreviews.map((src, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative w-20 h-24 md:w-24 md:h-28 border border-emerald-400 group rounded-sm overflow-hidden shadow-sm"
                  >
                    <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[8px] px-1.5 py-0.5 uppercase rounded-sm">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-[10px] inter-bold rounded-sm cursor-pointer shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6 md:pt-8 mt-6 md:mt-8 border-t border-gray-200 flex justify-end gap-4">
          <Link
            to="/admin/products"
            className="border border-gray-300 text-gray-700 hover:bg-gray-100 inter-bold text-xs md:text-sm uppercase tracking-widest px-6 py-4 rounded-sm transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white inter-bold text-xs md:text-sm uppercase tracking-widest px-8 py-4 w-full md:w-auto transition-colors shadow-md rounded-sm cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Updating Product..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditProduct;