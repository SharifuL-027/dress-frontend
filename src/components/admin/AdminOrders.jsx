import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      
      // যদি মডাল ওপেন থাকে, সেখানেও রিয়েল-টাইম স্ট্যাটাস আপডেট করা
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
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

  // মডাল ওপেন ও ক্লোজ ফাংশন
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500 uppercase">Loading Orders...</div>;

  const filteredOrders = orders.filter(order => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return order.status === "Pending" || order.status === "Processing";
    if (activeTab === "Shipped") return order.status === "Shipped";
    if (activeTab === "Delivered") return order.status === "Delivered";
    return true;
  });

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="w-full relative">
      
      {/* 4 Clickable State Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => setActiveTab("All")} className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "All" ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-200 hover:border-gray-800 border-l-4 border-l-gray-800"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "All" ? "text-gray-300" : "text-gray-400"}`}>All Orders</p>
            <span className="text-xl">📦</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "All" ? "text-white" : "text-gray-800"}`}>{totalOrdersCount}</h3>
        </div>

        <div onClick={() => setActiveTab("Pending")} className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "Pending" ? "bg-yellow-500 border-yellow-500 text-white" : "bg-white border-gray-200 hover:border-yellow-500 border-l-4 border-l-yellow-500"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "Pending" ? "text-yellow-100" : "text-gray-400"}`}>Pending / Processing</p>
            <span className="text-xl">⏳</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "Pending" ? "text-white" : "text-gray-800"}`}>{pendingOrdersCount}</h3>
        </div>

        <div onClick={() => setActiveTab("Shipped")} className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "Shipped" ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-gray-200 hover:border-purple-500 border-l-4 border-l-purple-500"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "Shipped" ? "text-purple-100" : "text-gray-400"}`}>Shipped</p>
            <span className="text-xl">🚚</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "Shipped" ? "text-white" : "text-gray-800"}`}>{shippedOrdersCount}</h3>
        </div>

        <div onClick={() => setActiveTab("Delivered")} className={`cursor-pointer border p-6 shadow-sm transition-all ${activeTab === "Delivered" ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 hover:border-green-500 border-l-4 border-l-green-500"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[11px] font-bold uppercase tracking-widest ${activeTab === "Delivered" ? "text-green-100" : "text-gray-400"}`}>Delivered</p>
            <span className="text-xl">✅</span>
          </div>
          <h3 className={`text-3xl font-extrabold mt-2 ${activeTab === "Delivered" ? "text-white" : "text-gray-800"}`}>{deliveredOrdersCount}</h3>
        </div>
      </div>

      {/* Filtered Order Table */}
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
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No {activeTab.toLowerCase()} orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-gray-800">{order.user?.name || "Unknown User"}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.shippingAddress?.phone}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-red-500">৳ {order.totalPrice}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{order.paymentMethod}</p>
                    </td>
                    <td className="p-4">
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
                    <td className="p-4 text-right">
                      {/* View Details Button */}
                      <button 
                        onClick={() => openModal(order)}
                        className="bg-gray-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- ORDER DETAILS MODAL ----------------- */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gray-50 p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-red-500 font-bold text-3xl leading-none">&times;</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Customer & Shipping */}
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Customer Details</h3>
                <p className="text-sm text-gray-800"><span className="font-bold">Name:</span> {selectedOrder.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-800 mt-2"><span className="font-bold">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                <p className="text-sm text-gray-800 mt-2"><span className="font-bold">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>

                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-8 mb-4 border-b pb-2">Shipping Address</h3>
                <p className="text-sm text-gray-800">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-sm text-gray-800 mt-1">{selectedOrder.shippingAddress?.city}</p>
              </div>

              {/* Right Column: Order Info & Payment */}
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Order Status</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-sm items-center">
                    <span className="font-bold text-gray-800">Status:</span>
                    <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 uppercase border cursor-pointer outline-none ${getStatusColor(selectedOrder.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-800">Payment Method:</span>
                    <span className="text-gray-600 font-medium uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-800">Payment Status:</span>
                    <span className={`px-2 py-1 text-xs font-bold uppercase border ${selectedOrder.isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                      {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Items Table */}
            <div className="px-6 pb-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Order Items</h3>
              <div className="border border-gray-200">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="p-3">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover border border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">N/A</div>
                            )}
                            <div>
                              <p className="font-bold text-sm text-gray-800">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm font-bold text-gray-800">x{item.qty}</td>
                        <td className="p-3 text-right text-sm text-gray-600">৳ {item.price}</td>
                        <td className="p-3 text-right text-sm font-bold text-gray-800">৳ {item.qty * item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Calculation Summary */}
            <div className="px-6 pb-8 flex justify-end">
              <div className="w-full md:w-1/2 lg:w-1/3 space-y-3 bg-gray-50 p-6 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Subtotal:</span>
                  <span className="font-bold text-gray-800">৳ {selectedOrder.itemsPrice || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Delivery Charge:</span>
                  <span className="font-bold text-gray-800">+ ৳ {selectedOrder.shippingPrice || 0}</span>
                </div>
                
                <div className="flex justify-between text-base mt-2">
                  <span className="font-extrabold text-gray-800 uppercase tracking-widest">Grand Total:</span>
                  <span className="font-extrabold text-red-600">৳ {selectedOrder.totalPrice || 0}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;