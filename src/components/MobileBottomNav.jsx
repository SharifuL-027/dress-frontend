import { Link, useLocation } from "react-router";
import { FiHome, FiGrid, FiShoppingCart, FiUser } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { cart, openCart } = useCart();

  // কোন পেজে আছি তা চেক করা
  const isActive = (path) => location.pathname === path;

  // কার্টে মোট কয়টি আইটেম আছে তা বের করা
  const cartItemCount = cart?.reduce((acc, item) => acc + item.qty, 0) || 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16">
        
        {/* Home */}
        <Link to="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-red-600 transition-colors">
          <FiHome size={22} className={isActive("/") ? "text-red-600" : ""} />
          <span className={`text-[9px] inter-bold mt-1 uppercase tracking-wider ${isActive("/") ? "text-red-600" : ""}`}>Home</span>
        </Link>

        {/* Shop */}
        <Link to="/shop" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-red-600 transition-colors">
          <FiGrid size={22} className={isActive("/shop") ? "text-red-600" : ""} />
          <span className={`text-[9px] inter-bold mt-1 uppercase tracking-wider ${isActive("/shop") ? "text-red-600" : ""}`}>Shop</span>
        </Link>

        {/* Cart (Click করলে Cart Drawer ওপেন হবে) */}
        <button onClick={openCart} className="relative flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-red-600 transition-colors cursor-pointer">
          <div className="relative">
            <FiShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[9px] inter-bold mt-1 uppercase tracking-wider">Cart</span>
        </button>

        {/* Profile / Account */}
        <Link to="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-red-600 transition-colors">
          <FiUser size={22} className={isActive("/profile") ? "text-red-600" : ""} />
          <span className={`text-[9px] inter-bold mt-1 uppercase tracking-wider ${isActive("/profile") ? "text-red-600" : ""}`}>Account</span>
        </Link>

      </div>
    </div>
  );
};

export default MobileBottomNav;