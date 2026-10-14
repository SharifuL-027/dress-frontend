import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products store korar jonno
  const [categories, setCategories] = useState([]); // Search dropdown er jonno
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch Products & Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/categories")
        ]);
        
        // Handling products array correctly whether wrapped in object or not
        const fetchedProducts = prodRes.data.products || prodRes.data;
        
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
        setCategories(catRes.data);
        
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load products!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtering Logic (Search by Name/SKU & Filter by Category)
  useEffect(() => {
    let result = products;

    // 1. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(product => {
        // Checking Main Category, Sub Category, or Sub-Sub Category
        const pCatId = typeof product.category === 'object' ? product.category?._id : product.category;
        const pSubCatId = typeof product.subCategory === 'object' ? product.subCategory?._id : product.subCategory;
        const pSubSubCatId = typeof product.subSubCategory === 'object' ? product.subSubCategory?._id : product.subSubCategory;

        return pCatId === selectedCategory || pSubCatId === selectedCategory || pSubSubCatId === selectedCategory;
      });
    }

    // 2. Search Query (Name or SKU)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.sku.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);


  // প্রোডাক্ট ডিলিট ফাংশন
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/api/products/${id}`);
        // Update both states after deletion
        setProducts(products.filter((product) => product._id !== id));
        setFilteredProducts(filteredProducts.filter((product) => product._id !== id));
        
        toast.success("Product deleted successfully! 🗑");
      } catch (error) {
        toast.error("Failed to delete product! 😔");
        console.error(error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center inter-bold text-gray-500 uppercase">Loading Products...</div>;

  return (
    <div className="w-full bg-white border border-gray-200 p-8 shadow-sm">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl inter-bold text-gray-800 uppercase tracking-widest">All Products</h2>
          <p className="text-sm inter-medium text-gray-500 mt-1">Manage your store products ({filteredProducts.length} items found).</p>
        </div>
        <Link to="/admin/add-product" className="bg-red-500 hover:bg-red-600 text-white inter-bold text-sm uppercase tracking-widest px-6 py-3 transition-colors shrink-0">
          + Add New
        </Link>
      </div>

      {/* ---------------- FILTER & SEARCH BAR ---------------- */}
      <div className="bg-gray-50 p-4 border border-gray-200 rounded-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        
        {/* Search by Name / SKU */}
        <div className="w-full md:flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search by Product Name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm inter-medium focus:border-red-500 focus:outline-none rounded-sm bg-white"
          />
        </div>

        {/* Filter by Category */}
        <div className="w-full md:w-[300px]">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 py-2.5 px-3 text-sm inter-medium focus:border-red-500 focus:outline-none rounded-sm bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.parent ? `↳ ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {(searchQuery || selectedCategory !== "all") && (
          <button 
            onClick={() => {setSearchQuery(""); setSelectedCategory("all");}}
            className="w-full md:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs inter-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ---------------- PRODUCT TABLE ---------------- */}
      <div className="overflow-x-auto border border-gray-200 rounded-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] inter-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 w-20">Image</th>
              <th className="p-4">Product Name & Category</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-500">
                  <span className="text-3xl block mb-2 opacity-50">📂</span>
                  <p className="inter-bold uppercase tracking-widest text-xs">No matching products found.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const displayStock = product.totalStock !== undefined ? product.totalStock : (product.stock || 0);

                // Get Category Name for Display
                const catName = typeof product.category === 'object' ? product.category?.name : categories.find(c => c._id === product.category)?.name || "N/A";
                const subCatName = typeof product.subCategory === 'object' ? product.subCategory?.name : categories.find(c => c._id === product.subCategory)?.name;

                return (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0].url : "https://placehold.co/50x50/eeeeee/333333?text=N/A"} 
                        alt={product.name} 
                        className="w-12 h-12 md:w-14 md:h-14 object-cover border border-gray-200 rounded-sm"
                      />
                    </td>
                    <td className="p-4">
                      <p className="inter-bold text-xs md:text-sm text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-[10px] md:text-[11px] inter-medium text-gray-400 mt-1 uppercase tracking-wider">
                        {catName} {subCatName && ` > ${subCatName}`}
                      </p>
                    </td>
                    <td className="p-4 text-xs inter-medium text-gray-600">{product.sku}</td>
                    <td className="p-4 inter-bold text-sm text-gray-800">৳ {product.discountPrice || product.regularPrice}</td>
                    <td className="p-4">
                      <span className={`text-[9px] md:text-[10px] inter-bold px-2 py-1 uppercase tracking-widest rounded-sm whitespace-nowrap ${displayStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {displayStock > 0 ? `${displayStock} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link to={`/admin/edit-product/${product._id}`} className="text-blue-600 hover:text-blue-800 inter-bold text-[10px] md:text-xs uppercase tracking-wider transition-colors">
                          Edit
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 inter-bold text-[10px] md:text-xs uppercase tracking-wider cursor-pointer transition-colors">
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
  );
};

export default AdminProducts;