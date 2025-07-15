import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, FILE_SERVICE_URL, API_KEY } from '../config';
import {
  ArrowBigLeft,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export default function TranillegalResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); // สำหรับโหลดข้อมูลตาราง

  // ฟังกชั่น zoom img
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const openZoom = (url) => {
    setZoomImageUrl(url);
    setZoomScale(1);
  };
  const closeZoom = () => setZoomImageUrl(null);

  const handleWheelZoom = (e) => {
  e.preventDefault();
  const delta = e.deltaY;
  setZoomScale((prev) => {
    const newScale = delta < 0 ? prev + 0.1 : prev - 0.1;
    return Math.min(Math.max(newScale, 1), 5); // จำกัด scale ระหว่าง 1 - 5
  });
};


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  const queryParams = new URLSearchParams(location.search);
  const memberType = queryParams.get("member_type") || "ILLEGAL";
  const startDate = queryParams.get("start_date");
  const endDate = queryParams.get("end_date");
  const formatDateTH = (dateStr) => {
    if (!dateStr) return "-";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const fetchData = useCallback(async () => {
    try {
      const query = new URLSearchParams(location.search).toString();
      const res = await fetch(`${API_BASE_URL}/search-tran?${query}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-full mx-auto mt-10 p-4">
      <h2 className="flex text-2xl  font-semibold mb-4 ">
        รายการผ่านทาง ({memberType}) 
        {results.length > 0 && ( <> : {results[0].licesne} {results[0].province} </> )}
      </h2>

      {startDate && endDate && (
        <p className="text-md text-gray-600 mb-4">
          วันที่ {formatDateTH(startDate)} ถึง {formatDateTH(endDate)}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
              onClick={() => navigate("/tran-illegal")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <ArrowBigLeft className="w-6 h-6" />
              ย้อนกลับ
          </button>
      </div>

      {loading ? (
        // Loading Spinner สำหรับโหลดข้อมูลตาราง
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-center text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded shadow-sm text-sm">
            <thead className="bg-blue-500 text-left text-white">
              <tr>
                <th className="px-2 py-1 border text-center">No.</th>
                {/* <th className="px-2 py-1 border">Ref_Tran_ID</th> */}
                <th className="px-2 py-1 border">Tran_ID</th>
                <th className="px-2 py-1 border">วันที่ผ่านทาง</th>
                <th className="px-2 py-1 border">เวลาผ่านทาง</th>
                <th className="px-2 py-1 border">ทะเบียน</th>
                <th className="px-2 py-1 border">จังหวัด</th>
                <th className="px-2 py-1 border">ประเภทล้อ</th>
                {/* <th className="px-2 py-1 border">จำนวนเงิน</th> */}
                <th className="px-2 py-1 border">ด่าน</th>
                <th className="px-2 py-1 border">เลน</th>
                {/* <th className="px-2 py-1 border">สถานะ</th> */}
                <th className="px-2 py-1 border">รูปหน้ารถ</th>
                <th className="px-2 py-1 border">รูปป้ายทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(offset, offset + itemsPerPage).map((item, idx) => (
                <tr key={offset + idx}className="odd:bg-white even:bg-blue-50">
                  <td className="border px-2 py-1 text-center">{offset + idx + 1}</td>
                  {/* <td className="border px-2 py-1">{item.ref_transaction_id}</td> */}
                  <td className="border px-2 py-1 ">{item.transaction_id}</td>
                  <td className="border px-2 py-1">{item.trandate}</td>
                  <td className="border px-2 py-1">{item.trantime}</td>
                  <td className="border px-2 py-1">{item.licesne}</td>
                  <td className="border px-2 py-1">{item.province}</td>
                  <td className="border px-2 py-1">{item.wheeltype}</td>
                  {/* <td className="border px-2 py-1 text-center">{item.total_amount?.toLocaleString()}</td> */}
                  <td className="border px-2 py-1">{item.plaza}</td>
                  <td className="border px-2 py-1">{item.lane}</td>
                  {/* <td className="border px-2 py-1">{item.status}</td> */}
                  <td className="border px-2 py-1">
                      {item.body_path_pic ? (
                        <img
                          onClick={() => openZoom(`${FILE_SERVICE_URL}${item.body_path_pic}?key=${API_KEY}`)}
                          src={`${FILE_SERVICE_URL}${item.body_path_pic}?key=${API_KEY}`}
                          alt="รูปรถ"
                          className="w-40 h-auto rounded shadow cursor-zoom-in"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  <td className="border px-2 py-1">
                    {item.plate_path_pic ? (
                      <img
                        onClick={() => openZoom(`${FILE_SERVICE_URL}${item.plate_path_pic}?key=${API_KEY}`)}
                        src={`${FILE_SERVICE_URL}${item.plate_path_pic}?key=${API_KEY}`}
                        alt="รูปป้ายทะเบียน"
                        className="w-40 h-auto rounded shadow cursor-zoom-in"
                      />
                    ) : (
                      "-"
                    )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-sm text-gray-600">
            พบทั้งหมด {results.length.toLocaleString()} รายการ
          </p>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-2 py-1">
                หน้า {currentPage} จาก {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 rounded disabled:opacity-50"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {zoomImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeZoom}
        >
          {/* ป้องกันคลิกที่รูปแล้ว modal ปิด */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative"
            onWheel={handleWheelZoom}
          >
            {/* ปุ่มปิด */}
            <button
              onClick={closeZoom}
              className="fixed top-4 right-4 bg-white text-black rounded-full px-3 py-2 shadow-lg hover:bg-gray-200 z-50"
            >
              ❌
            </button>

            {/* รูปภาพ Zoom ได้ */}
            <img
              src={zoomImageUrl}
              alt="Zoom"
              className="max-w-4xl max-h-[90vh] rounded shadow-lg transition-transform duration-300"
              style={{ transform: `scale(${zoomScale})` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}