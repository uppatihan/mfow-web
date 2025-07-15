export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ด</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">สรุปจำนวนรายการ</h2>
          <p className="text-gray-600">แสดงจำนวนรายการค้นหาทั้งหมด</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">สถานะล่าสุด</h2>
          <p className="text-gray-600">แสดงสถานะการชำระเงินล่าสุดที่ตรวจสอบ</p>
        </div>
      </div>
    </div>
  );
}
