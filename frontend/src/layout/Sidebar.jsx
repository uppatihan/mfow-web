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
  Menu,
  Camera,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  // โหลดค่าจาก localStorage (true/false) ตอนเริ่มต้น
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );

  const toggleSidebar = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    localStorage.setItem("sidebar-collapsed", newValue);
  };

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
      location.pathname.startsWith("/tran-nonmember") ||
      location.pathname.startsWith("/tran-illegal")
    ) {
      setOpenTran(true);
    }
  }, [location.pathname]);

  return (
    <aside className={`bg-gray-100 p-4 shadow-inner transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <div className="flex items-center justify-between mb-4">
        {!collapsed && <h1 className="text-lg font-bold text-gray-700">เมนู</h1>}
        <button
          onClick={toggleSidebar}
          className="ml-2 text-gray-600 hover:text-blue-600"
          title="พับ/ขยายเมนู"
        >
          <Menu />
        </button>
      </div>

      <nav className="flex flex-col space-y-4 text-sm font-medium">
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          {!collapsed && "แดชบอร์ด"}
        </NavLink>

        {/* ตรวจสอบรายการผ่านทาง */}
        <div>
          <button
            onClick={() => setOpenTran(!OpenTran)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <SquareCheck className="w-4 h-4" />
              {!collapsed && "ตรวจสอบการผ่านทาง"}
            </span>
            {!collapsed && (OpenTran ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>

          {OpenTran && !collapsed && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink to="/tran-member" className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                <UserCheck className="w-4 h-4" />
                สมาชิก
              </NavLink>
              <NavLink to="/tran-nonmember" className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                <UserX className="w-4 h-4" />
                ไม่ใช่สมาชิก
              </NavLink>
              <NavLink to="/tran-illegal" className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                <TriangleAlert className="w-4 h-4" />
                ผิดกฎหมาย
              </NavLink>
            </div>
          )}
        </div>

        {/* ตรวจสอบการชำระเงิน */}
        <NavLink
          to="/ref-checker"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
            }`
          }
        >
          <Banknote className="w-4 h-4" />
          {!collapsed && "ตรวจสอบการชำระเงิน"}
        </NavLink>

        {/* CustomerVIP */}
        <div>
          <button
            onClick={() => setOpenVIP(!openVIP)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {!collapsed && "CustomerVIP"}
            </span>
            {!collapsed && (openVIP ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>

          {openVIP && !collapsed && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink to="/car-balance" className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                <Car className="w-4 h-4" />
                Car Balance
              </NavLink>
              <NavLink to="/sum-transection" className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                <ArrowLeftRight className="w-4 h-4" />
                รายการผ่านทาง
              </NavLink>
            </div>
          )}
        </div>

        {/* ค้นหาใบแจ้งหนี้ */}
        <div>
          <button
            onClick={() => setOpenInvoice(!openInvoice)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <FileSearch className="w-4 h-4" />
              {!collapsed && "ค้นหาใบแจ้งหนี้"}
            </span>
            {!collapsed && (openInvoice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>

          {openInvoice && !collapsed && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink to="/invoice-member" className={({ isActive }) =>
                `px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                👤 สมาชิก
              </NavLink>
              <NavLink to="/invoice-nonmember" className={({ isActive }) =>
                `px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                🧾 ไม่ใช่สมาชิก
              </NavLink>
            </div>
          )}
        </div>

        {/* ค้นหาใบเสร็จรับเงิน */}
        <div>
          <button
            onClick={() => setOpenReceipt(!OpenReceipt)}
            className="flex items-center justify-between w-full px-3 py-2 rounded text-gray-700 hover:bg-blue-100"
          >
            <span className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" />
              {!collapsed && "ค้นหาใบเสร็จรับเงิน"}
            </span>
            {!collapsed && (OpenReceipt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
          </button>

          {OpenReceipt && !collapsed && (
            <div className="ml-6 mt-2 flex flex-col space-y-2">
              <NavLink to="/receipt-member" className={({ isActive }) =>
                `px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                👤 สมาชิก
              </NavLink>
              <NavLink to="/receipt-nonmember" className={({ isActive }) =>
                `px-3 py-1 rounded ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
                }`
              }>
                🧾 ไม่ใช่สมาชิก
              </NavLink>
            </div>
          )}
        </div>

        {/* Transection Detail */}
        <NavLink
          to="/tran-detail"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
            }`
          }
        >
          <ArrowLeftRight className="w-4 h-4" />
          {!collapsed && "ค้นหา Transection Detail"}
        </NavLink>

        {/* Images Register */}
        <NavLink
          to="/img-regis"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded ${
              isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
            }`
          }
        >
          <Camera className="w-4 h-4" />
          {!collapsed && "ค้นหารูปภาพการลงทะเบียน"}
        </NavLink>
        

      </nav>
    </aside>
  );
}
