import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, FILE_SERVICE_URL, API_KEY } from '../config';
import {
  HardDriveDownload,
  ArrowBigLeft,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export default function ReceiptResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true); // สำหรับโหลดข้อมูลตาราง
  const [isDownloading, setIsDownloading] = useState(false); // *** State นี้ สำหรับการดาวน์โหลด ZIP ***

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(result.length / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  const queryParams = new URLSearchParams(location.search);
  const memberType = queryParams.get("member_type") || "MEMBER";

  const fetchData = useCallback(async () => {
    try {
      const query = new URLSearchParams(location.search).toString();
      const res = await fetch(`${API_BASE_URL}/search-receipt?${query}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.data || []);
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

  const statusColor = (status) => {
    switch (status) {
      case "PAYMENT_SUCCESS":
        return "text-green-600";
      case "PAYMENT_FAILED":
        return "text-red-600";
      case "PAYMENT_INPROGRESS":
        return "text-yellow-600";
      case "PAYMENT_WAITING":
        return "text-gray-700";
      default:
        return "";
    }
  };

  const handleDownloadZip = async () => {
    try {
      const fileIds = result
        .filter((item) => item.receipt_file_id)
        .map((item) => item.receipt_file_id);

      if (fileIds.length === 0) {
        alert("ไม่มี Receipt File ID สำหรับดาวน์โหลด");
        return;
      }

      // *** เริ่มต้นการดาวน์โหลด: ตั้งค่า isDownloading เป็น true ***
      setIsDownloading(true);

      const res = await fetch(`${API_BASE_URL}/download-zip`, {
    //   const res = await fetch("${API_BASE_URL}/download-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileIds), // ส่ง array ของ string ไปโดยตรง
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Download failed: ${res.status} - ${errorText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "receipt-files.zip"; // กำหนดชื่อไฟล์ ZIP ที่ดาวน์โหลด
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // ปล่อย object URL เพื่อหลีกเลี่ยง memory leaks
      alert("ดาวน์โหลดไฟล์ ZIP สำเร็จ!"); // เพิ่มการแจ้งเตือนเมื่อสำเร็จ

    } catch (err) {
      console.error("Download error:", err);
      alert(`เกิดข้อผิดพลาดในการดาวน์โหลด ZIP: ${err.message || err}`); // แสดงข้อความ error ที่ชัดเจนขึ้น
    } finally {
      // *** สิ้นสุดการดาวน์โหลด: ตั้งค่า isDownloading เป็น false เสมอ ***
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto mt-10 p-4">
      <h2 className="text-2xl font-semibold mb-4">ใบเสร็จรับเงิน ({memberType})</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() =>
            navigate(memberType === "MEMBER" ? "/receipt-member" : "/receipt-nonmember")
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <ArrowBigLeft className="w-5 h-5" />
          ย้อนกลับ
        </button>

        {/* *** ปุ่มดาวน์โหลด ZIP *** */}
        <button
          onClick={handleDownloadZip}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isDownloading} // ปิดปุ่มระหว่างดาวน์โหลด
        >
          {isDownloading ? (
            // แสดง Spinner เล็กๆ ในปุ่มขณะดาวน์โหลด
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            // แสดงไอคอนปกติเมื่อไม่ได้ดาวน์โหลด
            <HardDriveDownload className="w-5 h-5" />
          )}
          {isDownloading ? "กำลังดาวน์โหลด..." : "ดาวน์โหลด ZIP ทั้งหมด"}
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
            <thead className="bg-gray-100 text-left">
              <tr>
                {/* <th className="px-3 py-2 border">No.</th> */}
                <th className="px-3 py-2 border">Receipt File ID</th>
                <th className="px-3 py-2 border">Invoice No</th>
                <th className="px-3 py-2 border">วันที่ผ่านทาง</th>
                <th className="px-3 py-2 border">Invoice Ref</th>
                <th className="px-3 py-2 border">สถานะ</th>
                <th className="px-3 py-2 border">Invoice Type</th>
                <th className="px-3 py-2 border">ค่าผ่านทาง</th>
                <th className="px-3 py-2 border">ค่าปรับ</th>
                <th className="px-3 py-2 border">ส่วนลด</th>
                <th className="px-3 py-2 border">รวมเงิน</th>
              </tr>
            </thead>
            <tbody>
              {result.slice(offset, offset + itemsPerPage).map((row) => {
                let formattedDate = "-";
                if (row.transaction_date) {
                  // Create a Date object from the transaction_date string
                  const dateObj = new Date(row.transaction_date);

                  // Extract date components
                  const dd = String(dateObj.getDate()).padStart(2, '0');
                  const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                  const yyyy = dateObj.getFullYear() + 543; // Convert to Buddhist calendar year

                  // Extract time components
                  const hh = String(dateObj.getHours()).padStart(2, '0');
                  const min = String(dateObj.getMinutes()).padStart(2, '0');
                  const ss = String(dateObj.getSeconds()).padStart(2, '0');

                  // Format as DD-MM-YYYY HH:mm:ss
                  formattedDate = `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
                }

                let invoiceTypeLabel = "-";
                if (row.invoice_type === 0 || row.invoice_type === "0") {
                  invoiceTypeLabel = "ไม่มีค่าปรับ";
                } else if (row.invoice_type === 1 || row.invoice_type === "1") {
                  invoiceTypeLabel = "มีค่าปรับ";
                }

                return (
                  <tr key={row.invoice_no} className="hover:bg-gray-50">
                    {/* <td className="px-3 py-1 border text-center">{offset + index + 1}</td> */}
                    <td className="px-3 py-1 border">
                      {row.receipt_file_id ? (
                        <a
                          href={`${FILE_SERVICE_URL}${row.receipt_file_id}?key=${API_KEY}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {row.receipt_file_id}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-1 border">{row.invoice_no}</td>
                    <td className="px-3 py-1 border">{formattedDate}</td>
                    <td className="px-3 py-1 border">{row.invoice_no_ref || "-"}</td>
                    <td className={`px-3 py-1 border font-medium ${statusColor(row.status)}`}>
                      {row.status}
                    </td>
                    <td className="px-3 py-1 border">{invoiceTypeLabel}</td>
                    <td className="px-3 py-1 border text-right">
                      {row.fee_amount?.toLocaleString()}
                    </td>
                    <td className="px-3 py-1 border text-right">
                      {row.collection_amount?.toLocaleString()}
                    </td>
                    <td className="px-3 py-1 border text-right">
                      {row.discount?.toLocaleString()}
                    </td>
                    <td className="px-3 py-1 border text-right">
                      {row.total_amount?.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-4 text-sm text-gray-600">
            พบทั้งหมด {result.length.toLocaleString()} รายการ
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

      {/* *** Loading Overlay สำหรับการดาวน์โหลดแบบเต็มหน้าจอ (แสดงเมื่อ isDownloading เป็น true) *** */}
      {isDownloading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white z-50">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">กำลังเตรียมไฟล์ ZIP...</p>
          <p className="text-sm">โปรดอย่าปิดหน้านี้</p>
        </div>
      )}
    </div>
  );
}