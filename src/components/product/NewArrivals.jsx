import { useState, useEffect } from 'react';
import { Link } from 'react-router'; 
import api from '../../api/axios'; 
import ProductCard from './ProductCard';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products'); 
        
        // Backend er response formatting onujayi
        const allProducts = data.products || data;
        
        // Latest first sort kore thik 2 line (5 x 2 = 10) ba 4x2=8 (desktop e) dekhabar jonno 10 ti neya holo
        const sortedProducts = allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedProducts.slice(0, 10)); 
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
    <div className="w-full">
      
      {/* Section Title (Fabrilife Style - Center Aligned mostly, but keeping your left align option clean) */}
      <div className="flex justify-between items-end mb-6 md:mb-8 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-xl md:text-3xl inter-bold text-gray-900 uppercase tracking-widest">New Arrivals</h2>
          <div className="h-1 w-16 bg-red-600 mt-2 rounded-full hidden md:block"></div>
        </div>
        <Link 
          to="/new-arrivals" 
          className="text-[10px] md:text-xs inter-bold text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1 group"
        >
          View All <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Products Grid Loading & Error States */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center text-[11px] inter-bold text-red-500 bg-red-50 py-4 rounded-sm uppercase tracking-widest">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-10 inter-medium text-[11px] uppercase tracking-widest">No products found.</div>
      ) : (
        /* Asol Product Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile View All Button (Bottom) */}
      <div className="mt-6 text-center md:hidden">
        <Link 
          to="/new-arrivals" 
          className="inline-block w-full border border-gray-900 text-gray-900 px-6 py-3 text-[11px] inter-bold uppercase tracking-[0.2em] hover:bg-gray-900 hover:text-white transition-colors duration-300"
        >
          View All New Arrivals
        </Link>
      </div>

    </div>
  );
};

export default NewArrivals;