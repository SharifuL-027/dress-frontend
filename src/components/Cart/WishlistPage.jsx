import { useCart } from "../../context/CartContext";
import { Link } from "react-router";

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  return (
    <div className="max-w-375 mx-auto px-4 md:px-8 mt-32 mb-24 font-sans">
      
      {/* Page Header */}
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 uppercase tracking-wider">
          My Wishlist <span className="text-red-600 text-lg">({wishlist.length})</span>
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
          Items you have saved for later
        </p>
      </div>

      {/* Wishlist Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="text-center py-32 border border-gray-200 bg-gray-50 flex flex-col items-center">
          <span className="text-6xl mb-4">❤️</span>
          <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-widest mb-2">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 max-w-sm uppercase tracking-wider">You haven't added any products to your wishlist yet. Explore our store and save your favorites.</p>
          <Link 
            to="/" 
            className="mt-8 bg-gray-900 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const price = product.discountPrice || product.regularPrice || product.price || 0;
            
            return (
              <div key={product._id} className="bg-white border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-lg flex flex-col relative">
                
                {/* Product Image */}
                <div className="relative aspect-3/3 overflow-hidden bg-gray-50">
                  <Link to={`/product/${product._id}`}>
                    <img 
                      src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image'} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                  </Link>

                  {/* Remove from Wishlist Button (Top Right) */}
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col grow text-center">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">
                    {product.category?.name || 'Category'}
                  </p>
                  
                  <Link to={`/product/${product._id}`} className="block flex-grow">
                    <h3 className="text-xs font-bold text-gray-800 uppercase line-clamp-1 hover:text-red-500 transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm font-extrabold text-red-600">
                      ৳{price}
                    </span>
                    {product.discountPrice && product.regularPrice && (
                      <span className="text-[11px] font-medium text-gray-400 line-through">
                        ৳{product.regularPrice}
                      </span>
                    )}
                  </div>

                  {/* Move to Cart Button */}
                  <button 
                    onClick={() => {
                      addToCart({
                        ...product,
                        price: price,
                        size: product.sizes?.[0] || 'Standard',
                        color: product.colors?.[0] || 'Default',
                        qty: 1
                      });
                    }}
                    className="w-full bg-gray-900 text-white text-[11px] font-bold uppercase tracking-widest py-3 hover:bg-red-600 transition-colors cursor-pointer mt-auto"
                  >
                    Add To Cart
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default WishlistPage;