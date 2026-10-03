import { NavLink, Outlet, Link } from "react-router"; 
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuth();

  // Sidebar-er link gulor design
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3 text-[14px] font-semibold transition-all duration-300 border-l-4 ${
      isActive
        ? "border-red-500 bg-red-50 text-red-600"
        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-red-500"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* Sidebar Section */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        {/* Admin Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100">
          <Link to="/" className="text-2xl inter-bold text-gray-800 tracking-widest">
            Dress<span className="text-red-500">Town</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
          <p className="px-6 text-[10px] inter-bold text-gray-600 uppercase tracking-widest mb-2">Main Menu</p>
          
          <NavLink to="/admin/dashboard" end className={navLinkClass}>
            Dashboard
          </NavLink>
          
          <NavLink to="/admin/products" className={navLinkClass}>
            Products
          </NavLink>
          
          <NavLink to="/admin/add-product" className={navLinkClass}>
            Add Product
          </NavLink>
          
          <NavLink to="/admin/categories" className={navLinkClass}>
            Categories
          </NavLink>
          
          <NavLink to="/admin/orders" className={navLinkClass}>
            Orders
          </NavLink>
          
          <NavLink to="/admin/users" className={navLinkClass}>
            Customers
          </NavLink>
           <NavLink to="/admin/banners" className={navLinkClass}>
            Banners
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkClass}>
            Settings
          </NavLink>
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-gray-100 p-4 flex flex-col gap-2">
          <Link to="/" className="flex items-center justify-center gap-2 px-4 py-2 text-sm inter-bold text-gray-600 border border-gray-200 hover:border-red-500 hover:text-red-500 transition-colors">
            Back to Store
          </Link>
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm inter-bold bg-gray-800 text-white hover:bg-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Section (Right Side) */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Ekhanei onnanyo sob admin page load hobe */}
          <Outlet /> 
        </div>
      </main>
      
    </div>
  );
};

export default AdminLayout;