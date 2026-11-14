import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAllCustomers = async () => {
    try {
      // একসাথে Registered Users এবং সব Orders নিয়ে আসা হচ্ছে
      const [usersRes, ordersRes] = await Promise.all([
        api.get("/users"),
        api.get("/orders"),
      ]);

      const usersData = usersRes.data || [];
      const ordersData = ordersRes.data || [];

      // ১. প্রথমে Registered ইউজারদের লিস্ট তৈরি (তাদের সর্বশেষ অর্ডারের ফোন নম্বরসহ)
      const registeredList = usersData.map((user) => {
        const userOrder = ordersData.find(
          (o) => (o.user?._id || o.user) === user._id && o.shippingAddress?.phone
        );
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || userOrder?.shippingAddress?.phone || "N/A",
          role: user.role === "admin" ? "Admin" : "Registered",
          isGuest: false,
          createdAt: user.createdAt,
        };
      });

      // ২. Guest অর্ডারগুলো থেকে ইউনিক কাস্টমার বের করা (ফোন নম্বর দিয়ে ডুপ্লিকেট এড়ানো)
      const guestMap = new Map();

      ordersData.forEach((order) => {
        if (!order.user && order.shippingAddress) {
          const phone = order.shippingAddress.phone?.trim();
          const name = order.shippingAddress.fullName?.trim() || "Guest Customer";
          const uniqueKey = phone || order._id;

          if (!guestMap.has(uniqueKey)) {
            guestMap.set(uniqueKey, {
              _id: order._id,
              name: name,
              email: "N/A (Guest)",
              phone: phone || "N/A",
              role: "Guest",
              isGuest: true,
              createdAt: order.createdAt,
            });
          }
        }
      });

      const guestList = Array.from(guestMap.values());

      // ৩. Registered এবং Guest কাস্টমারদের একসাথে মার্জ করা
      setCustomers([...registeredList, ...guestList]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load customers!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const handleDelete = async (customer) => {
    if (customer.isGuest) {
      return toast.error("Guest customer records come from orders and cannot be deleted here.");
    }

    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/users/${customer._id}`);
        setCustomers(customers.filter((c) => c._id !== customer._id));
        toast.success("Customer deleted successfully! 🗑");
      } catch (error) {
        toast.error("Failed to delete customer!");
      }
    }
  };

  // নাম, ফোন নম্বর বা ইমেইল দিয়ে সার্চ ফিল্টার
  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const nameMatch = (customer.name || "").toLowerCase().includes(query);
    const phoneMatch = (customer.phone || "").toLowerCase().includes(query);
    const emailMatch = (customer.email || "").toLowerCase().includes(query);

    return nameMatch || phoneMatch || emailMatch;
  });

  // ----------------------------------------------------
  // Export as Excel (XLSX)
  // ----------------------------------------------------
  const exportToExcel = () => {
    if (filteredCustomers.length === 0) return toast.error("No data to export!");

    const excelData = filteredCustomers.map((customer, index) => ({
      "SL No": index + 1,
      "Customer ID": customer._id,
      "Name": customer.name,
      "Phone": customer.phone,
      "Email": customer.email,
      "Type": customer.role,
      "Joined / First Order": new Date(customer.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    XLSX.writeFile(workbook, "DressTown_Customers.xlsx");
    toast.success("Excel File Downloaded!");
  };


  // ----------------------------------------------------
  // Export as PDF
  // ----------------------------------------------------
  const exportToPDF = () => {
    if (filteredCustomers.length === 0) return toast.error("No data to export!");

    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("DressTown Customer List (Registered & Guest)", 14, 20);

      const tableColumn = ["SL", "Customer Name", "Phone", "Email", "Type", "Date"];
      const tableRows = [];

      filteredCustomers.forEach((customer, index) => {
        const rowData = [
          index + 1,
          customer.name || "N/A",
          customer.phone || "N/A",
          customer.email || "N/A",
          customer.role || "Customer",
          new Date(customer.createdAt).toLocaleDateString("en-GB"),
        ];
        tableRows.push(rowData);
      });

      // doc.autoTable এর বদলে সরাসরি autoTable(doc, {...}) ব্যবহার করা হলো
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] },
      });

      doc.save("DressTown_Customers.pdf");
      toast.success("PDF File Downloaded!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF!");
    }
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 text-center text-[10px] md:text-xs inter-bold text-gray-400 uppercase tracking-widest animate-pulse">
        Loading Customers...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-white border border-gray-200 p-4 md:p-8 shadow-sm rounded-sm mb-10">
      
      {/* ================= PAGE HEADER, SEARCH & EXPORT BUTTONS ================= */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 pb-4 md:pb-5 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl inter-bold text-gray-800 uppercase tracking-widest">
            Customers List
          </h2>
          <p className="text-[11px] md:text-sm inter-medium text-gray-500 mt-1 md:mt-1.5">
            All registered & guest customers ({filteredCustomers.length} found).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          {/* Search Input (Name, Phone, Email) */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full border border-gray-300 pl-9 pr-8 py-2.5 md:py-3 text-xs inter-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black transition-colors bg-gray-50/50 rounded-sm"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-sm cursor-pointer"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white inter-bold text-[10px] md:text-xs uppercase tracking-widest px-4 py-2.5 md:py-3 rounded-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="text-sm md:text-base">📊</span> Excel
            </button>

            <button
              onClick={exportToPDF}
              className="flex-1 sm:flex-none justify-center bg-red-600 hover:bg-red-700 text-white inter-bold text-[10px] md:text-xs uppercase tracking-widest px-4 py-2.5 md:py-3 rounded-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="text-sm md:text-base">📄</span> PDF
            </button>
          </div>
        </div>
      </div>

      {/* ================= CUSTOMER LIST TABLE ================= */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[9px] md:text-[10px] inter-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 md:p-5 whitespace-nowrap">Customer Info</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Phone Number</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Email Address</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Type</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Date</th>
              <th className="p-4 md:p-5 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 md:p-16 text-center">
                  <span className="text-3xl md:text-4xl block mb-3 opacity-50">👥</span>
                  <p className="text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest">
                    {searchQuery
                      ? `No customers found matching "${searchQuery}".`
                      : "No customers found."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr
                  key={`${customer.isGuest ? "guest" : "user"}-${customer._id}`}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Customer Info */}
                  <td className="p-4 md:p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[11px] md:text-xs inter-bold shrink-0 ${
                          customer.isGuest
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {customer.name ? customer.name.charAt(0).toUpperCase() : "G"}
                      </div>
                      <div className="min-w-0">
                        <p className="inter-bold text-[13px] md:text-sm text-gray-900 truncate">
                          {customer.name}
                        </p>
                        <p className="text-[10px] md:text-[11px] inter-medium text-gray-500 mt-0.5 truncate">
                          ID: #{customer._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Phone Number */}
                  <td className="p-4 md:p-5">
                    <p className="text-xs md:text-sm text-gray-800 inter-bold whitespace-nowrap">
                      {customer.phone}
                    </p>
                  </td>

                  {/* Email */}
                  <td className="p-4 md:p-5">
                    <p className="text-xs md:text-sm text-gray-600 inter-medium truncate">
                      {customer.email}
                    </p>
                  </td>

                  {/* Role / Type */}
                  <td className="p-4 md:p-5">
                    <span
                      className={`inline-block text-[9px] md:text-[10px] inter-bold px-2 py-1 md:px-2.5 md:py-1.5 uppercase tracking-widest rounded-sm border ${
                        customer.role === "Admin"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : customer.isGuest
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {customer.role}
                    </span>
                  </td>

                  {/* Joined / Order Date */}
                  <td className="p-4 md:p-5">
                    <p className="text-[11px] md:text-xs inter-medium text-gray-600 whitespace-nowrap">
                      {new Date(customer.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="p-4 md:p-5 text-right">
                    <button
                      onClick={() => handleDelete(customer)}
                      disabled={customer.role === "Admin" || customer.isGuest}
                      className={`inter-bold text-[10px] md:text-[11px] uppercase tracking-wider transition-colors bg-gray-50 p-2 md:p-2.5 rounded-full shadow-sm ${
                        customer.role === "Admin" || customer.isGuest
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-red-500 hover:text-white hover:bg-red-600 cursor-pointer"
                      }`}
                      title={
                        customer.role === "Admin"
                          ? "Cannot delete admin"
                          : customer.isGuest
                          ? "Guest record (linked to order)"
                          : "Delete Customer"
                      }
                    >
                      <svg
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;