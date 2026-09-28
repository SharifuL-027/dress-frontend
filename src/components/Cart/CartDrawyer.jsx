import { useCart } from "../../context/CartContext";
import { Link } from "react-router";
import toast from "react-hot-toast"; // নোটিফিকেশনের জন্য

const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQty } = useCart();

  // মোট দাম হিসাব করা
  const subtotal = cart.reduce((acc, item) => acc + ((item.discountPrice || item.regularPrice || item.price) * item.qty), 0);

  return (
    <div 
      className={`fixed inset-0 z-[999] overflow-hidden inter-regular transition-all duration-300 ${
        isCartOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      
      {/* ব্যাকগ্রাউন্ড ওভারলে (স্মুথ ফেড-ইন) */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* ডান পাশ থেকে স্মুথলি স্লাইড হয়ে আসা ড্রয়ার কন্টেইনার */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          className={`w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
            <h2 className="text-[13px] inter-bold text-gray-900 uppercase tracking-[0.15em]">
              Shopping Cart <span className="text-red-600 ml-1">({cart.reduce((acc, item) => acc + item.qty, 0)})</span>
            </h2>
            <button 
              onClick={closeCart}
              className="text-gray-400 hover:text-red-500 inter-bold text-lg p-2 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 divide-y divide-gray-50 bg-white">
            {cart.length === 0 ? (
              <div className="text-center py-32 text-gray-400">
                <span className="text-6xl mb-4 block animate-bounce">🛒</span>
                <p className="text-[13px] inter-bold uppercase tracking-widest text-gray-800">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-2 tracking-wide inter-medium">Explore our collection and add your favorite items.</p>
                <button 
                  onClick={closeCart}
                  className="mt-8 inline-block bg-gray-900 text-white px-8 py-3.5 text-[11px] inter-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-md cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => {
                // এই আইটেমের সর্বোচ্চ এভেইলেবল স্টক কতো তা বের করা
                const maxAvailable = item.maxStock || item.stock || item.totalStock || 1;

                return (
                  <div key={index} className="flex gap-5 pt-5 first:pt-0 items-center group">
                    
                    {/* Image */}
                    <div className="relative w-20 h-24 bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                      <img 
                        src={item.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs inter-bold text-gray-900 uppercase tracking-wide truncate">{item.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider inter-medium">
                        Size: <span className="text-gray-900 inter-bold">{item.size}</span> | Color: <span className="text-gray-900 inter-bold">{item.color}</span>
                      </p>
                      <p className="text-[13px] inter-bold text-red-600 mt-2">
                        ৳{item.discountPrice || item.regularPrice || item.price}
                      </p>
                      
                      {/* Quantity Modifier (With Stock Check) */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="inline-flex items-center border border-gray-200 bg-gray-50/50">
                          <button 
                            onClick={() => updateQty(item._id, item.size, item.color, item.qty - 1)}
                            className="px-3 py-1 text-xs inter-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs inter-bold text-gray-900 w-8 text-center">{item.qty}</span>
                          <button 
                            onClick={() => {
                              if (item.qty < maxAvailable) {
                                updateQty(item._id, item.size, item.color, item.qty + 1);
                              } else {
                                toast.error(`Only ${maxAvailable} left in stock for this variant!`, { position: 'bottom-center' });
                              }
                            }}
                            className="px-3 py-1 text-xs inter-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item._id, item.size, item.color)}
                      className="text-gray-300 hover:text-red-500 p-2 text-sm transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-6 bg-gray-50 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] inter-bold uppercase tracking-widest text-gray-500">Subtotal</span>
                <span className="text-lg inter-bold text-red-600">৳{subtotal}</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center inter-medium">Shipping & taxes calculated at checkout</p>
              
              <div className="grid grid-cols-2 gap-4 pt-1">
                <Link 
                  to="/cart" 
                  onClick={closeCart}
                  className="w-full bg-white border border-gray-900 text-gray-900 text-center py-3.5 text-[11px] inter-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
                >
                  View Cart
                </Link>
                <Link 
                  to="/checkout" 
                  onClick={closeCart}
                  className="w-full bg-red-600 text-white text-center py-3.5 text-[11px] inter-bold uppercase tracking-widest hover:bg-red-700 transition-colors shadow-md"
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