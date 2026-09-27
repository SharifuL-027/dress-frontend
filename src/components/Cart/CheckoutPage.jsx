import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import api from "../../api/axios"; // আপনার API instance ইমপোর্ট করা হলো

const CheckoutPage = () => {
  // clearCart ফাংশনটি CartContext থেকে নিয়ে আসা হলো (যাতে অর্ডারের পর কার্ট খালি হয়ে যায়)
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "Dhaka",
    address: "",
    notes: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // হিসাব-নিকাশ
  const subtotal = cart.reduce((acc, item) => acc + ((item.discountPrice || item.regularPrice || item.price) * item.qty), 0);
  const shippingCost = formData.city === "Dhaka" ? 60 : 120;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // REAL API CALL FOR PLACING ORDER
  // ==========================================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setIsProcessing(true);

    try {
      // ব্যাকএন্ডে পাঠানোর জন্য ডেটা প্রস্তুত করা হচ্ছে
      const orderData = {
        orderItems: cart.map(item => ({
          product: item.product || item._id, // প্রোডাক্ট আইডি
          name: item.name,
          image: item.images?.[0]?.url || item.image || 'https://via.placeholder.com/100',
          price: item.discountPrice || item.regularPrice || item.price,
          qty: item.qty,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          fullName: formData.name,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          notes: formData.notes
        },
        paymentMethod: "Cash on Delivery",
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        totalPrice: total
      };

      // আপনার ডাটাবেসে অর্ডার সেভ করার API Call
      const { data } = await api.post('/api/orders', orderData);

      toast.success("🎉 Order placed successfully!");
      
      // অর্ডার সাকসেসফুল হলে কার্ট ক্লিয়ার করে দিন
      if (clearCart) {
        clearCart();
      }

      // ইউজারকে সরাসরি My Orders পেজে পাঠিয়ে দিন
      navigate("/my-orders");

    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // যদি কার্ট খালি থাকে
  if (cart.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-32 mb-24 font-sans text-center">
        <span className="text-6xl mb-4 block">🛍️</span>
        <h2 className="text-xl ubuntu-bold text-gray-900 uppercase tracking-widest mb-4">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-8">Add some awesome products to proceed to checkout.</p>
        <Link 
          to="/" 
          className="inline-block bg-black text-white px-10 py-4 text-xs ubuntu-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-32 mb-24 ubuntu-bold selection:bg-red-600 selection:text-white">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl ubuntu-bold text-black uppercase tracking-[0.15em]">
          Checkout
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
      </div>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        
        {/* ================= LEFT: BILLING & SHIPPING INFO ================= */}
        <div className="flex-1 space-y-8">
          
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm ubuntu-bold text-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px]">1</span>
              Shipping Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-[11px] ubuntu-bold text-gray-900 uppercase tracking-widest mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] ubuntu-bold text-gray-900 uppercase tracking-widest mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 01XXXXXXXXX"
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50"
                  required
                />
              </div>

              {/* City Selection (Controls Shipping Cost) */}
              <div>
                <label className="block text-[11px] ubuntu-bold text-gray-900 uppercase tracking-widest mb-2">
                  City <span className="text-red-600">*</span>
                </label>
                <select 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50 cursor-pointer"
                >
                  <option value="Dhaka">Inside Dhaka (৳60)</option>
                  <option value="Outside Dhaka">Outside Dhaka (৳120)</option>
                </select>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-[11px] ubuntu-bold text-gray-900 uppercase tracking-widest mb-2">
                  Full Address <span className="text-red-600">*</span>
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House number, street name, area, etc."
                  rows="3"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50 resize-none"
                  required
                ></textarea>
              </div>

              {/* Order Notes (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-[11px] ubuntu-bold text-gray-900 uppercase tracking-widest mb-2">
                  Order Notes (Optional)
                </label>
                <input 
                  type="text" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery?"
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50"
                />
              </div>

            </div>
          </div>

          {/* ================= PAYMENT METHOD (ONLY COD) ================= */}
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm ubuntu-bold text-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px]">2</span>
              Payment Method
            </h3>
            
            <label className="relative flex items-center p-5 border-2 border-black bg-gray-50 cursor-pointer group">
              <input type="radio" name="payment" value="cod" className="peer sr-only" defaultChecked />
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 mr-4 flex items-center justify-center peer-checked:border-red-600">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm ubuntu-bold text-black uppercase tracking-wide">Cash on Delivery</h4>
                <p className="text-[11px] text-gray-500 mt-1">Pay with cash upon delivery.</p>
              </div>
              <div className="text-black">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>
            </label>
          </div>

        </div>

        {/* ================= RIGHT: ORDER SUMMARY ================= */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-black text-white p-8 shadow-xl sticky top-32">
            
            <h3 className="text-lg ubuntu-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">
              Order Summary
            </h3>

            {/* Item List */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="relative w-16 h-20 bg-gray-100 shrink-0">
                    <img 
                      src={item.images?.[0]?.url || item.image || 'https://via.placeholder.com/100'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] ubuntu-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] ubuntu-bold uppercase tracking-wide truncate text-gray-100">{item.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-xs ubuntu-bold text-red-500 mt-1.5">
                      ৳{item.discountPrice || item.regularPrice || item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-3 text-[13px] border-t border-gray-800 pt-6 mb-6">
              <div className="flex justify-between text-gray-300">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="uppercase tracking-wider">Shipping</span>
                <span>৳{shippingCost}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-lg border-t border-gray-800 pt-6 mb-8">
              <span className="ubuntu-bold uppercase tracking-widest">Total</span>
              <span className="ubuntu-bold text-red-500 text-xl">৳{total}</span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full py-4 text-xs ubuntu-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 ${
                isProcessing ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-red-600 text-white hover:bg-white hover:text-black cursor-pointer"
              }`}
            >
              {isProcessing ? "Processing..." : "Place Order"}
              {!isProcessing && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
            
            <p className="text-[10px] text-center text-gray-500 mt-4 tracking-widest uppercase">
              Secure Checkout • No Hidden Fees
            </p>

          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;