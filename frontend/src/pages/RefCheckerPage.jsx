import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Banknote } from "lucide-react";

// ฟังก์ชันแปลงวันที่วันนี้เป็น YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function RefCheckerPage() {
  const [ref, setRef] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const navigate = useNavigate();

  const handleCheck = () => {
    if (!ref || !date) {
      alert("กรุณากรอกเลข Ref และวันที่");
      return;
    }

    navigate(`/result?ref=${encodeURIComponent(ref)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl mx-auto mt-10">
      <h2 className="flex gap-3 text-2xl font-bold mb-6">
          <Banknote className="w-8 h-8"/>
          ตรวจสอบการชำระเงิน
      </h2>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Ref Group ID
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="ขึ้นต้นด้วย 05 หรือ 04"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          วันที่ในสลิป
        </label>
        <input
          type="date"
          className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button
        onClick={handleCheck}
        className="flex items-center justify-center gap-2 mt-4 w-full font-semibold px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        <Search className="w-5 h-5" />
        ตรวจสอบ
      </button>
    </div>
  );
}
