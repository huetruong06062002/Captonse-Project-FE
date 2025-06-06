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

import Services from "@pages/service";
import QuanLiDonHangDaNhan from "@pages/quan-li-giao-nhan-hang/quan-li-don-hang-da-giat-xong-va-kiem-tra-chat-luong";
import Users from "@pages/user";
import ExtraService from "@pages/extra-categories";
import ExtraCategories from "@pages/extra-categories";
import Order from "@pages/order";
import Chat from "@pages/chat";
import ChatWithAi from "@pages/chat-with-ai";
import ConfirmOrderPending from "@pages/confirm-order-pending";
import QuanLiDonHangDaKiemTraChatLuong from '@pages/quan-li-giao-nhan-hang/quan-li-don-hang-da-giat-xong-va-kiem-tra-chat-luong';
import Profile from '@pages/profile';
import Complaint from '@pages/complaint';
import useComplaintNotification from '@pages/notification';
import Areas from '@pages/areas';
import Policy from '@pages/policy';
import Branch from '@pages/branch';
import ORDERMANAGEMENTCUSTOMERSTAFF from '@pages/order-management-customer-staff';
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PlaceOrderManagementCustomerStaff from '@pages/place-order-management-customer-staff';
import AbsenDriverMangement from '@pages/quan-li-giao-nhan-hang/quan-li-lich-vang-tai-xe';
import ListOrderAssignment from '@pages/quan-li-giao-nhan-hang/danh-sach-don-hang-da-giao';
import ListAllOrdersFail from '@pages/quan-li-giao-nhan-hang/danh-sach-tat-ca-don-hang-loi';

// Component để redirect dựa trên role
const RoleBasedRedirect = () => {
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    switch (role) {
      case "Admin":
        navigate(endPoints.DASHBOARD, { replace: true });
        break;
      case "CustomerStaff":
        navigate(endPoints.CONFIRMCUSTOMERPENDING, { replace: true });
        break;
      default:
        navigate(endPoints.CHAT, { replace: true });
    }
  }, [role, navigate]);

  return <div>Đang chuyển hướng...</div>;
};

function App() {
  useComplaintNotification();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={endPoints.LOGIN} replace />} />

        {/* PrivateRoute cho tất cả authenticated users */}
        <Route element={<PrivateRoute allowedRoles={["Admin", "Staff", "CustomerStaff"]} />}>
          <Route path={endPoints.ALL} element={<AdminLayout />}>
            {/* Index route - redirect dựa trên role */}
            <Route index element={<RoleBasedRedirect />} />

            {/* Các routes chung cho tất cả roles */}
            <Route
              path={endPoints.PROFILE}
              element={<Profile />}
            />
            <Route path={endPoints.CHAT} element={<Chat />} />

            {/* Routes cho Admin */}
            <Route path={endPoints.DASHBOARD} element={<DashBoard />} />
            <Route path={endPoints.BRANCH} element={<Branch />} />
            <Route path={endPoints.AREAS} element={<Areas />} />
            <Route path={endPoints.POLICY} element={<Policy />} />
            <Route path={endPoints.SERVICES} element={<Services />} />
            <Route path={endPoints.QUAN_LI_LICH_VANG_TAI_XE} element=
            {<AbsenDriverMangement />} />
            <Route
              path={endPoints.EXTRACATEGORIES}
              element={<ExtraCategories />}
            />
            <Route path={endPoints.USERS} element={<Users />} />
            <Route path={endPoints.CHATWIITHAI} element={<ChatWithAi />} />
            <Route path={endPoints.DANH_SACH_DON_HANG_DA_GIAO} element={<ListOrderAssignment />} />
            {/* Routes cho Admin & Staff */}
            <Route
              path={endPoints.DANH_SACH_TAT_CA_DON_HANG}
              element={<ListAllOrders />}
            />
            <Route
              path={endPoints.DANH_SACH_TAT_CA_DON_HANG_LOI}
              element={<ListAllOrdersFail />}
            />
            <Route
              path={endPoints.DANH_SACH_DON_HANG_KHACH_VUA_DAT}
              element={<OrderBookingCustomer />}
            />
            <Route
              path={endPoints.DANH_SACH_DON_HANG_DA_KIEM_TRA_CHAT_LUONG}
              element={<QuanLiDonHangDaKiemTraChatLuong />}
            />

            {/* Routes cho Admin & CustomerStaff */}
            <Route path={endPoints.COMPLAINT} element={<Complaint />} />
            <Route path={endPoints.PLACEORDERMANAGEMENTCUSTOMERSTAFF} element={<PlaceOrderManagementCustomerStaff />} />
            {/* Routes cho CustomerStaff */}
            <Route
              path={endPoints.CONFIRMCUSTOMERPENDING}
              element={<ConfirmOrderPending />}
            />

            <Route path={endPoints.ORDERMANAGEMENTCUSTOMERSTAFF} element={<ORDERMANAGEMENTCUSTOMERSTAFF />} />
          </Route>
        </Route>
        <Route path={endPoints.LOGIN} element={<Login />} />
        <Route path={endPoints.FORBIDDEN} element={<ForbiddenPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
