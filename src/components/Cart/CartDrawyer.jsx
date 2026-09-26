import { useCart } from "../../context/CartContext";
import { Link } from "react-router";

const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQty } = useCart();

  if (!isCartOpen) return null;

  // মোট দাম হিসাব করা
  const subtotal = cart.reduce((acc, item) => acc + ((item.discountPrice || item.regularPrice || item.price) * item.qty), 0);

  return (
    <div className="fixed inset-0 z-999 overflow-hidden font-sans">
      
      {/* ব্যাকগ্রাউন্ড ওভারলে (স্মুথ ফেড-ইন) */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* ডান পাশ থেকে স্মুথলি স্লাইড হয়ে আসা ড্রয়ার কন্টেইনার */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className={`w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
            <h2 className="text-xs ubuntu-bold text-gray-900 uppercase tracking-[0.2em]">
              Shopping Cart <span className="text-black">({cart.reduce((acc, item) => acc + item.qty, 0)})</span>
            </h2>
            <button 
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-900 ubuntu-bold text-base p-2 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 divide-y divide-gray-50">
            {cart.length === 0 ? (
              <div className="text-center py-32 text-gray-400">
                <span className="text-5xl mb-4 block animate-bounce">🛒</span>
                <p className="text-xs ubuntu-bold uppercase tracking-wide text-gray-700">Your cart is empty</p>
                <p className="text-[11px] text-gray-400 mt-1">Explore our collection and add your favorite items.</p>
                <button 
                  onClick={closeCart}
                  className="mt-8 inline-block bg-gray-900 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex gap-4 pt-4 first:pt-0 items-center">
                  <div className="relative w-16 h-20 bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                    <img 
                      src={item.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide truncate">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                      Size: <span className="text-gray-700 font-bold">{item.size}</span> | Color: <span className="text-gray-700 font-bold">{item.color}</span>
                    </p>
                    <p className="text-xs ubuntu-bold text-red-600 mt-1.5">
                      ৳{item.discountPrice || item.regularPrice || item.price}
                    </p>
                    
                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="inline-flex items-center border border-gray-200 bg-gray-50">
                        <button 
                          onClick={() => updateQty(item._id, item.size, item.color, item.qty - 1)}
                          className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs ubuntu-extrabold text-gray-800">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item._id, item.size, item.color, item.qty + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item._id, item.size, item.color)}
                    className="text-gray-300 hover:text-red-600 p-2 text-xs transition-colors cursor-pointer"
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
            <div className="border-t border-gray-100 px-6 py-6 bg-gray-50/70 space-y-4">
              <div className="flex justify-between items-center text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                <span className="text-xs tracking-widest text-gray-500">Subtotal</span>
                <span className="text-red-600 text-base">৳{subtotal}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Shipping & taxes calculated at checkout</p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link 
                  to="/cart" 
                  onClick={closeCart}
                  className="w-full bg-white border border-gray-300 text-gray-800 text-center py-3.5 text-[11px] font-bold uppercase tracking-widest hover:border-gray-900 transition-colors"
                >
                  View Cart
                </Link>
                <Link 
                  to="/checkout" 
                  onClick={closeCart}
                  className="w-full bg-red-600 text-white text-center py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm"
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