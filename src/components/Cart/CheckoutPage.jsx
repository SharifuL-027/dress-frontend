import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import api from "../../api/axios";

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  // ================= DYNAMIC DELIVERY OPTIONS =================
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(true);

  // ব্যাকএন্ড থেকে ডেলিভারি চার্জ ফেচ করা (অ্যাডমিন যা সেট করবে তাই আসবে)
  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        // TODO: Replace this with your actual API endpoint later
        // const { data } = await api.get('/api/settings/delivery');
        
        // যেহেতু আপাতত API নেই, আমি ডামি ডেটা দিয়ে দিচ্ছি। অ্যাডমিন প্যানেল হলে এটা ডাটাবেস থেকে আসবে।
        const dummyData = [
          { _id: '1', area: 'Inside Dhaka', cost: 60 },
          { _id: '2', area: 'Outside Dhaka', cost: 120 },
          { _id: '3', area: 'Free Delivery (Campaign)', cost: 0 } // ফ্রি ডেলিভারি অপশন
        ];
        
        setDeliveryOptions(dummyData);
        setSelectedDelivery(dummyData[0]); // প্রথমটি ডিফল্ট সিলেক্ট থাকবে
      } catch (error) {
        console.error("Error fetching delivery settings", error);
      } finally {
        setIsLoadingDelivery(false);
      }
    };
    fetchDeliverySettings();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);
  
  // ================= PROMO CODE STATES =================
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState({ type: "", message: "" });
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // হিসাব-নিকাশ
  const subtotal = cart.reduce((acc, item) => acc + ((item.discountPrice || item.regularPrice || item.price) * item.qty), 0);
  const shippingCost = selectedDelivery ? selectedDelivery.cost : 0;
  const total = Math.max(0, subtotal + shippingCost - discount); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliveryChange = (e) => {
    const option = deliveryOptions.find(opt => opt._id === e.target.value);
    setSelectedDelivery(option);
  };

  // ================= PROMO CODE LOGIC =================
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      setPromoStatus({ type: "error", message: "Please enter a code." });
      return;
    }

    setIsApplyingPromo(true);
    setPromoStatus({ type: "", message: "" });

    setTimeout(() => {
      const code = promoCode.trim().toUpperCase();
      
      if (code === "DRESSTOWN50") {
        setDiscount(500); 
        setPromoStatus({ type: "success", message: "৳500 discount applied successfully!" });
      } else if (code === "SAVE20") {
        const percentDiscount = Math.round(subtotal * 0.20);
        setDiscount(percentDiscount);
        setPromoStatus({ type: "success", message: `20% discount applied! (৳${percentDiscount} OFF)` });
      } else {
        setDiscount(0);
        setPromoStatus({ type: "error", message: "Invalid or expired promo code." });
      }
      setIsApplyingPromo(false);
    }, 800);
  };

  // ================= REAL API CALL FOR PLACING ORDER =================
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        orderItems: cart.map(item => ({
          product: item.product || item._id,
          name: item.name,
          image: item.images?.[0]?.url || item.image || 'https://placehold.co/100x100/eeeeee/333333?text=No+Image',
          price: item.discountPrice || item.regularPrice || item.price,
          qty: item.qty,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          fullName: formData.name,
          phone: formData.phone,
          city: selectedDelivery?.area || "N/A", // ডায়নামিক ডেলিভারি এরিয়া
          address: formData.address,
          notes: formData.notes
        },
        paymentMethod: "Cash on Delivery",
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        discountApplied: discount,
        totalPrice: total
      };

      const { data } = await api.post('/api/orders', orderData);

      toast.success("🎉 Order placed successfully!");
      
      if (clearCart) {
        clearCart();
      }
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
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-32 mb-24 text-center">
        <span className="text-6xl mb-4 block">🛍️</span>
        <h2 className="text-xl inter-bold text-gray-900 uppercase tracking-widest mb-4">Your cart is empty</h2>
        <p className="text-sm inter-medium text-gray-500 mb-8">Add some awesome products to proceed to checkout.</p>
        <Link 
          to="/shop" 
          className="inline-block bg-black text-white px-10 py-4 text-xs inter-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 mt-32 mb-24 selection:bg-red-600 selection:text-white">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl inter-bold text-black uppercase tracking-[0.15em]">
          Checkout
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
      </div>

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        
        {/* ================= LEFT: BILLING & SHIPPING INFO ================= */}
        <div className="flex-1 space-y-8">
          
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm inter-bold text-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px]">1</span>
              Shipping Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-[11px] inter-bold text-gray-900 uppercase tracking-widest mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm inter-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] inter-bold text-gray-900 uppercase tracking-widest mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 01XXXXXXXXX"
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm inter-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50"
                  required
                />
              </div>

              {/* DYNAMIC DELIVERY CHARGE */}
              <div>
                <label className="block text-[11px] inter-bold text-gray-900 uppercase tracking-widest mb-2">
                  Delivery Charge <span className="text-red-600">*</span>
                </label>
                <select 
                  name="delivery"
                  value={selectedDelivery?._id || ""}
                  onChange={handleDeliveryChange}
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm inter-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50 cursor-pointer"
                >
                  {isLoadingDelivery ? (
                    <option value="">Loading options...</option>
                  ) : (
                    deliveryOptions.map(option => (
                      <option key={option._id} value={option._id}>
                        {option.area} {option.cost === 0 ? '(Free Delivery)' : `(৳${option.cost})`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-[11px] inter-bold text-gray-900 uppercase tracking-widest mb-2">
                  Full Address <span className="text-red-600">*</span>
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House number, street name, area, etc."
                  rows="3"
                  className="w-full border border-gray-300 px-4 py-3 text-sm inter-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50 resize-none"
                  required
                ></textarea>
              </div>

              {/* Order Notes (Optional) */}
              <div className="md:col-span-2">
                <label className="block text-[11px] inter-bold text-gray-900 uppercase tracking-widest mb-2">
                  Order Notes (Optional)
                </label>
                <input 
                  type="text" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery?"
                  className="w-full border border-gray-300 px-4 py-3.5 text-sm inter-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-gray-50/50"
                />
              </div>

            </div>
          </div>

          {/* ================= PAYMENT METHOD ================= */}
          <div className="bg-white p-8 border border-gray-200 shadow-sm">
            <h3 className="text-sm inter-bold text-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-[10px]">2</span>
              Payment Method
            </h3>
            
            <label className="relative flex items-center p-5 border-2 border-black bg-gray-50 cursor-pointer group">
              <input type="radio" name="payment" value="cod" className="peer sr-only" defaultChecked />
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 mr-4 flex items-center justify-center peer-checked:border-red-600">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm inter-bold text-black uppercase tracking-wide">Cash on Delivery</h4>
                <p className="text-[11px] inter-medium text-gray-500 mt-1">Pay with cash upon delivery.</p>
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
            
            <h3 className="text-lg inter-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-4">
              Order Summary
            </h3>

            {/* 
                Item List 
                FIX: Image overflow/cut-off issue fixed by adding pt-3 and adjusting margins. 
            */}
            <div className="space-y-5 mb-6 max-h-[300px] overflow-y-auto pr-3 pt-3 pb-2 custom-scrollbar">
              {cart.map((item, index) => (
                <div key={index} className="flex gap-4 items-center">
                  
                  {/* mt-2 এবং overflow issue ফিক্স করা হয়েছে */}
                  <div className="relative w-16 h-20 bg-gray-100 shrink-0 mt-2">
                    <img 
                      src={item.images?.[0]?.url || item.image || 'https://placehold.co/100x100/eeeeee/333333?text=No+Image'} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute -top-2.5 -right-2 bg-red-600 text-white text-[10px] inter-bold w-[22px] h-[22px] flex items-center justify-center rounded-full shadow-md z-10 border border-black">
                      {item.qty}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] inter-bold uppercase tracking-wide truncate text-gray-100">{item.name}</h4>
                    <p className="text-[10px] inter-medium text-gray-400 mt-1 uppercase">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-xs inter-bold text-red-500 mt-1.5">
                      ৳{item.discountPrice || item.regularPrice || item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= PROMO CODE SECTION ================= */}
            <div className="border-t border-gray-800 pt-6 mb-6">
              <label className="block text-[10px] inter-semibold text-gray-400 uppercase tracking-widest mb-3">
                Have a promo code?
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter Code"
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-2.5 text-sm inter-medium text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors uppercase"
                />
                <button 
                  type="button" 
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo}
                  className="bg-white text-black px-4 py-2.5 text-[11px] inter-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors whitespace-nowrap disabled:opacity-50 cursor-pointer"
                >
                  {isApplyingPromo ? "Applying..." : "Apply"}
                </button>
              </div>
              
              {promoStatus.message && (
                <p className={`text-[11px] inter-medium mt-2 ${promoStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {promoStatus.message}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-3 text-[13px] inter-medium border-t border-gray-800 pt-6 mb-6">
              <div className="flex justify-between text-gray-300">
                <span className="uppercase tracking-wider">Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              
              {/* Dynamic Shipping Cost Display */}
              <div className="flex justify-between text-gray-300">
                <span className="uppercase tracking-wider">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `৳${shippingCost}`}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span className="uppercase tracking-wider">Discount</span>
                  <span>- ৳{discount}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-lg border-t border-gray-800 pt-6 mb-8">
              <span className="inter-bold uppercase tracking-widest">Total</span>
              <span className="inter-bold text-red-500 text-xl">৳{total}</span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full py-4 text-xs inter-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 ${
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
            
            <p className="text-[10px] text-center inter-medium text-gray-500 mt-4 tracking-widest uppercase">
              Secure Checkout • No Hidden Fees
            </p>

          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;