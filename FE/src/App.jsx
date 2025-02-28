import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import endPoints from "./routers/router";
import Login from "@pages/login";
import PrivateRoute from "@components/PrivateRoute";
import AdminLayout from "./layouts/AdminLayout";
import ForbiddenPage from "@components/ForbiddenPage";
import DashBoard from "@pages/dashboard";
import OrderBookingCustomer from "@pages/quan-li-giao-nhan-hang/quan-li-don-hang-khach-vua-dat";
import ListAllOrders from "@pages/quan-li-giao-nhan-hang/danh-sach-tat-ca-don-hang";
import Services from '@pages/service';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={endPoints.LOGIN} replace />} />

        {/* Định nghĩa PrivateRoute chỉ cho phép Admin & Staff truy cập */}
        <Route element={<PrivateRoute allowedRoles={["Admin", "Staff"]} />}>
          <Route path={endPoints.ADMIN} element={<AdminLayout />}>
            <Route index element={<DashBoard />} />{" "}
            {/* Khi vào /admin thì tự động vào Dashboard */}
            <Route path={endPoints.DASHBOARD} element={<DashBoard />} />
            <Route
              path={endPoints.DANH_SACH_TAT_CA_DON_HANG}
              element={<ListAllOrders />}
            />
            <Route
              path={endPoints.DANH_SACH_DON_HANG_KHACH_VUA_DAT}
              element={<OrderBookingCustomer />}
            />
            <Route path={endPoints.SERVICES} element={<Services />} />
          </Route>
        </Route>

        <Route path={endPoints.LOGIN} element={<Login />} />
        <Route path={endPoints.FORBIDDEN} element={<ForbiddenPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
