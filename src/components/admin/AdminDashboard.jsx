import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  // Backend theke dynamic data fetch kora
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/users/dashboard-stats'); 
        setStatsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
        <p className="text-xs inter-bold text-gray-500 uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  // Frontend-e dekhabar jonno premium stat cards array
  const statCards = [
    { 
      title: "Total Revenue", 
      value: `৳ ${statsData.totalRevenue?.toLocaleString() || 0}`, 
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      bgColor: "bg-emerald-50",
      borderColor: "group-hover:border-emerald-500"
    },
    { 
      title: "Total Orders", 
      value: statsData.totalOrders || 0, 
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ), 
      bgColor: "bg-blue-50",
      borderColor: "group-hover:border-blue-500"
    },
    { 
      title: "Total Products", 
      value: statsData.totalProducts || 0, 
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ), 
      bgColor: "bg-red-50",
      borderColor: "group-hover:border-red-500"
    },
    { 
      title: "Active Customers", 
      value: statsData.totalCustomers || 0, 
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ), 
      bgColor: "bg-purple-50",
      borderColor: "group-hover:border-purple-500"
    },
  ];

  // স্ট্যাটাস অনুযায়ী ব্যাজের কালার ঠিক করার ফাংশন
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Pending
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 pb-4 md:pb-5 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl inter-bold text-gray-900 tracking-wide uppercase">
            Dashboard Overview
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1 inter-medium">
            Real-time store statistics and recent activities.
          </p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="w-full sm:w-auto bg-gray-900 hover:bg-red-600 text-white px-5 md:px-6 py-2.5 md:py-3 inter-bold text-[11px] md:text-xs uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-2 rounded-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* ================= 4 STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white p-5 md:p-6 border border-gray-100 rounded-sm shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 group ${stat.borderColor}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] md:text-[11px] inter-bold text-gray-400 uppercase tracking-widest mb-1">
                  {stat.title}
                </p>
                <h3 className="text-xl md:text-2xl inter-bold text-gray-900 mt-1 md:mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full ${stat.bgColor} transition-transform group-hover:scale-110 duration-300`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= RECENT ORDERS TABLE ================= */}
      <div className="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
        
        {/* Table Header Area */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-[13px] md:text-[15px] inter-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Recent Orders
          </h2>
          <Link to="/admin/orders" className="text-[10px] md:text-[11px] inter-bold text-gray-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1 group">
            View All 
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        
        {/* Table Content (Responsive Wrapper) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500">
                <th className="p-4 md:p-5 inter-bold whitespace-nowrap">Order ID</th>
                <th className="p-4 md:p-5 inter-bold whitespace-nowrap">Customer</th>
                <th className="p-4 md:p-5 inter-bold whitespace-nowrap">Date</th>
                <th className="p-4 md:p-5 inter-bold whitespace-nowrap">Total Amount</th>
                <th className="p-4 md:p-5 inter-bold text-right whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs md:text-sm">
              {statsData.recentOrders?.length > 0 ? (
                statsData.recentOrders.map((order, index) => (
                  <tr key={order._id || index} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors group">
                    
                    {/* Order ID */}
                    <td className="p-4 md:p-5 inter-semibold text-gray-900">
                      #{order._id ? order._id.substring(0, 8).toUpperCase() : 'N/A'}
                    </td>
                    
                    {/* Customer Name */}
                    <td className="p-4 md:p-5 flex items-center gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] md:text-xs inter-bold text-gray-600 shrink-0">
                        {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div className="min-w-0">
                        <p className="inter-semibold text-gray-800 truncate">{order.user?.name || 'Guest User'}</p>
                        <p className="text-[10px] md:text-[11px] text-gray-500 inter-medium truncate">{order.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    
                    {/* Date */}
                    <td className="p-4 md:p-5 text-gray-600 text-xs md:text-[13px] inter-medium whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    
                    {/* Total */}
                    <td className="p-4 md:p-5 inter-bold text-gray-900 whitespace-nowrap">
                      ৳ {order.totalPrice?.toLocaleString() || 0}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="p-4 md:p-5 text-right">
                      <span className={`inline-block px-2.5 py-1 md:px-3 md:py-1.5 text-[9px] md:text-[10px] inter-bold uppercase tracking-widest rounded-sm border ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 md:p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-10 h-10 md:w-12 md:h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-xs md:text-sm inter-medium">No recent orders found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;