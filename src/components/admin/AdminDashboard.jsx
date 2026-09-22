import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios"; // Apnar axios instance er sothik path diben

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
        // Backend route onujayi path ta milaia niben
        const { data } = await api.get('/api/users/dashboard-stats'); // ba jekhane route ti rekhechen
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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Frontend-e dekhabar jonno array toiri (Data ekhon dynamic)
  const statCards = [
    { title: "Total Revenue", value: `৳ ${statsData.totalRevenue}`, icon: "💰", color: "text-green-600" },
    { title: "Total Orders", value: statsData.totalOrders, icon: "📦", color: "text-blue-600" },
    { title: "Total Products", value: statsData.totalProducts, icon: "👗", color: "text-red-500" },
    { title: "Active Customers", value: statsData.totalCustomers, icon: "👥", color: "text-purple-600" },
  ];

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-wider uppercase">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time store statistics from database.</p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 font-bold text-sm uppercase tracking-wider transition-colors shadow-sm"
        >
          + Add New Product
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 border border-gray-200 hover:border-red-500 transition-colors shadow-sm group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.title}</p>
                <h3 className="text-2xl font-extrabold text-gray-800 group-hover:text-red-500 transition-colors">
                  {stat.value}
                </h3>
              </div>
              <div className={`text-2xl bg-gray-50 w-10 h-10 flex items-center justify-center border border-gray-100 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-400">
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {statsData.recentOrders.length > 0 ? (
                statsData.recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                    {/* Order details map hobe jokhon data thakbe */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                    No recent orders found in the database.
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