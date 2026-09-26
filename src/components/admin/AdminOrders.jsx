import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // কোন ট্যাবটি বর্তমানে সিলেক্ট করা আছে তার স্টেট (ডিফল্ট: All Orders)
  const [activeTab, setActiveTab] = useState("All");

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/api/orders");
      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      setOrders(orders.map(order => order._id === id ? { ...order, status: newStatus } : order));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status!");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500 uppercase">Loading Orders...</div>;

  // ---------------------------------------------------------
  // ফিল্টারিং লজিক: activeTab এর উপর ভিত্তি করে অর্ডার ফিল্টার করা
  // ---------------------------------------------------------
  const filteredOrders = orders.filter(order => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return order.status === "Pending" || order.status === "Processing";
    if (activeTab === "Shipped") return order.status === "Shipped";
    if (activeTab === "Delivered") return order.status === "Delivered";
    return true;
  });

  // কার্ডের জন্য কাউন্টিং
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="w-full">
      
      {/* ----------------- 4 Clickable State Cards (Tabs) ----------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div 
          onClick={() => setActiveTab("All")}
          className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "All" ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-200 hover:border-gray-800 border-l-4 border-l-gray-800"}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "All" ? "text-gray-300" : "text-gray-400"}`}>All Orders</p>
            <span className="text-xl">📦</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "All" ? "text-white" : "text-gray-800"}`}>{totalOrdersCount}</h3>
        </div>

        <div 
          onClick={() => setActiveTab("Pending")}
          className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "Pending" ? "bg-yellow-500 border-yellow-500 text-white" : "bg-white border-gray-200 hover:border-yellow-500 border-l-4 border-l-yellow-500"}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "Pending" ? "text-yellow-100" : "text-gray-400"}`}>Pending / Processing</p>
            <span className="text-xl">⏳</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "Pending" ? "text-white" : "text-gray-800"}`}>{pendingOrdersCount}</h3>
        </div>

        <div 
          onClick={() => setActiveTab("Shipped")}
          className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "Shipped" ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-gray-200 hover:border-purple-500 border-l-4 border-l-purple-500"}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "Shipped" ? "text-purple-100" : "text-gray-400"}`}>Shipped</p>
            <span className="text-xl">🚚</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "Shipped" ? "text-white" : "text-gray-800"}`}>{shippedOrdersCount}</h3>
        </div>

        <div 
          onClick={() => setActiveTab("Delivered")}
          className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "Delivered" ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 hover:border-green-500 border-l-4 border-l-green-500"}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "Delivered" ? "text-green-100" : "text-gray-400"}`}>Delivered</p>
            <span className="text-xl">✅</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "Delivered" ? "text-white" : "text-gray-800"}`}>{deliveredOrdersCount}</h3>
        </div>

      </div>

      {/* ----------------- Filtered Order Table ----------------- */}
      <div className="w-full bg-white border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-widest">
              {activeTab === "All" ? "All Orders" : `${activeTab} Orders`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Showing {filteredOrders.length} results.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Info</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 text-right">Action / Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No {activeTab.toLowerCase()} orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    
                    <td className="p-4">
                      <p className="font-bold text-sm text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-sm text-gray-800">
                        {order.user?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.shippingAddress?.phone} | {order.shippingAddress?.city}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {order.orderItems?.length || 0} Items
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-sm text-red-500">৳ {order.totalPrice}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                        {order.paymentMethod} {order.isPaid ? '(PAID)' : ''}
                      </p>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4 text-right">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 uppercase border cursor-pointer outline-none ${getStatusColor(order.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;