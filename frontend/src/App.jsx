import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import RefCheckerPage from "./pages/RefCheckerPage";
import Layout from "./layout/Layout";
import ResultPage from "./pages/ResultPage";
import CarBalancePage from "./pages/CarBalancePage";
import CarBalanceResultPage from "./pages/CarBalanceResultPage";
import SumTransectionPage from "./pages/SumTransectionPage";
import SumTransectionResultPage from "./pages/SumTransectionResultPage";
import InvoiceSearchMemberPage from "./pages/InvoiceSearchMemberPage";
import InvoiceSearchNonmemberPage from "./pages/InvoiceSearchNonmemberPage";
import InvoiceResultPage from "./pages/InvoiceResultPage";
import ReceiptSearchMemberPage from "./pages/ReceiptSearchMemberPage"
import ReceiptSearchNonmemberPage from "./pages/ReceiptSearchNonmemberPage"
import ReceiptResultPage from "./pages/ReceiptResultPage"
import TranSearchMemberPage from "./pages/TranSearchMemberPage"
import TranSearchNonmemberPage from "./pages/TranSearchNonmemberPage"
import TranResultPage from "./pages/TranResultPage"
import TranSearchIllegalPage from "./pages/TranSearchillegalPage"
import TranillegalResultPage from "./pages/TranillegalResultPage"
import SearchTranDetailPage from "./pages/SearchTranDetailPage"
import SearchTranDetailResultPage from "./pages/SearchTranDetailResultPage"
import SearchImagesRegisterPage from "./pages/ImagesRegister/ImagesRegisterSearch"
import SearchImagesRegisterResultPage from "./pages/ImagesRegister/ImagesRegisterResult"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />

          {/* ตรวจสอบการชำระเงิน */}
          <Route path="ref-checker" element={<RefCheckerPage />} />
          <Route path="result" element={<ResultPage />} />

          {/* CustomerVIP routes */}
          <Route path="car-balance" element={<CarBalancePage />} />
          <Route path="car-balance/result" element={<CarBalanceResultPage />} />
          <Route path="sum-transection" element={<SumTransectionPage />} />
          <Route path="sum-transection-result" element={<SumTransectionResultPage />} />

          {/* 🔹 Invoice search routes */}
          <Route path="invoice-member" element={<InvoiceSearchMemberPage />} />
          <Route path="invoice-nonmember" element={<InvoiceSearchNonmemberPage />} />
          <Route path="invoice-result" element={<InvoiceResultPage />} />

          {/* 🔹 receipt search routes */}
          <Route path="receipt-member" element={<ReceiptSearchMemberPage />} />
          <Route path="receipt-nonmember" element={<ReceiptSearchNonmemberPage />} />
          <Route path="receipt-result" element={<ReceiptResultPage />} />

          {/* 🔹 Tran search routes */}
          <Route path="tran-member" element={<TranSearchMemberPage />} />
          <Route path="tran-nonmember" element={<TranSearchNonmemberPage />} />
          <Route path="tran-illegal" element={<TranSearchIllegalPage />} />
          <Route path="tran-result" element={<TranResultPage />} />
          <Route path="tran-result-illegal" element={<TranillegalResultPage />} />

          <Route path="tran-detail" element={< SearchTranDetailPage />} />
          <Route path="tran-detail-result" element={<SearchTranDetailResultPage />} />

          {/* 🔹 Images Register search routes */}
          <Route path="img-regis" element={<SearchImagesRegisterPage />} />
          <Route path="img-regis-result" element={<SearchImagesRegisterResultPage />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
