import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../../api/axios";
import toast from "react-hot-toast";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ব্যাকএন্ড থেকে ডাইনামিক অর্ডার ডেটা ফেচ করা
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/myorders');
        setOrders(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(true);
        setLoading(false);
        toast.error("Failed to load your orders!");
      }
    };

    fetchMyOrders();
  }, []);

  // স্ট্যাটাস অনুযায়ী ব্যাজের কালার
  const getStatusColor = (status) => {
    const currentStatus = status ? status.toLowerCase() : 'processing';
    switch (currentStatus) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
      case 'pending':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // ডেট ফরম্যাট করার ফাংশন
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="text-xs ubuntu-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Your Orders...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center flex-col gap-4">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-sm ubuntu-bold text-red-600 uppercase tracking-widest">Something went wrong!</h2>
        <button onClick={() => window.location.reload()} className="bg-black text-white px-6 py-2 text-[11px] uppercase tracking-widest">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 mt-32 mb-24 font-sans">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl ubuntu-bold text-black uppercase tracking-[0.15em]">
          My Orders
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
      </div>

      {orders.length === 0 ? (
        // Empty State
        <div className="text-center py-20 bg-gray-50 border border-gray-200 shadow-sm">
          <span className="text-6xl mb-4 block">📦</span>
          <h2 className="text-lg ubuntu-bold text-gray-900 uppercase tracking-widest mb-2">No orders found</h2>
          <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">You haven't placed any orders yet.</p>
          <Link 
            to="/" 
            className="inline-block bg-black text-white px-8 py-3.5 text-[11px] ubuntu-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        // Order List
        <div className="space-y-8">
          {orders.map((order) => {
            const orderStatus = order.orderStatus || order.status || "Processing";
            const totalAmount = order.totalPrice || order.totalAmount || order.total || 0;
            const itemCount = order.orderItems?.length || 0;
            const payment = order.paymentMethod || "Cash on Delivery";
            const shortId = order._id.substring(0, 8).toUpperCase();

            return (
              <div 
                key={order._id} 
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                
                {/* ================= ORDER INFO HEADER ================= */}
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-3 flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-sm ubuntu-bold text-black uppercase tracking-widest">
                        Order #{shortId}
                      </h3>
                      <span className={`px-3 py-1 text-[10px] ubuntu-bold uppercase tracking-wider border rounded-full ${getStatusColor(orderStatus)}`}>
                        {orderStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] uppercase tracking-wider text-gray-500 pt-2">
                      <div>
                        <span className="block font-bold text-gray-400 mb-0.5">Order Date</span>
                        <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-gray-400 mb-0.5">Total Amount</span>
                        <span className="text-red-600 ubuntu-bold text-sm">৳{totalAmount}</span>
                      </div>
                      <div>
                        <span className="block font-bold text-gray-400 mb-0.5">Items</span>
                        <span className="text-gray-900">{itemCount} Products</span>
                      </div>
                      <div>
                        <span className="block font-bold text-gray-400 mb-0.5">Payment</span>
                        <span className="text-gray-900">{payment}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                    <Link 
                      to={`/order/${order._id}`} 
                      className="block w-full md:w-auto text-center border border-gray-900 text-gray-900 px-6 py-3 text-[11px] ubuntu-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* ================= ORDERED PRODUCTS LIST ================= */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
                    <h4 className="text-[10px] ubuntu-bold text-gray-400 uppercase tracking-widest mb-4">
                      Products in this order
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white p-3 border border-gray-100 hover:border-gray-300 transition-colors">
                          
                          {/* Product Image */}
                          <div className="w-16 h-20 bg-gray-100 shrink-0 border border-gray-100 overflow-hidden">
                            <img 
                              src={item.image || item.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.product}`} className="text-[11px] ubuntu-bold uppercase tracking-wide truncate text-gray-900 hover:text-red-600 block mb-1 transition-colors">
                              {item.name}
                            </Link>
                            
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                              Size: <span className="font-bold text-gray-800">{item.size || 'N/A'}</span> | 
                              Color: <span className="font-bold text-gray-800">{item.color || 'N/A'}</span>
                            </p>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                QTY: {item.qty}
                              </span>
                              <span className="text-xs ubuntu-bold text-red-600">
                                ৳{item.price}
                              </span>
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyOrdersPage;s