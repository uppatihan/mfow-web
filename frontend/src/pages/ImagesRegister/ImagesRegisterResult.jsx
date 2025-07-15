import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, FILE_SERVICE_URL, API_KEY } from '../../config';
import provinces from "../../data/provinces.json";

import {
  ArrowBigLeft,
  HardDriveDownload,
  ChevronRight
} from "lucide-react";

export default function SearchImagesRegisterResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState([]);
  const [resultImage, setResultImage] = useState([]);

  const [loading, setLoading] = useState(true); // สำหรับโหลดข้อมูลตาราง
  const [isDownloading, setIsDownloading] = useState(false); // *** State นี้ สำหรับการดาวน์โหลด ZIP ***

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(result.length / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

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

  const queryParams = new URLSearchParams(location.search);
  const plate1 = queryParams.get("plate1");
  const plate2 = queryParams.get("plate2");
  const province = queryParams.get("province");

  const fetchData = useCallback(async () => {
    try {
      const query = new URLSearchParams(location.search).toString();
      const res = await fetch(`${API_BASE_URL}/search-img-regis?${query}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      setResult(data.data || []);
      setResultImage(data.image || []);

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

  const [provinceName, setProvinceName] = useState("-");
  useEffect(() => {
    const provinceName = provinces.find((p) => p.code === province)?.name;
    setProvinceName(provinceName);
  }, [province]);


  const handleDownloadZip = async () => {
    try {
      const fileIds = resultImage
        .filter((item) => item.file_id)
        .map((item) => item.file_id);

      const fileType = resultImage
        .filter((item) => item.file_type)
        .map((item) => item.file_type);

      if (fileIds.length === 0) {
        alert("ไม่มี Regis File ID สำหรับดาวน์โหลด");
        return;
      }

      // *** เริ่มต้นการดาวน์โหลด: ตั้งค่า isDownloading เป็น true ***
      setIsDownloading(true);

      const res = await fetch(`${API_BASE_URL}/download-multiple-zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_ids: fileIds,
          file_types: fileType,
        })
        // body: JSON.stringify(fileIds), // ส่ง array ของ string ไปโดยตรง
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Download failed: ${res.status} - ${errorText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Images Register.zip"; // กำหนดชื่อไฟล์ ZIP ที่ดาวน์โหลด
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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">ผลการค้นหา ทะเบียนรถ {plate1} {plate2} {provinceName}</h2>


      {loading ? (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-center text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => navigate("/img-regis")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <ArrowBigLeft className="w-6 h-6" />
              ย้อนกลับ
            </button>

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
              <p className="mb-1 text-sm text-gray-600">
                พบข้อมูลรถ {result.length.toLocaleString()} รายการ
              </p>

              <table className="min-w-full border border-gray-300 rounded shadow-sm text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-3 py-2 border">ID.</th>
                    <th className="px-3 py-2 border">วันที่เพิ่มรถ</th>
                    <th className="px-3 py-2 border">วันที่อัพเดท</th>
                    <th className="px-3 py-2 border">รหัสผู้ใช้งาน</th>
                    <th className="px-3 py-2 border">Status</th>
                    <th className="px-3 py-2 border">Delete_Flag</th>
                    <th className="px-3 py-2 border">Draft_Flag</th>

                  </tr>
                </thead>
                <tbody>
                  {result.slice(offset, offset + itemsPerPage).map((row) => {
                    let create_date = "-";
                    let update_date = "-";
                    if (row.create_date) {
                      // Create a Date object from the transaction_date string
                      const dateObj = new Date(row.create_date);

                      // Extract date components
                      const dd = String(dateObj.getDate()).padStart(2, '0');
                      const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                      const yyyy = dateObj.getFullYear() + 543; // Convert to Buddhist calendar year


                      // Extract time components
                      const hh = String(dateObj.getHours()).padStart(2, '0');
                      const min = String(dateObj.getMinutes()).padStart(2, '0');
                      const ss = String(dateObj.getSeconds()).padStart(2, '0');

                      // Format as DD-MM-YYYY HH:mm:ss
                      create_date = `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
                    }
                    if (row.update_date) {
                      // Create a Date object from the transaction_date string
                      const dateObj = new Date(row.update_date);

                      // Extract date components
                      const dd = String(dateObj.getDate()).padStart(2, '0');
                      const mm = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                      const yyyy = dateObj.getFullYear() + 543; // Convert to Buddhist calendar year


                      // Extract time components
                      const hh = String(dateObj.getHours()).padStart(2, '0');
                      const min = String(dateObj.getMinutes()).padStart(2, '0');
                      const ss = String(dateObj.getSeconds()).padStart(2, '0');

                      // Format as DD-MM-YYYY HH:mm:ss
                      update_date = `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
                    }

                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {/* <td className="px-3 py-1 border text-center">{offset + 1}</td> */}
                        <td className="px-3 py-1 border">{row.id}</td>
                        <td className="px-3 py-1 border">{create_date}</td>
                        <td className="px-3 py-1 border">{update_date}</td>
                        <td className="px-3 py-1 border">{row.customer_id}</td>
                        <td className="px-3 py-1 border">{row.status}</td>
                        <td className="px-3 py-1 border">{row.delete_flag}</td>
                        <td className="px-3 py-1 border">{row.draft_flag}</td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <p className="mb-1 text-sm text-gray-600 mt-5">
                พบข้อมูลรูปภาพ {resultImage.length.toLocaleString()} รายการ
              </p>

              <table className="min-w-full border border-gray-300 rounded shadow-sm text-sm ">
                <thead className="bg-gray-100 text-left  text-center">
                  <tr>
                    <th className="px-3 py-2 border">Name Image</th>
                    <th className="px-3 py-2 border">Type</th>
                    <th className="px-3 py-2 border">File Id</th>
                  </tr>
                </thead>
                <tbody>
                  {resultImage.slice(offset, offset + itemsPerPage).map((row_img, index) => {
                    return (
                      <tr key={index} className="hover:bg-gray-50  text-center">
                        <td className="px-3 py-1 border">{row_img.type}</td>
                        <td className="px-3 py-1 border">{row_img.file_type}</td>
                        {/* <td className="px-3 py-1 border">{row_img.file_id}</td> */}
                        <td className="px-3 py-1 border">
                          {row_img.file_type == "pdf" || row_img.file_type === "gif" ? (
                            <a
                              href={`${FILE_SERVICE_URL}${row_img.file_id}?key=${API_KEY}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              {row_img.file_id}
                            </a>
                          ) : (
                            <img
                              onClick={() => openZoom(`${FILE_SERVICE_URL}${row_img.file_id}?key=${API_KEY}`)}
                              src={`${FILE_SERVICE_URL}${row_img.file_id}?key=${API_KEY}`}
                              alt="รูปรถ"
                              className="w-40 h-auto rounded shadow cursor-zoom-in mx-auto"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

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
      )}
    </div>
  );
}