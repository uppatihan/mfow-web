import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import provincesData from "../../data/provinces.json";
import { Camera } from "lucide-react";

export default function SearchImagesRegisterPage() {
    const navigate = useNavigate();
    const [plate1, setPlate1] = useState("");
    const [plate2, setPlate2] = useState("");

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
        if (!plate1 || !plate2 || !province) {
            alert("กรุณากรอกข้อมูลให้ครบ");
            return;
        } else {
            if (plate1) params.append("plate1", plate1);
            if (plate2) params.append("plate2", plate2);
            if (province) params.append("province", province);
            // console.log(`plate1: ${plate1} \n plate2: ${plate2} \n province: ${province}`);

            navigate(`/img-regis-result?${params.toString()}`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
            <div className="mx-auto p-4">
                <h2 className="flex gap-3 text-2xl font-bold mb-6">
                    <Camera className="w-8 h-8" />
                    ค้นหารูปภาพการลงทะเบียน
                </h2>


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


                <div className="flex justify-center mt-5 gap-4">
                    <div className="w-full md:w-1/4">
                        <button
                            onClick={handleSearch}
                            className="p-2 border rounded w-full bg-blue-600 hover:bg-blue-300 text-white">
                            🔍 ค้นหา
                        </button>
                    </div>

                    <div className="w-full md:w-1/4">
                        <button
                            type="button"
                            onClick={() => {
                                setPlate1("");
                                setPlate2("");
                                setProvince("");
                            }}
                            className="p-2 border rounded w-full bg-red-500 text-white hover:bg-gray-400 transition">
                            ล้างข้อมูล
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
}
