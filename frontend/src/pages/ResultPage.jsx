import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ResultTable from "../components/ResultTable";
import { API_BASE_URL } from '../config';
import { ArrowBigLeft } from "lucide-react";

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ref = searchParams.get("ref");
  const date = searchParams.get("date");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/check?ref_id=${ref}&date=${date}`);
        const data = await res.json();
        setResult(data.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("โหลดข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    if (ref && date) fetchResult();
  }, [ref, date]);

  return (
  <div className="max-w-full mx-auto mt-10 p-4">
    <h2 className="text-3xl font-semibold mb-4">ผลการตรวจสอบ</h2>

    {loading ? (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-center text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    ) : (
      <>

        <div className="mb-4">
          <button
              onClick={() => navigate("/ref-checker")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <ArrowBigLeft className="w-6 h-6" />
              ย้อนกลับ
          </button>
        </div>

        <ResultTable data={result} />
        
      </>
    )}
  </div>
);
}
