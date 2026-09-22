import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios";
import toast from "react-hot-toast"; 

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ডাটাবেস থেকে প্রোডাক্ট নিয়ে আসা
  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/api/products");
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load products!"); // <-- অপশনাল: ডেটা লোড না হলেও এরর দেখাবে
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // প্রোডাক্ট ডিলিট ফাংশন
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/api/products/${id}`);
        // ডিলিট হওয়ার পর লিস্ট থেকে ওই প্রোডাক্টটি সরিয়ে দেওয়া
        setProducts(products.filter((product) => product._id !== id));
        
        toast.success("Product deleted successfully! 🗑️"); // <-- সাকসেস টোস্ট
      } catch (error) {
        toast.error("Failed to delete product! 😔"); // <-- এরর টোস্ট
        console.error(error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500 uppercase">Loading Products...</div>;

  return (
    <div className="w-full bg-white border border-gray-200 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-widest">All Products</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your store products ({products.length} items found).</p>
        </div>
        <Link to="/admin/add-product" className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm uppercase tracking-widest px-6 py-3 transition-colors">
          + Add New
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="p-4">Image</th>
              <th className="p-4">Product Name & SKU</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0].url : "https://via.placeholder.com/50"} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover border border-gray-200"
                    />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                  </td>
                  <td className="p-4 font-bold text-sm text-gray-700">৳ {product.regularPrice}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 uppercase ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link to={`/admin/edit-product/${product._id}`} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-wider">
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
  );
};

export default AdminProducts;