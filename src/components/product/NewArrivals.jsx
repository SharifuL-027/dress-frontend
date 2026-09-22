import { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import ProductCard from '../product/ProductCard';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products'); 
        
        // Backend er response formatting onujayi
        setProducts(data.products || data); 
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-375 mx-auto px-6 lg:px-10 my-20">
      
      {/* Section Title */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl ubuntu-bold text-gray-700 tracking-tight">New Arrivals</h2>
          <div className="h-1 w-16 bg-red-500 mt-2 rounded-full"></div>
        </div>
        <button className="text-sm font-bold text-gray-500 hover:text-red-500 uppercase tracking-wider transition-colors hidden sm:block">
          View All →
        </button>
      </div>

      {/* Products Grid Loading & Error States */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 py-4 rounded-lg">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-10 ubuntu-medium">No products found.</div>
      ) : (
        /* Asol Product Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default NewArrivals;