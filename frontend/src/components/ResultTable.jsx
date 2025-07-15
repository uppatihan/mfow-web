// components/ResultTable.jsx
export default function ResultTable({ data, offset = 0 }) {
  if (!data || data.length === 0) return <p>ไม่พบข้อมูล</p>;

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm text-left table-auto">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2 border text-center">No.</th>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 border">{col.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 even:bg-gray-100">
              <td className="px-4 py-2 border text-center">{offset + idx + 1}</td>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 border">{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
