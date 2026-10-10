import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import api from "../../api/axios";
import toast from "react-hot-toast";

const OrderDetailsPage = () => {
  const { id } = useParams(); // URL থেকে অর্ডার আইডি নেওয়া হচ্ছে
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // ব্যাকএন্ড থেকে নির্দিষ্ট অর্ডারের ডেটা আনা (আপনার API রুট অনুযায়ী এটি অ্যাডজাস্ট করে নিতে পারেন)
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        toast.error("Failed to load order details!");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="text-xs inter-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Loading Order Details...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex justify-center items-center flex-col gap-4">
        <span className="text-4xl">❌</span>
        <h2 className="text-sm inter-bold text-gray-800 uppercase tracking-widest">Order Not Found</h2>
        <Link to="/my-orders" className="bg-black text-white px-6 py-2.5 text-[11px] uppercase tracking-widest">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const orderStatus = order.orderStatus || order.status || "Processing";
  const shippingAddress = order.shippingAddress || {};

  return (
    <div className="max-w-250 mx-auto px-4 md:px-8 mt-8 md:mt-32 mb-24 font-sans text-gray-800">
      
      {/* Top Navigation / Back */}
      <div className="mb-6">
        <Link to="/my-orders" className="text-xs inter-bold text-gray-500 hover:text-red-600 uppercase tracking-wider transition-colors">
          &larr; Back to My Orders
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-sm shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl inter-bold text-black uppercase tracking-wider mb-1">
            Order #{order._id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div>
          <span className="px-4 py-1.5 text-[11px] inter-bold uppercase tracking-wider border rounded-full bg-blue-50 text-blue-700 border-blue-200">
            {orderStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Shipping Address */}
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h3 className="text-xs inter-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
            Shipping Address
          </h3>
          <p className="text-xs inter-bold text-gray-900 uppercase mb-1">{shippingAddress.fullName || order.user?.name || "Customer"}</p>
          <p className="text-xs text-gray-600 mb-1">{shippingAddress.address || "N/A"}</p>
          <p className="text-xs text-gray-600 mb-1">{shippingAddress.city || ""}, {shippingAddress.postalCode || ""}</p>
          <p className="text-xs text-gray-600 mt-2"><span className="inter-bold text-gray-800">Phone:</span> {shippingAddress.phone || "N/A"}</p>
        </div>

        {/* Payment Info */}
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h3 className="text-xs inter-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
            Payment Information
          </h3>
          <p className="text-xs text-gray-600 mb-2"><span className="inter-bold text-gray-800 uppercase">Method:</span> {order.paymentMethod || "Cash on Delivery"}</p>
          <p className="text-xs text-gray-600 mb-2">
            <span className="inter-bold text-gray-800 uppercase">Status:</span>{" "}
            <span className={order.isPaid ? "text-green-600 inter-bold" : "text-orange-600 inter-bold"}>
              {order.isPaid ? "Paid" : "Unpaid (COD)"}
            </span>
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
          <h3 className="text-xs inter-bold text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100">
            Cost Summary
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="inter-bold text-gray-900">৳{order.itemsPrice || order.totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="inter-bold text-gray-900">৳{order.shippingPrice || 0}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 text-sm inter-bold text-red-600">
              <span>Total:</span>
              <span>৳{order.totalPrice || order.totalAmount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Ordered Items List */}
      <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-sm shadow-sm">
        <h3 className="text-xs inter-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-100">
          Ordered Items ({order.orderItems?.length || 0})
        </h3>

        <div className="space-y-4">
          {order.orderItems?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                  <img src={item.image || item.images?.[0]?.url || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs inter-bold text-gray-900 uppercase">{item.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 uppercase">
                    Size: <span className="inter-bold text-gray-800">{item.size || 'N/A'}</span> | Color: <span className="inter-bold text-gray-800">{item.color || 'N/A'}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 uppercase">Qty: {item.qty}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs inter-bold text-red-600">৳{item.price * item.qty}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default OrderDetailsPage;