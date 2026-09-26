import { useCart } from "../context/CartContext";
import { Link } from "react-router";

const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQty } = useCart();

  if (!isCartOpen) return null;

  // মোট দাম হিসাব করা
  const subtotal = cart.reduce((acc, item) => acc + ((item.discountPrice || item.regularPrice || item.price) * item.qty), 0);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden font-sans">
      {/* ব্যাকগ্রাউন্ড ওভারলে (ক্লিক করলে ড্রয়ার বন্ধ হবে) */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      {/* ডান পাশ থেকে স্লাইড হয়ে আসা ড্রয়ার */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest">
              Shopping Cart ({cart.reduce((acc, item) => acc + item.qty, 0)})
            </h2>
            <button 
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-900 font-bold text-lg p-1 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-28 text-gray-400">
                <span className="text-5xl mb-3 block">🛒</span>
                <p className="text-xs font-bold uppercase tracking-widest">Your cart is empty</p>
                <button 
                  onClick={closeCart}
                  className="mt-6 inline-block bg-gray-900 text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 items-center">
                  <img 
                    src={item.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                    alt={item.name} 
                    className="w-16 h-20 object-cover border border-gray-200 bg-gray-50"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-800 uppercase line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase">Size: {item.size} | Color: {item.color}</p>
                    <p className="text-xs font-extrabold text-red-600 mt-1">
                      ৳{item.discountPrice || item.regularPrice || item.price}
                    </p>
                    
                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-300">
                        <button 
                          onClick={() => updateQty(item._id, item.size, item.color, item.qty - 1)}
                          className="px-2.5 py-0.5 text-xs font-bold hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item._id, item.size, item.color, item.qty + 1)}
                          className="px-2.5 py-0.5 text-xs font-bold hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item._id, item.size, item.color)}
                    className="text-gray-400 hover:text-red-600 p-2 text-xs transition-colors"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-6 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                <span>Subtotal:</span>
                <span className="text-red-600 text-base">৳{subtotal}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Shipping & taxes calculated at checkout</p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link 
                  to="/cart" 
                  onClick={closeCart}
                  className="w-full bg-gray-900 text-white text-center py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
                >
                  View Cart
                </Link>
                <Link 
                  to="/checkout" 
                  onClick={closeCart}
                  className="w-full bg-red-600 text-white text-center py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;