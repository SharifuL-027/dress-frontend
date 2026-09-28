import { Link, useNavigate } from 'react-router';
import { useCart } from '../../context/CartContext'; 
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist } = useCart(); 
  const navigate = useNavigate(); // রিডাইরেক্ট করার জন্য useNavigate হুক যুক্ত করা হয়েছে
  
  // স্টক চেক করা (ডাটাবেসের নতুন totalStock ফিল্ড অনুযায়ী)
  const isOutOfStock = product.totalStock === 0 || product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    
    if (isOutOfStock) {
      toast.error("Sorry, this product is currently out of stock!");
      return;
    }

    // লজিক: যদি প্রোডাক্টের সাইজ বা কালার অপশন থাকে, তবে ডিটেইলস পেজে রিডাইরেক্ট করবে
    if ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) {
      toast("Please select a size and color first!", {
        icon: '👉',
        style: { background: '#333', color: '#fff', borderRadius: '8px' }
      });
      navigate(`/product/${product._id}`);
      return;
    }

    // যদি কোনো সাইজ/কালার না থাকে, তবে সরাসরি কার্টে অ্যাড হবে
    const cartItem = {
      ...product,
      price: product.discountPrice || product.regularPrice || product.price || 0,
      size: 'Standard',
      color: 'Default',
      qty: 1,
      maxStock: product.totalStock || product.stock // কার্টে ম্যাক্স স্টক পাঠিয়ে দেওয়া হলো
    };
    addToCart(cartItem);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // প্রাইস ক্যালকুলেশন
  const regularPrice = product.regularPrice || product.price || 0;
  const discountPrice = product.discountPrice;
  const hasDiscount = discountPrice && discountPrice < regularPrice;
  
  // ডিসকাউন্ট পার্সেন্টেজ বের করা
  const discountPercent = hasDiscount 
    ? Math.round(((regularPrice - discountPrice) / regularPrice) * 100) 
    : 0;

  // প্রথম ও দ্বিতীয় ছবি (দ্বিতীয় ছবি না থাকলে প্রথমটাই ব্যবহার হবে)
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
  const hoverImage = product.images?.[1]?.url || mainImage;

  return (
    <div className="bg-white group transition-all duration-300 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] flex flex-col relative rounded-xl overflow-hidden border border-gray-100/60">
      
      {/* ========================================== */}
      {/* PRODUCT IMAGE SECTION */}
      {/* ========================================== */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link to={`/product/${product._id}`}>
          
          {/* Base Image (Hover করলে হালকা বড় হয়ে মিলিয়ে যাবে) */}
          <img 
            src={mainImage} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-105"
          />
          
          {/* Hover Overlay Image (স্টাইলিশ ফেইড-ইন ইফেক্ট মিলি-সেকেন্ডের মধ্যে) */}
          <img 
            src={hoverImage} 
            alt={product.name} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-in-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 ${hoverImage === mainImage ? 'brightness-95' : ''}`}
          />
          
          {/* Subtle Dark Overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
        
        {/* ================= OUT OF STOCK BADGE ================= */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none">
            <span className="bg-black text-white px-5 py-2.5 text-[11px] inter-bold uppercase tracking-[0.2em] shadow-lg rounded-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Sale/Discount Badge */}
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-3 left-3 bg-red-600/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm z-20">
            -{discountPercent}%
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
          
          {/* Wishlist Button */}
          <button 
            onClick={handleToggleWishlist}
            title="Add to Wishlist"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:scale-110 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          
          {/* Cart Button (Disabled if out of stock) */}
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] ${
              isOutOfStock 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-red-500 hover:text-white hover:scale-110 cursor-pointer'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
          
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col grow text-center bg-white z-10">
        <p className="text-[10px] text-gray-400 inter-bold uppercase tracking-[0.2em] mb-1.5">
          {product.category?.name || 'Category'}
        </p>
        
        <Link to={`/product/${product._id}`} className="block flex-grow">
          <h3 className={`text-[13px] inter-bold line-clamp-1 transition-colors mb-2 ${isOutOfStock ? 'text-gray-400' : 'text-gray-900 hover:text-red-600'}`}>
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing Area */}
        <div className="flex items-center justify-center gap-2.5 mt-auto">
          <span className={`text-[15px] inter-bold ${isOutOfStock ? 'text-gray-400' : 'text-red-600'}`}>
            ৳{hasDiscount ? discountPrice : regularPrice}
          </span>
          
          {hasDiscount && (
            <span className="text-[12px] inter-medium text-gray-400 line-through decoration-gray-400 decoration-1">
              ৳{regularPrice}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;