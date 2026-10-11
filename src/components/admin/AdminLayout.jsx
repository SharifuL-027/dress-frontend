import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router"; 
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiX, FiLogOut, FiHome } from "react-icons/fi";

const AdminLayout = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // মেনু লিংকের ডিজাইন (একই ডিজাইন মোবাইল ও ডেস্কটপে কাজ করবে)
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3 text-[14px] font-semibold transition-all duration-300 md:border-l-4 ${
      isActive
        ? "md:border-red-500 bg-red-50 text-red-600 border-l-4 border-red-500 md:border-l-4"
        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-red-500 border-l-4 border-transparent"
    }`;

  // মেনু আইটেমগুলোর লিস্ট
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", end: true },
    { name: "Products", path: "/admin/products" },
    { name: "Add Product", path: "/admin/add-product" },
    { name: "Categories", path: "/admin/categories" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Customers", path: "/admin/users" },
    { name: "Banners", path: "/admin/banners" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      
      {/* ================= MOBILE TOP NAVBAR ================= */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl inter-bold text-gray-800 tracking-widest">
          Dress<span className="text-red-500">Town</span> <span className="text-[10px] text-gray-400 font-normal">ADMIN</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-red-500 transition-colors"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ================= MOBILE DROPDOWN MENU ================= */}
      <div className={`md:hidden fixed top-[60px] left-0 w-full h-[calc(100vh-60px)] bg-white z-40 transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
        <nav className="flex flex-col py-4">
          <p className="px-6 text-[10px] inter-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
          {menuItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              end={item.end} 
              className={navLinkClass}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        {/* Mobile Bottom Actions */}
        <div className="border-t border-gray-100 p-6 flex flex-col gap-3 mt-auto">
          <Link to="/" className="flex items-center justify-center gap-2 w-full py-3 text-xs inter-bold text-gray-600 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors rounded-sm">
            <FiHome /> Back to Store
          </Link>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 text-xs inter-bold bg-black text-white hover:bg-red-600 transition-colors rounded-sm"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-10">
        <div className="h-20 flex flex-col items-center justify-center border-b border-gray-100">
          <Link to="/" className="text-2xl inter-bold text-gray-800 tracking-widest">
            Dress<span className="text-red-500">Town</span>
          </Link>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Admin Panel</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
          <p className="px-6 text-[10px] inter-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
          {menuItems.map((item) => (
            <NavLink key={item.name} to={item.path} end={item.end} className={navLinkClass}>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4 flex flex-col gap-2">
          <Link to="/" className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs inter-bold text-gray-600 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors rounded-sm">
            <FiHome size={16} /> Back to Store
          </Link>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs inter-bold bg-black text-white hover:bg-red-600 transition-colors rounded-sm cursor-pointer"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT SECTION ================= */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <Outlet /> 
        </div>
      </main>
      
    </div>
  );
};

export default AdminLayout;