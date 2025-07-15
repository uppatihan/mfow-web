// ResultTable.jsx
export default function ResultTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="mt-4 p-4 bg-yellow-100 rounded text-center text-yellow-800">
        ไม่พบข้อมูลที่ค้นหา
      </div>
    );
  }

  const formatHeader = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // ฟังก์ชันแปลงวันที่เป็น DD-MM-YYYY HH:mm:ss และปี พ.ศ.
  const formatDateTimeToThaiBuddhist = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const yearBE = date.getFullYear() + 543;
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}-${month}-${yearBE} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateStr;
    }
  };

  // กำหนดชื่อคอลัมน์ที่เป็นวันที่เพื่อแปลงรูปแบบ
  const dateFields = ["transaction_date", "create_date", "payment_date"];

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-max min-w-full border border-gray-300 divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border border-gray-300 whitespace-nowrap"
              >
                {formatHeader(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {Object.keys(row).map((key) => (
                <td
                  key={key}
                  className="px-4 py-2 text-sm text-gray-800 border border-gray-300 whitespace-nowrap"
                >
                  {dateFields.includes(key)
                    ? formatDateTimeToThaiBuddhist(row[key])
                    : row[key] !== null && row[key] !== undefined
                    ? row[key].toString()
                    : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
