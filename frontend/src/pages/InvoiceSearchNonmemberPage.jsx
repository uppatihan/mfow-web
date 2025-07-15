import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import provincesData from "../data/provinces.json";

export default function InvoiceSearchNonmemberPage() {
  const navigate = useNavigate();
  // const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
  const [plate1, setPlate1] = useState("");
  const [plate2, setPlate2] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // *** เพิ่ม States สำหรับ Dropdown จังหวัด ***
  const [province, setProvince] = useState(""); 
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);

  // *** Function สำหรับดึงข้อมูลจังหวัดจาก Backend ***
    useEffect(() => {
    setProvinceOptions(provincesData);
    setLoadingProvinces(false);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.append("member_type", "NONMEMBER");

    if (plate1) params.append("plate1", plate1);
    if (plate2) params.append("plate2", plate2);
    if (province) params.append("province", province);
    if (invoiceNo) params.append("invoice_no", invoiceNo);
    if (status) params.append("status", status);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    navigate(`/invoice-result?${params.toString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <div className="max-w-3xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">ค้นหาใบแจ้งหนี้ (ไม่ใช่สมาชิก)</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="plate1-input" className="block text-gray-700 text-sm font-semibold mb-1">
              หมวดหมู่
            </label>
            <input
              type="text"
              value={plate1}
              onChange={(e) => setPlate1(e.target.value)}
              placeholder="ตัวอย่าง : กข"
              className="p-2 border rounded w-full"
              maxLength={3}
            />
          </div>

          <div>
            <label htmlFor="plate2-input" className="block text-gray-700 text-sm font-semibold mb-1">
              เลขทะเบียน
            </label>
            <input
              type="text"
              value={plate2}
              // onChange={(e) => setPlate2(e.target.value)}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                setPlate2(numericValue);
              }}
              placeholder="ตัวอย่าง : 1234"
              className="p-2 border rounded w-full"
              maxLength={4}
            />
          </div>

          <div>
            <label htmlFor="province-select" className="block text-gray-700 text-sm font-semibold mb-1">
              จังหวัด
            </label>
            <select
              value={province} // ผูกกับ state 'province'
              onChange={(e) => setProvince(e.target.value)} // อัปเดต state เมื่อเลือก
              className="p-2 border rounded w-full"
              disabled={loadingProvinces} // ปิด dropdown ขณะโหลดข้อมูล
            >
              {loadingProvinces ? (
                // แสดงสถานะโหลด
                <option value="">กำลังโหลดจังหวัด...</option>
              ) : (
                // แสดงตัวเลือกจังหวัด
                <>
                  <option value="">-- เลือกจังหวัด --</option> {/* ตัวเลือกเริ่มต้น/placeholder */}
                  {provinceOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-2 mb-4">
          <input
            type="text"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="เลข Invoice"
            className="p-2 border rounded"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">-- เลือกสถานะ --</option>
            <option value="PAYMENT_WAITING">PAYMENT_WAITING</option>
            <option value="PAYMENT_INPROGRESS">PAYMENT_INPROGRESS</option>
            <option value="PAYMENT_SUCCESS">PAYMENT_SUCCESS</option>
            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
          </select>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded w-full"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            🔍 ค้นหา
          </button>
        </div>
      </div>
    </div>
    
  );
}
