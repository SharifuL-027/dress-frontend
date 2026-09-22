import { Link } from 'react-router';

const ProductCard = ({ product }) => {
  return (
    // 'rounded' muche deya hoyeche, text-center kora hoyeche clean look-er jonno
    <div className="bg-white border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-lg flex flex-col relative">
      
      {/* Product Image Section */}
      <div className="relative aspect-3/3 overflow-hidden bg-gray-50">
        <Link to={`/product/${product._id}`}>
          <img 
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image'} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        </Link>
        
        {/* Hover Action Buttons - Side theke smoothly ashbe */}
        {/* translate-x-12 diye baire rakha hoyeche, hover korle translate-x-0 hobe */}
        <div className="absolute top-4 right-0 flex flex-col gap-2 px-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
          
          {/* Wishlist Icon */}
          <button 
            title="Add to Wishlist"
            className="w-9 h-9 bg-white flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Cart Icon */}
          <button 
            title="Add to Cart"
            className="w-9 h-9 bg-white flex items-center justify-center text-gray-600 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
          
        </div>

        {/* Optional: Sale/Discount Badge (Kono rounded chara) */}
        {product.oldPrice && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            Sale
          </div>
        )}
      </div>

      {/* Product Details Section (Soto o Compact) */}
      <div className="p-3 flex flex-col grow text-center">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">
          {product.category?.name || 'Category'}
        </p>
        
        <Link to={`/product/${product._id}`} className="block flex-grow">
          <h3 className="text-[13px] ubuntu-bold text-gray-800 line-clamp-1 hover:text-red-500 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-center gap-2 mt-auto">
          <span className="text-[14px] ubuntu-bold text-red-500">৳{product.price}</span>
          {product.oldPrice && (
            <span className="text-[11px] ubuntu-medium text-gray-400 line-through">৳{product.oldPrice}</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;