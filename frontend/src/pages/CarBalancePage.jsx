// pages/CarBalancePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Car } from "lucide-react";

export default function CarBalancePage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const navigate = useNavigate();

  const companies = [
    { customer_id: "C20220526214376602", name: "บริษัท เวิลด์คลาสเรนท์อะคาร์ จำกัด" },
    { customer_id: "C20220324213075353", name: "บริษัท ไทย วี.พี.คอร์ปอเรชั่น จำกัด" },
    { customer_id: "C20220525214372290", name: "บริษัท เวิลด์เบสท์ คอร์ปอเรชั่น จำกัด" },
  ];

  const handleSearch = () => {
    if (!selectedCustomerId) {
      alert("กรุณาเลือกบริษัท");
      return;
    }

    navigate(`/car-balance/result?customer_id=${selectedCustomerId}`);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="flex gap-3 text-2xl font-bold mb-6">
          <Car className="w-8 h-8"/>
          Car Balance
      </h2>

      <label className="block text-sm font-semibold text-gray-700 mb-2">
        เลือกบริษัท
      </label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={selectedCustomerId}
        onChange={(e) => setSelectedCustomerId(e.target.value)}
      >
        <option value="">-- เลือกบริษัท --</option>
        {companies.map((company) => (
          <option key={company.customer_id} value={company.customer_id}>
            {`${company.customer_id} | ${company.name}`}
          </option>
        ))}
      </select>

      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
        >
        <Search className="w-5 h-5" />
        ค้นหา
      </button>
    </div>
  );
}
