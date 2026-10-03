import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

// Export 라이브러리들
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
        toast.success("Customer deleted successfully! 🗑️️");
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

  if (loading) return <div className="p-8 text-center inter-bold text-gray-500 uppercase">Loading Customers...</div>;

  return (
    <div className="w-full bg-white border border-gray-200 p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl inter-bold text-gray-800 uppercase tracking-widest">Customers List</h2>
          <p className="text-sm inter-medium text-gray-500 mt-1">Manage all registered users and customers ({customers.length} found).</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white inter-bold text-xs uppercase tracking-widest px-4 py-2 flex items-center gap-2 transition-colors"
          >
            📊 Excel
          </button>
          
          <button 
            onClick={exportToPDF}
            className="bg-red-500 hover:bg-red-600 text-white inter-bold text-xs uppercase tracking-widest px-4 py-2 flex items-center gap-2 transition-colors"
          >
            📄 PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200 text-[11px] inter-bold text-gray-400 uppercase tracking-widest">
              <th className="p-4">Customer Info</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center inter-medium text-gray-500">No customers found.</td>
              </tr>
            ) : (
              customers.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="inter-bold text-sm text-gray-800">{user.name}</p>
                    <p className="text-xs inter-medium text-gray-500 mt-1">ID: #{user._id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600 inter-medium">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] inter-bold px-2 py-1 uppercase tracking-widest border ${
                      user.role === 'admin' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm inter-medium text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'admin'}
                      className={`inter-bold text-xs uppercase tracking-wider transition-colors ${
                        user.role === 'admin' 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      Delete
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