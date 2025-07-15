import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Car,
  LayoutDashboard,
  ArrowLeftRight,
  Banknote,
  Users,
  ChevronDown,
  ChevronUp,
  FileSearch,
  FileCheck2,
  SquareCheck,
  UserCheck,
  UserX,
  TriangleAlert,
} from "lucide-react";



export default function Sidebar() {
  const location = useLocation();
  const [openVIP, setOpenVIP] = useState(false);
  const [openInvoice, setOpenInvoice] = useState(false);
  const [OpenReceipt, setOpenReceipt] = useState(false);
  const [OpenTran, setOpenTran] = useState(false);


  useEffect(() => {
    if (
      location.pathname.startsWith("/car-balance") ||
      location.pathname.startsWith("/sum-transection")
    ) {
      setOpenVIP(true);
    }

    if (
      location.pathname.startsWith("/invoice-member") ||
      location.pathname.startsWith("/invoice-nonmember")
    ) {
      setOpenInvoice(true);
    }

    if (
      location.pathname.startsWith("/receipt-member") ||
      location.pathname.startsWith("/receipt-nonmember")
    ) {
      setOpenReceipt(true);
    }

    if (
      location.pathname.startsWith("/tran-member") ||
      location.pathname.startsWith("/tran-nonmember")
    ){
      setOpenTran(true)
    }

  }, [location.pathname]);

  return (
    <aside className="w-64 bg-gray-100 p-6 shadow-inner">
      <nav className="flex flex-col space-y-4">

        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded font-semibold text-sm ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" /> แดชบอร์ด
        </NavLink>

        {/* เมนู ตรวจสอบรายการผ่านทาง */}
        <div>
          <button
            onClick={() => setOpenTran(!OpenTran)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-sm font-semibold text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <SquareCheck className="w-4 h-4" />
              ตรวจสอบการผ่านทาง
            </span>
            {OpenTran ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {OpenTran && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink
                to="/tran-member"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm px-3 py-1 rounded-md transition-colors duration-200 ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                <UserCheck  className="w-5 h-5"/>
                ตรวจสอบการผ่านทางของสมาชิก
              </NavLink>
              <NavLink
                to="/tran-nonmember"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm px-3 py-1 rounded-md transition-colors duration-200 ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                <UserX className="w-5 h-5"/>
                ตรวจสอบการผ่านทางที่ไม่ใช่สมาชิก
              </NavLink>
              <NavLink
                to="/tran-illegal"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm px-3 py-1 rounded-md transition-colors duration-200 ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                <TriangleAlert className="w-5 h-5"/>
                ตรวจสอบการผ่านทางที่ผิดกฎหมาย
              </NavLink>
            </div>
          )}
        </div>

        {/* ตรวจสอบการชำระเงิน */}
        <NavLink
          to="/ref-checker"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded text-sm font-semibold ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
            }`
          }
        >
          <Banknote className="w-4 h-4" /> ตรวจสอบการชำระเงิน
        </NavLink>

        {/* เมนู CustomerVIP */}
        <div>
          <button
            onClick={() => setOpenVIP(!openVIP)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-sm font-semibold text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              CustomerVIP
            </span>
            {openVIP ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openVIP && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink
                to="/car-balance"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1 rounded text-sm ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                <Car className="w-4 h-4" /> Car Balance
              </NavLink>
              <NavLink
                to="/sum-transection"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1 rounded text-sm ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                <ArrowLeftRight className="w-4 h-4" /> รายการผ่านทาง
              </NavLink>
            </div>
          )}
        </div>

        {/* เมนู ค้นหาใบแจ้งหนี้ */}
        <div>
          <button
            onClick={() => setOpenInvoice(!openInvoice)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-sm font-semibold text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <FileSearch className="w-4 h-4" />
              ค้นหาใบแจ้งหนี้
            </span>
            {openInvoice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {openInvoice && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink
                to="/invoice-member"
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                👤 สมาชิก
              </NavLink>
              <NavLink
                to="/invoice-nonmember"
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                🧾 ไม่ใช่สมาชิก
              </NavLink>
            </div>
          )}
        </div>

        {/* เมนู ค้นหาใบเสร็จรับเงิน */}
        <div>
          <button
            onClick={() => setOpenReceipt(!OpenReceipt)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-sm font-semibold text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              ค้นหาใบเสร็จรับเงิน
            </span>
            {OpenReceipt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {OpenReceipt && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink
                to="/receipt-member"
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                👤 สมาชิก
              </NavLink>
              <NavLink
                to="/receipt-nonmember"
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                  }`
                }
              >
                🧾 ไม่ใช่สมาชิก
              </NavLink>
            </div>
          )}
        </div>

      </nav>
    </aside>
  );
}
