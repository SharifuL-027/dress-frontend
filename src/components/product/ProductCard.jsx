import { Link } from 'react-router';
import { useCart } from '../../context/CartContext'; 

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist } = useCart(); 
  
  const handleAddToCart = (e) => {
    e.preventDefault(); 
    const cartItem = {
      ...product,
      price: product.discountPrice || product.regularPrice || product.price || 0,
      size: product.sizes?.[0] || 'Standard',
      color: product.colors?.[0] || 'Default',
      qty: 1
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

  // প্রথম ও দ্বিতীয় ছবি (দ্বিতীয় ছবি না থাকলে প্রথমটাই ব্যবহার হবে)
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
  const hoverImage = product.images?.[1]?.url || mainImage;

  return (
    <div className="bg-white group transition-all duration-300 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] flex flex-col relative rounded-xl overflow-hidden border border-gray-100/60">
      
      {/* ========================================== */}
      {/* PRODUCT IMAGE SECTION (ASPECT RATIO SETUP) */}
      {/* 4:5 রেশিও এর জন্য `aspect-[4/5]` রাখা হয়েছে। */}
      {/* যদি 1:1 (Square) করতে চান, তবে `aspect-[4/5]` কেটে `aspect-square` লিখে দিন! */}
      {/* ========================================== */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link to={`/product/${product._id}`}>
          
          {/* Base Image */}
          <img 
            src={mainImage} 
            alt={product.name} 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />
          
          {/* Hover Overlay Image (Center to Corner Effect) */}
          <img 
            src={hoverImage} 
            alt={product.name} 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] 
            [clip-path:inset(50%)] group-hover:[clip-path:inset(0%)] ${hoverImage === mainImage ? 'brightness-95' : ''}`}
          />
          
          {/* Subtle Dark Overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>
        
        {/* Sale/Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm z-20">
            -{discountPercent}%
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
          
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
          
          {/* Cart Button */}
          <button 
            onClick={handleAddToCart}
            title="Add to Cart"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:scale-110 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
          
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col grow text-center bg-white z-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1.5">
          {product.category?.name || 'Category'}
        </p>
        
        <Link to={`/product/${product._id}`} className="block flex-grow">
          <h3 className="text-[13px] ubuntu-bold text-gray-900 line-clamp-1 hover:text-red-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing Area */}
        <div className="flex items-center justify-center gap-2.5 mt-auto">
          <span className="text-[15px] ubuntu-bold text-red-600">
            ৳{hasDiscount ? discountPrice : regularPrice}
          </span>
          
          {hasDiscount && (
            <span className="text-[12px] ubuntu-bold text-gray-500 line-through decoration-gray-600 decoration-1">
              ৳{regularPrice}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;