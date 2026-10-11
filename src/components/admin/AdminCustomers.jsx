import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get("/api/users");
      setCustomers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load customers!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/api/users/${id}`);
        setCustomers(customers.filter((c) => c._id !== id));
        toast.success("Customer deleted successfully! 🗑");
      } catch (error) {
        toast.error("Failed to delete customer!");
      }
    }
  };

  // ----------------------------------------------------
  // Export as Word (Excel / XLSX) 
  // ----------------------------------------------------
  const exportToExcel = () => {
    if (customers.length === 0) return toast.error("No data to export!");

    const excelData = customers.map((user, index) => ({
      "SL No": index + 1,
      "Customer ID": user._id,
      "Name": user.name,
      "Email": user.email,
      "Role": user.role === 'admin' ? "Admin" : "Customer",
      "Joined Date": new Date(user.createdAt).toLocaleDateString(),
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
    if (customers.length === 0) return toast.error("No data to export!");

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("DressTown Customer List", 14, 20);
    
    const tableColumn = ["SL No", "Customer Name", "Email", "Role", "Joined Date"];
    const tableRows = [];

    customers.forEach((user, index) => {
      const rowData = [
        index + 1,
        user.name,
        user.email,
        user.role === 'admin' ? "Admin" : "Customer",
        new Date(user.createdAt).toLocaleDateString()
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [239, 68, 68] }
    });

    doc.save("DressTown_Customers.pdf");
    toast.success("PDF File Downloaded!");
  };

  if (loading) return <div className="p-8 md:p-12 text-center text-[10px] md:text-xs inter-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Customers...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto bg-white border border-gray-200 p-4 md:p-8 shadow-sm rounded-sm mb-10">
      
      {/* ================= PAGE HEADER & EXPORT BUTTONS ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 pb-4 md:pb-5 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl inter-bold text-gray-800 uppercase tracking-widest">Customers List</h2>
          <p className="text-[11px] md:text-sm inter-medium text-gray-500 mt-1 md:mt-1.5">Manage all registered users and customers ({customers.length} found).</p>
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
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

      {/* ================= CUSTOMER LIST TABLE ================= */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[9px] md:text-[10px] inter-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 md:p-5 whitespace-nowrap">Customer Info</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Email Address</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Role</th>
              <th className="p-4 md:p-5 whitespace-nowrap">Joined Date</th>
              <th className="p-4 md:p-5 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm">
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 md:p-16 text-center">
                  <span className="text-3xl md:text-4xl block mb-3 opacity-50">👥</span>
                  <p className="text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest">No customers found.</p>
                </td>
              </tr>
            ) : (
              customers.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  {/* Customer Info */}
                  <td className="p-4 md:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-[11px] md:text-xs inter-bold text-gray-600 shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div className="min-w-0">
                        <p className="inter-bold text-[13px] md:text-sm text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] md:text-[11px] inter-medium text-gray-500 mt-0.5 truncate">ID: #{user._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Email */}
                  <td className="p-4 md:p-5">
                    <p className="text-xs md:text-sm text-gray-600 inter-medium truncate">{user.email}</p>
                  </td>
                  
                  {/* Role */}
                  <td className="p-4 md:p-5">
                    <span className={`inline-block text-[9px] md:text-[10px] inter-bold px-2 py-1 md:px-2.5 md:py-1.5 uppercase tracking-widest rounded-sm border ${
                      user.role === 'admin' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  
                  {/* Joined Date */}
                  <td className="p-4 md:p-5">
                    <p className="text-[11px] md:text-xs inter-medium text-gray-600 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </td>
                  
                  {/* Actions */}
                  <td className="p-4 md:p-5 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'admin'}
                      className={`inter-bold text-[10px] md:text-[11px] uppercase tracking-wider transition-colors bg-gray-50 p-2 md:p-2.5 rounded-full shadow-sm ${
                        user.role === 'admin' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-red-500 hover:text-white hover:bg-red-600 cursor-pointer'
                      }`}
                      title={user.role === 'admin' ? "Cannot delete admin" : "Delete Customer"}
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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