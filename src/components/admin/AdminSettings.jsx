import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("delivery"); 
  const [isLoading, setIsLoading] = useState(false);

  // ================= DELIVERY STATES =================
  const [deliveryList, setDeliveryList] = useState([]);
  const [deliveryForm, setDeliveryForm] = useState({ area: "", cost: "" });

  // ================= PROMO STATES =================
  const [promoList, setPromoList] = useState([]);
  const [promoForm, setPromoForm] = useState({
    code: "", discountType: "fixed", discountValue: "", expiryDate: "", usageLimit: 100
  });

  // রিয়েল ডাটাবেস থেকে ডেটা ফেচ করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [delRes, promoRes] = await Promise.all([
          api.get('/api/delivery'),
          api.get('/api/promo')
        ]);
        setDeliveryList(delRes.data);
        setPromoList(promoRes.data);
      } catch (error) {
        console.error("Error fetching data", error);
        toast.error("Failed to load settings data");
      }
    };
    fetchData();
  }, []);

  // ================= DELIVERY LOGIC (REAL API) =================
  const handleAddDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryForm.area || deliveryForm.cost === "") return toast.error("Please fill all fields!");
    
    try {
      const { data } = await api.post('/api/delivery', { 
        area: deliveryForm.area, 
        cost: Number(deliveryForm.cost) 
      });
      setDeliveryList([...deliveryList, data]);
      setDeliveryForm({ area: "", cost: "" });
      toast.success("Delivery area added successfully!");
    } catch (error) {
      toast.error("Failed to add delivery option!");
    }
  };

  const handleDeleteDelivery = async (id) => {
    try {
      await api.delete(`/api/delivery/${id}`);
      setDeliveryList(deliveryList.filter(item => item._id !== id));
      toast.success("Delivery area deleted!");
    } catch (error) {
      toast.error("Failed to delete delivery option!");
    }
  };

  // ================= PROMO LOGIC (REAL API) =================
  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code || !promoForm.discountValue || !promoForm.expiryDate) {
      return toast.error("Please fill all required fields!");
    }

    try {
      const { data } = await api.post('/api/promo', {
        ...promoForm,
        code: promoForm.code.toUpperCase(),
        discountValue: Number(promoForm.discountValue),
        usageLimit: Number(promoForm.usageLimit),
      });
      setPromoList([...promoList, data]);
      setPromoForm({ code: "", discountType: "fixed", discountValue: "", expiryDate: "", usageLimit: 100 });
      toast.success("Promo code created successfully!");
    } catch (error) {
      toast.error("Failed to create promo code! Make sure code is unique.");
    }
  };

  const handleDeletePromo = async (id) => {
    try {
      await api.delete(`/api/promo/${id}`);
      setPromoList(promoList.filter(item => item._id !== id));
      toast.success("Promo code deleted!");
    } catch (error) {
      toast.error("Failed to delete promo code!");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="mb-8 pb-5 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl inter-bold text-gray-900 tracking-wide uppercase">
          Settings & Management
        </h1>
        <p className="text-sm text-gray-500 mt-1 inter-medium">
          Manage your delivery charges and promotional codes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={() => setActiveTab("delivery")}
          className={`px-6 py-3 text-xs inter-bold uppercase tracking-widest transition-colors shadow-sm ${
            activeTab === "delivery" ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Delivery Settings
        </button>
        <button 
          onClick={() => setActiveTab("promo")}
          className={`px-6 py-3 text-xs inter-bold uppercase tracking-widest transition-colors shadow-sm ${
            activeTab === "promo" ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Promo Codes
        </button>
      </div>

      {/* ================= DELIVERY SETTINGS TAB ================= */}
      {activeTab === "delivery" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add New Delivery Area */}
          <div className="lg:col-span-1 bg-white p-6 border border-gray-200 shadow-sm h-fit">
            <h2 className="text-sm inter-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
              Add Delivery Option
            </h2>
            <form onSubmit={handleAddDelivery} className="space-y-5">
              <div>
                <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Area Name</label>
                <input 
                  type="text" 
                  value={deliveryForm.area}
                  onChange={(e) => setDeliveryForm({...deliveryForm, area: e.target.value})}
                  placeholder="e.g. Inside Dhaka"
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Charge Amount (৳)</label>
                <input 
                  type="number" 
                  value={deliveryForm.cost}
                  onChange={(e) => setDeliveryForm({...deliveryForm, cost: e.target.value})}
                  placeholder="e.g. 60"
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium focus:outline-none focus:border-black"
                />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white px-4 py-3 text-xs inter-bold uppercase tracking-widest hover:bg-black transition-colors">
                Save Delivery Option
              </button>
            </form>
          </div>

          {/* Delivery List Table */}
          <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm inter-bold text-gray-900 uppercase tracking-widest">Active Delivery Areas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="p-5 inter-bold">Area Name</th>
                    <th className="p-5 inter-bold">Charge Amount</th>
                    <th className="p-5 inter-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {deliveryList.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-5 inter-semibold text-gray-900">{item.area}</td>
                      <td className="p-5 inter-bold text-red-600">৳{item.cost}</td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleDeleteDelivery(item._id)} className="text-[11px] inter-bold text-red-500 hover:text-red-700 uppercase tracking-widest cursor-pointer">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deliveryList.length === 0 && (
                    <tr><td colSpan="3" className="p-8 text-center text-gray-500 inter-medium">No delivery options found. Add some from the left panel.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROMO CODES TAB ================= */}
      {activeTab === "promo" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add New Promo Code */}
          <div className="lg:col-span-1 bg-white p-6 border border-gray-200 shadow-sm h-fit">
            <h2 className="text-sm inter-bold text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
              Create Promo Code
            </h2>
            <form onSubmit={handleAddPromo} className="space-y-5">
              <div>
                <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Code Name</label>
                <input 
                  type="text" 
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({...promoForm, code: e.target.value})}
                  placeholder="e.g. SAVE20"
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium uppercase focus:outline-none focus:border-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Type</label>
                  <select 
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({...promoForm, discountType: e.target.value})}
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="fixed">Fixed (৳)</option>
                    <option value="percentage">Percent (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Amount</label>
                  <input 
                    type="number" 
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({...promoForm, discountValue: e.target.value})}
                    placeholder="20"
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Expiry Date</label>
                <input 
                  type="date" 
                  value={promoForm.expiryDate}
                  onChange={(e) => setPromoForm({...promoForm, expiryDate: e.target.value})}
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium focus:outline-none focus:border-black cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] inter-bold text-gray-700 uppercase tracking-widest mb-2">Usage Limit</label>
                <input 
                  type="number" 
                  value={promoForm.usageLimit}
                  onChange={(e) => setPromoForm({...promoForm, usageLimit: e.target.value})}
                  className="w-full border border-gray-300 px-4 py-2.5 text-sm inter-medium focus:outline-none focus:border-black"
                />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white px-4 py-3 text-xs inter-bold uppercase tracking-widest hover:bg-black transition-colors">
                Create Code
              </button>
            </form>
          </div>

          {/* Promo List Table */}
          <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm inter-bold text-gray-900 uppercase tracking-widest">Active Promo Codes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500">
                    <th className="p-5 inter-bold">Code</th>
                    <th className="p-5 inter-bold">Discount</th>
                    <th className="p-5 inter-bold">Used / Limit</th>
                    <th className="p-5 inter-bold">Expiry</th>
                    <th className="p-5 inter-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {promoList.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-5 inter-bold text-gray-900">{item.code}</td>
                      <td className="p-5 inter-semibold text-emerald-600">
                        {item.discountType === 'fixed' ? `৳${item.discountValue} OFF` : `${item.discountValue}% OFF`}
                      </td>
                      <td className="p-5 inter-medium text-gray-600">
                        {item.usedCount} / {item.usageLimit}
                      </td>
                      <td className="p-5 inter-medium text-gray-600">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleDeletePromo(item._id)} className="text-[11px] inter-bold text-red-500 hover:text-red-700 uppercase tracking-widest cursor-pointer">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {promoList.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 inter-medium">No promo codes found. Add some from the left panel.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSettings;