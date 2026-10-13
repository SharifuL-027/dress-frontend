import { Link, useNavigate } from 'react-router';
import { useCart } from '../../context/CartContext'; 
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist } = useCart(); 
  const navigate = useNavigate(); 
  
  // স্টক চেক করা
  const isOutOfStock = product.totalStock === 0 || product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); // লিংকে ক্লিক পড়া রোধ করবে
    
    if (isOutOfStock) {
      toast.error("Sorry, this product is currently out of stock!");
      return;
    }

    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      toast("Please select a size and color first!", {
        icon: '👉',
        style: { background: '#333', color: '#fff', borderRadius: '8px' }
      });
      navigate(`/product/${product._id}`);
      return;
    }

    const cartItem = {
      ...product,
      price: product.discountPrice || product.regularPrice || product.price || 0,
      size: 'Standard',
      color: 'Default',
      qty: 1,
      maxStock: product.totalStock || product.stock 
    };
    addToCart(cartItem);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation(); // লিংকে ক্লিক পড়া রোধ করবে
    toggleWishlist(product);
  };

  // প্রাইস ক্যালকুলেশন
  const regularPrice = product.regularPrice || product.price || 0;
  const discountPrice = product.discountPrice;
  const hasDiscount = discountPrice && discountPrice < regularPrice;
  
  const discountPercent = hasDiscount 
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100) 
    : 0;

  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
  const hoverImage = product.images?.[1]?.url || mainImage;

  return (
    <div className="bg-white group transition-all duration-300 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] flex flex-col relative rounded-none overflow-hidden border border-gray-100/60">
      
      {/* ========================================== */}
      {/* PRODUCT IMAGE SECTION */}
      {/* ========================================== */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          
          {/* Base Image */}
          <img 
            src={mainImage} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out md:group-hover:opacity-0 md:group-hover:scale-105"
          />
          
          {/* Hover Overlay Image (Desktop only effect) */}
          <img 
            src={hoverImage} 
            alt={product.name} 
            className={`hidden md:block absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 ${hoverImage === mainImage ? 'brightness-95' : ''}`}
          />
          
          {/* Subtle Dark Overlay (Desktop only) */}
          <div className="hidden md:block absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
        
        {/* ================= OUT OF STOCK BADGE ================= */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none">
            <span className="bg-black text-white px-3 py-1.5 md:px-5 md:py-2.5 text-[9px] md:text-[11px] inter-bold uppercase tracking-[0.2em] shadow-lg rounded-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Sale/Discount Badge */}
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600/95 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-2.5 md:py-1.5 rounded-md uppercase tracking-widest shadow-sm z-20">
            -{discountPercent}%
          </div>
        )}

        {/* 
          ==========================================
          ACTION BUTTONS (Mobile: Always Visible | Desktop: Hover) 
          ==========================================
        */}
        <div className="absolute bottom-3 md:bottom-4 left-0 right-0 flex justify-center items-center gap-2 md:gap-3 opacity-100 translate-y-0 md:opacity-0 md:translate-y-10 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 ease-out z-20 pointer-events-auto">
          
          {/* Wishlist Button */}
          <button 
            onClick={handleToggleWishlist}
            title="Add to Wishlist"
            className="w-8 h-8 md:w-10 md:h-10 bg-white/90 md:bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:scale-110 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white/90 md:bg-white text-gray-700 hover:bg-red-500 hover:text-white hover:scale-110 cursor-pointer'
            }`}
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
          
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3 md:p-4 flex flex-col grow text-center bg-white z-10">
        <p className="text-[9px] md:text-[10px] text-gray-400 inter-bold uppercase tracking-[0.2em] mb-1 md:mb-1.5 truncate px-1">
          {product.category?.name || 'Category'}
        </p>
        
        <Link to={`/product/${product._id}`} className="block flex-grow">
          <h3 className={`text-[11px] md:text-[13px] inter-bold line-clamp-1 transition-colors mb-1.5 md:mb-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-900 hover:text-red-600'}`}>
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing Area */}
        <div className="flex items-center justify-center gap-2 md:gap-2.5 mt-auto flex-wrap">
          <span className={`text-[13px] md:text-[15px] inter-bold ${isOutOfStock ? 'text-gray-400' : 'text-red-600'}`}>
            ৳{hasDiscount ? discountPrice : regularPrice}
          </span>
          
          {hasDiscount && (
            <span className="text-[10px] md:text-[12px] inter-medium text-gray-400 line-through decoration-gray-400 decoration-1">
              ৳{regularPrice}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;