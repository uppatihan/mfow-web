import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, TrafficCone } from "lucide-react";

export default function SearchTranDetailPage() {
  const [searchType, setSearchType] = useState("TRANSACTION_ID");
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      alert("กรุณากรอกข้อมูล");
      return;
    }
    
    navigate("/tran-detail-result", {
      state: {
        type: searchType,
        data: trimmed,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white shadow-md rounded-md">
      <h2 className="flex gap-3 text-2xl font-bold mb-6">
          <ArrowLeftRight className="w-8 h-8" />
          ค้นหา Transection Detail
      </h2>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">ประเภทที่ต้องการค้นหา</label>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="TRANSACTION_ID">TRANSACTION_ID</option>
          <option value="REF_TRANSACTION_ID">REF_TRANSACTION_ID</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-700">
          รายการที่ต้องการค้นหา (สามารถใส่หลายรายการ, คั่นด้วยคอมมา)
        </label>
        <textarea
          rows={10}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="ตัวอย่าง:1234567890123456,2345678901234567"
          className="w-full p-2 border border-gray-300 rounded resize-y"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔍 ค้นหา
        </button>
      </div>
    </div>
  );
}
