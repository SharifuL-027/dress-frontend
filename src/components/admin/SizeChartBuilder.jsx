import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiGrid } from "react-icons/fi";

// আপনার ডকুমেন্টের সব স্টাইল কোড অনুযায়ী রেডি সাইজ চার্ট প্রিসেট
const STYLE_CODE_PRESETS = {
  // T-shirts & Polos
  "4FSS-2809 (4F T-shirt)": "Size | Chest | Length | Sleeve\nS | 42 | 27 | 23\nM | 44 | 28 | 24\nL | 46 | 29 | 25\nXL | 48 | 30 | 26\n2XL | 50 | 31 | 27",
  "BBP-261026 (Burberry Polo)": "Size | Chest | Length | Sleeve\nS | 38 | 27.5 | 8.5\nM | 40 | 28 | 9\nL | 42 | 28.5 | 10\nXL | 44 | 29 | 10.5\nXXL | 46 | 30 | 11",
  "RLP-261026 (Ralph Lauren Polo)": "Size | Chest | Length | Sleeve\nS | 38 | 26.5 | 8\nM | 40 | 27 | 8.5\nL | 42 | 28 | 9\nXL | 44 | 29 | 9\nXXL | 46 | 30 | 10",
  "LP-281026 (Lacoste Polo)": "Size | Chest | Length | Sleeve\nS | 40 | 26 | 9\nM | 42 | 27 | 9\nL | 44 | 28 | 9\nXL | 46 | 29 | 9.5\nXXL | 48 | 30 | 10",
  "HLP-221026 (Hackett Polo 1)": "Size | Chest | Length | Sleeve\nS | 38 | 27 | 9\nM | 40 | 28 | 9.5\nL | 42 | 29 | 10\nXL | 44 | 30 | 10\nXXL | 46 | 31 | 10.5",
  "HLP-131026 (Hackett Polo 2)": "Size | Chest | Length | Sleeve\nS | 40 | 28 | 9\nM | 42 | 28.5 | 9.5\nL | 44 | 29 | 10\nXL | 46 | 29.5 | 10\n2XL | 48 | 30 | 10.5",
  "MKJP-210926 (Michael Kors Zip Polo)": "Size | Chest | Length | Sleeve\nM | 40 | 27 | 8\nL | 42 | 27.5 | 8.5\nXL | 44 | 28.5 | 9",
  "CP-2807 (CK Polo)": "Size | Chest | Length | Sleeve\nS | 40 | 27 | 8\nM | 42 | 27.5 | 8.5\nL | 44 | 28 | 9\nXL | 46 | 28.5 | 9.5\nXXL | 48 | 29 | 10",
  "ZP-1709 (Zara New Polo)": "Size | Chest | Length | Sleeve\nS | 40 | 25.5 | 9\nM | 42 | 26 | 9.5\nL | 44 | 27 | 9.5\nXL | 46 | 27.5 | 9.5\nXXL | 48 | 28 | 10",

  // Shirts
  "USPAFSS-281026 (U.S Polo Shirt)": "Size | Chest | Length | Sleeve\nS | 42 | 28 | 25\nM | 44 | 29 | 25.5\nL | 46 | 30 | 26\nXL | 48 | 31 | 26.5",
  "RLFSS-081126 (Ralph Lauren F/S Shirt)": "Size | Chest | Length | Sleeve\nS | 40 | 28.5 | 24.5\nM | 42 | 29 | 25\nL | 44 | 29.5 | 25.5\nXL | 46 | 30 | 26\n2XL | 48 | 30.5 | 26.5",
  "HBS-617 (Hugo Boss Glossy Shirt)": "Size | Chest | Length | Sleeve\nS | 40 | 29 | 23\nM | 42 | 29.5 | 23.5\nL | 44 | 30 | 24\nXL | 46 | 30.5 | 24.5\n2XL | 48 | 31 | 25",
  "ZFSS-200926 (Zara F/S Shirt)": "Size | Chest | Length | Sleeve\nS | 40 | 28 | 23.5\nM | 42 | 29 | 24\nL | 44 | 30 | 24.5\nXL | 46 | 30.5 | 25\nXXL | 48 | 31 | 25.5",
  "AETSS-240926 (American Eagle Check Shirt)": "Size | Chest | Length | Sleeve\nS | 40 | 29 | 26\nM | 42 | 29.5 | 26\nL | 44 | 31 | 27\nXL | 45.5 | 31 | 26.5\n2XL | 48 | 31.5 | 28",
  "AEFSS-2707 (American Eagle F/S Shirt)": "Size | Chest | Length | Sleeve\nS | 38 | 27 | 9\nM | 40 | 28 | 9\nL | 42 | 29 | 10\nXL | 44 | 30 | 10",
  "SFSS-2707 (Springfield F/S Shirt)": "Size | Chest | Length | Sleeve\nS | 38 | 27 | 8\nM | 40 | 27.5 | 9\nL | 42 | 28 | 9.5\nXL | 44 | 28.5 | 10",
  "TFSS-2807 (Tommy F/S Shirt)": "Size | Chest | Length | Sleeve\nM | 42 | 29 | 26\nL | 44 | 29.5 | 26.5\nXL | 46 | 30 | 27",

  // Sweatshirts, Hoodies & Sweaters
  "271026 (Adidas Quarter-Zip)": "Size | Chest | Length | Sleeve\nM | 42 | 27 | 26.5\nL | 44 | 28 | 27\nXL | 46 | 29 | 27.5\n2XL | 48 | 30 | 28",
  "ASS-111126 (Adidas Sweatshirt)": "Size | Chest | Length | Sleeve\nS | 40 | 27 | 23\nM | 42 | 27.5 | 23.5\nL | 44 | 28 | 24\nXL | 46 | 29 | 24.5\n2XL | 48 | 30 | 25",
  "AH-051026 / TNFH-051026 (Adidas & TNF Hoodie)": "Size | Chest | Length | Sleeve\nS | 40 | 25 | 22\nM | 42 | 26 | 22.5\nL | 44 | 27 | 23\nXL | 46 | 27.5 | 23.5\nXXL | 48 | 28 | 24",
  "NFJS-191026 (TNF Zipper Sweatshirt)": "Size | Chest | Length | Sleeve\nM | 42 | 27.5 | 26\nL | 44 | 28 | 27\nXL | 46 | 28.5 | 27.5\nXXL | 48 | 29 | 28",
  "BJSS-231026 (Burberry Sweatshirt)": "Size | Chest | Length | Sleeve\nS | 40 | 27 | 23\nM | 42 | 28 | 24\nL | 44 | 28.5 | 24.5\nXL | 46 | 29 | 25\n2XL | 48 | 29.5 | 25.5",
  "RLS-301026 / RLJS-301026 (Ralph Lauren Crewneck/Zip)": "Size | Chest | Length | Sleeve\nM | 40 | 26 | 23\nL | 42 | 26.5 | 23.5\nXL | 44 | 27 | 24\nXXL | 46 | 27.5 | 24.5",
  "RLJS-131026 / USPJS-131026 (Quarter-Zip Sweater)": "Size | Chest | Length | Sleeve\nS | 40 | 24 | 25\nM | 42 | 25 | 25.5\nL | 44 | 26 | 26\nXL | 46 | 27 | 26.5\n2XL | 48 | 28 | 27",
  "NH-280926 (Nike Hoodie)": "Size | Chest | Length | Sleeve\nS | 40 | 26 | 24\nM | 42 | 27 | 24.5\nL | 44 | 27.5 | 25\nXL | 46 | 28 | 25.5\n2XL | 48 | 28.5 | 26",

  // Jackets & Blazer
  "TJ-111026 (Turtle Jacket)": "Size | Chest | Length | Sleeve\nS | 40 | 25 | 24\nM | 42 | 26 | 25\nL | 44 | 26 | 26\nXL | 46 | 27 | 27\nXXL | 48 | 28 | 28",
  "HJ-131126 (Hugo Jacket)": "Size | Chest | Length | Sleeve\nS | 40 | 26 | 24\nM | 42 | 26.5 | 24.5\nL | 44 | 27 | 25\nXL | 46 | 27.5 | 25.5\n2XL | 48 | 28 | 26",
  "BSP-241026 (Boss Sherpa Jacket)": "Size | Chest | Length | Sleeve\nS | 42 | 25 | 24.5\nM | 44 | 26 | 25\nL | 46 | 27 | 25.5\nXL | 48 | 28 | 26\n2XL | 50 | 29 | 26.5",
  "GP-200926 (Guess Puffer Jacket)": "Size | Chest | Length | Sleeve\nS | 40 | 27 | 26\nM | 42 | 28 | 26\nL | 44 | 29 | 27\nXL | 46 | 30 | 28\nXXL | 48 | 31 | 29",
  "TB-311026 (Turtle Blazer)": "Size | Chest | Length | Sleeve\n36 | 40 | 28 | 24\n38 | 42 | 28.5 | 24\n40 | 42 | 29 | 24.5\n42 | 44 | 29.5 | 25\n44 | 46 | 30 | 25.5\n46 | 48 | 30.5 | 26",

  // Pants, Trousers & Jeans
  "JJDP-041026 (Jack & Jones Jeans)": "Size | Waist | Length | Leg Opening\n30 | 30 | 40 | 8\n32 | 32 | 41 | 8\n34 | 34 | 42 | 8\n36 | 36 | 42.5 | 8.5\n38 | 38 | 43 | 9",
  "GSFP-061026 (G-Star Pants)": "Size | Waist | Length | Leg Opening\n30 | 30 | 40 | 7\n32 | 32 | 40.5 | 7.5\n34 | 34 | 41 | 8\n36 | 36 | 41.5 | 8.5\n38 | 38 | 42 | 8.5\n40 | 40 | 42.5 | 9",
  "BRCP-061026 (Boss Remi Cotton Pant)": "Size | Waist | Length | Leg Opening\n30 | 30 | 41 | 8.5\n32 | 32 | 41.5 | 9\n34 | 34 | 42 | 9\n36 | 36 | 42.5 | 9.5\n38 | 38 | 43 | 10",
  "NT-081026 (Nike Trouser)": "Size | Waist | Length | Leg Opening\nS | 30 | 38 | 8\nM | 32 | 39 | 8.5\nL | 34 | 39.5 | 9\nXL | 36 | 40 | 9.5\n2XL | 38 | 41 | 10",
  "WD-635 (Wrangler Denim Pant)": "Size | Waist | Length | Leg Opening\n28 | 28 | 39 | 7\n30 | 30 | 40 | 7.5\n32 | 32 | 40 | 8\n34 | 34 | 42 | 9\n36 | 36 | 43 | 9\n38 | 38 | 44 | 9.5\n40 | 40 | 45 | 10\n42 | 42 | 46 | 10",
  "WCP-031126 (Wrangler Cargo)": "Size | Waist | Length | Leg Opening\n30 | 30 | 38 | 7\n32 | 32 | 39.5 | 7\n34 | 34 | 38.5 | 7.5\n36 | 36 | 39 | 7.5\n38 | 38 | 40 | 8",
  "AT-200926 (Adidas Trouser)": "Size | Waist | Length | Leg Opening\nS | 30 | 38.5 | 8.5\nM | 32 | 39 | 8.5\nL | 34 | 39.5 | 9\nXL | 36 | 40 | 9.5\n2XL | 38 | 40.5 | 9.5\n3XL | 40 | 41 | 10",
  "USPTP-200926 (U.S. Polo Assn. Pants)": "Size | Waist | Length | Leg Opening\nS | 30 | 38 | 7\nM | 32 | 38.5 | 7\nL | 34 | 39 | 7.5\nXL | 36 | 39.5 | 8\n2XL | 38 | 40 | 8",
  "AECP-1709 (American Eagle Cargo)": "Size | Waist | Length | Leg Opening\n30 | 30 | 38 | 7.5\n32 | 32 | 38 | 7.5\n34 | 34 | 39 | 8\n36 | 36 | 40 | 8\n38 | 38 | 40 | 8",
  "ADLDP-2707 (A&D London Jeans)": "Size | Waist | Length | Leg Opening\n32 | 32 | 40 | 8\n34 | 34 | 41 | 9.5\n36 | 36 | 42 | 9.5\n38 | 38 | 43 | 10",
  "RLRCP-2307 (Ralph Lauren Cotton Pant)": "Size | Waist | Length | Leg Opening\n30 | 30 | 40 | 8\n32 | 32 | 40.5 | 8.5\n34 | 34 | 41 | 9\n36 | 36 | 41.5 | 9.5\n38 | 38 | 42 | 10",
};

const QUICK_TEMPLATES = {
  topwear: {
    headers: ["Size", "Chest", "Length", "Sleeve"],
    rows: [
      ["S", "40", "27", "8.5"],
      ["M", "42", "28", "9"],
      ["L", "44", "29", "9.5"],
      ["XL", "46", "30", "10"],
      ["XXL", "48", "31", "10.5"],
    ],
  },
  bottomwear: {
    headers: ["Size", "Waist", "Length", "Leg Opening"],
    rows: [
      ["30", "30", "40", "7.5"],
      ["32", "32", "40.5", "8"],
      ["34", "34", "41", "8.5"],
      ["36", "36", "41.5", "9"],
      ["38", "38", "42", "9.5"],
    ],
  },
};

const SizeChartBuilder = ({ value, onChange }) => {
  const [headers, setHeaders] = useState(["Size", "Chest", "Length", "Sleeve"]);
  const [rows, setRows] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState("");

  // স্ট্রিং থেকে টেবিল স্টেটে পার্স করা
  const parseFromString = (text) => {
    if (!text || !text.trim()) {
      setHeaders(["Size", "Chest", "Length", "Sleeve"]);
      setRows([]);
      return;
    }
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const delimiter = lines.some((l) => l.includes("|")) ? "|" : ",";
    const parsed = lines.map((line) =>
      line
        .replace(/^\||\|$/g, "")
        .split(delimiter)
        .map((c) => c.trim())
    );
    if (parsed.length >= 1) {
      const cols = parsed[0];
      const body = parsed.slice(1).map((r) => {
        const padded = [...r];
        while (padded.length < cols.length) padded.push("");
        return padded.slice(0, cols.length);
      });
      setHeaders(cols);
      setRows(body);
    }
  };

  useEffect(() => {
    parseFromString(value);
  }, []);

  // টেবিল স্টেট থেকে স্ট্রিং বানিয়ে প্যারেন্ট ফর্মে পাঠানো
  const syncToParent = (newHeaders, newRows) => {
    setHeaders(newHeaders);
    setRows(newRows);
    if (newRows.length === 0) {
      onChange("");
      return;
    }
    const headerLine = newHeaders.join(" | ");
    const rowLines = newRows.map((r) => r.join(" | "));
    onChange([headerLine, ...rowLines].join("\n"));
  };

  const applyTemplate = (type) => {
    const tpl = QUICK_TEMPLATES[type];
    syncToParent([...tpl.headers], tpl.rows.map((r) => [...r]));
    setSelectedPreset("");
  };

  const handlePresetChange = (e) => {
    const key = e.target.value;
    setSelectedPreset(key);
    if (key && STYLE_CODE_PRESETS[key]) {
      const str = STYLE_CODE_PRESETS[key];
      parseFromString(str);
      onChange(str);
    }
  };

  const handleHeaderChange = (colIdx, val) => {
    const updated = [...headers];
    updated[colIdx] = val;
    syncToParent(updated, rows);
  };

  const handleCellChange = (rowIdx, colIdx, val) => {
    const updated = rows.map((r, i) =>
      i === rowIdx ? r.map((c, j) => (j === colIdx ? val : c)) : r
    );
    syncToParent(headers, updated);
  };

  const addColumn = () => {
    const newHeaders = [...headers, "New Col"];
    const newRows = rows.map((r) => [...r, ""]);
    syncToParent(newHeaders, newRows);
  };

  const removeColumn = (colIdx) => {
    if (headers.length <= 2) return;
    const newHeaders = headers.filter((_, i) => i !== colIdx);
    const newRows = rows.map((r) => r.filter((_, i) => i !== colIdx));
    syncToParent(newHeaders, newRows);
  };

  const addRow = () => {
    const emptyRow = headers.map(() => "");
    syncToParent(headers, [...rows, emptyRow]);
  };

  const removeRow = (rowIdx) => {
    const newRows = rows.filter((_, i) => i !== rowIdx);
    syncToParent(headers, newRows);
  };

  const clearTable = () => {
    setSelectedPreset("");
    syncToParent(["Size", "Chest", "Length", "Sleeve"], []);
  };

  return (
    <div className="border border-gray-200 bg-gray-50/70 p-4 rounded-sm space-y-4">
      {/* Top Toolbar: Quick Templates + Style Code Preset Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] inter-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mr-1">
            <FiGrid /> Templates:
          </span>
          <button
            type="button"
            onClick={() => applyTemplate("topwear")}
            className="bg-white hover:bg-gray-900 hover:text-white text-gray-800 border border-gray-300 px-3 py-1.5 text-[10px] inter-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            + Topwear (Shirt/Polo/Hoodie)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate("bottomwear")}
            className="bg-white hover:bg-gray-900 hover:text-white text-gray-800 border border-gray-300 px-3 py-1.5 text-[10px] inter-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            + Bottomwear (Pant/Jeans)
          </button>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={clearTable}
              className="text-red-600 hover:underline text-[10px] inter-bold uppercase px-2 py-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Style Code Quick Loader */}
        <div className="w-full lg:w-72">
          <select
            value={selectedPreset}
            onChange={handlePresetChange}
            className="w-full border border-gray-300 bg-white px-3 py-1.5 text-xs inter-medium text-gray-700 rounded-sm focus:border-red-500 focus:outline-none"
          >
            <option value="">-- Load by Style Code Preset --</option>
            {Object.keys(STYLE_CODE_PRESETS).map((styleKey) => (
              <option key={styleKey} value={styleKey}>
                {styleKey}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editable Grid Table */}
      {rows.length === 0 ? (
        <div className="text-center py-6 bg-white border border-dashed border-gray-300 rounded-sm">
          <p className="text-xs inter-medium text-gray-500 mb-3">
            No size chart added for this product yet.
          </p>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-red-600 text-white text-[11px] inter-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors cursor-pointer"
          >
            <FiPlus size={14} /> Create Size Table
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-sm">
            <table className="w-full text-left border-collapse min-w-[450px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  {headers.map((header, colIdx) => (
                    <th key={colIdx} className="p-2 border-r border-gray-200">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          className="w-full bg-white border border-gray-300 px-2 py-1 text-[11px] inter-bold uppercase text-gray-800 focus:border-red-500 focus:outline-none"
                        />
                        {headers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeColumn(colIdx)}
                            title="Remove Column"
                            className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-2 w-24 text-center">
                    <button
                      type="button"
                      onClick={addColumn}
                      className="text-[10px] inter-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-wider cursor-pointer"
                    >
                      + Col
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-100 last:border-b-0">
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="p-2 border-r border-gray-100">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          placeholder={colIdx === 0 ? "e.g. M" : "e.g. 42"}
                          className={`w-full border border-gray-200 px-2.5 py-1.5 text-xs focus:border-red-500 focus:outline-none ${
                            colIdx === 0 ? "inter-bold text-gray-900 bg-gray-50" : "inter-medium text-gray-700"
                          }`}
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(rowIdx)}
                        className="text-gray-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                        title="Delete Row"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-[10px] inter-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors cursor-pointer"
            >
              <FiPlus size={13} /> Add Size Row
            </button>
            <span className="text-[10px] inter-medium text-gray-400">
              All measurements are saved in Inches (automatically convertible to CM on product page).
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeChartBuilder;