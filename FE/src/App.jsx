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

function App() {
  useComplaintNotification();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={endPoints.LOGIN} replace />} />
        {/* PrivateRoute cho Admin và Staff, CustomerStaff */}
        <Route
          element={
            <PrivateRoute allowedRoles={["Admin", "Staff", "CustomerStaff"]} />
          }
        >
          <Route path={endPoints.ALL} element={<AdminLayout />}>
            <Route index element={<Chat />} />
            <Route
              path={endPoints.PROFILE}
              element={<Profile />}
            />
            <Route
              path={endPoints.DANH_SACH_TAT_CA_DON_HANG}
              element={<ListAllOrders />}
            />
            <Route
              path={endPoints.DANH_SACH_DON_HANG_KHACH_VUA_DAT}
              element={<OrderBookingCustomer />}
            />
            <Route
              path={endPoints.DANH_SACH_DON_HANG_DA_KIEM_TRA_CHAT_LUONG}
              element={<QuanLiDonHangDaKiemTraChatLuong />}
            />
            {/* <Route path={endPoints.ORDER} element={<Order />} /> */}
            <Route path={endPoints.CHAT} element={<Chat />} />
          </Route>
        </Route>
        
        {/* PrivateRoute cho Admin và CustomerStaff */}

        <Route element={<PrivateRoute allowedRoles={["Admin", "CustomerStaff"]} />}>
          <Route path={endPoints.ALL} element={<AdminLayout />}>
            <Route path={endPoints.COMPLAINT} element={<Complaint />} />
          </Route>
        </Route>

        {/* PrivateRoute chỉ dành cho CustomerStaff */}
        <Route element={<PrivateRoute allowedRoles={["CustomerStaff"]} />}>
          <Route path={endPoints.ALL} element={<AdminLayout />}>
            <Route index element={<ConfirmOrderPending />} />
            <Route
              path={endPoints.CONFIRMCUSTOMERPENDING}
              element={<ConfirmOrderPending />}
            />
            <Route path={endPoints.CHAT} element={<Chat />} />
          </Route>
        </Route>

        {/* PrivateRoute chỉ dành cho Admin */}
        <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
          <Route path={endPoints.ALL} element={<AdminLayout />}>
            <Route index element={<DashBoard />} />
            <Route path={endPoints.DASHBOARD} element={<DashBoard />} />

            <Route path={endPoints.AREAS} element={<Areas />} />

            <Route path={endPoints.POLICY} element={<Policy />} />



            <Route path={endPoints.SERVICES} element={<Services />} />
            <Route
              path={endPoints.EXTRACATEGORIES}
              element={<ExtraCategories />}
            />
            <Route path={endPoints.USERS} element={<Users />} />
            <Route path={endPoints.CHATWIITHAI} element={<ChatWithAi />} />
          </Route>
        </Route>
        <Route path={endPoints.LOGIN} element={<Login />} />
        <Route path={endPoints.FORBIDDEN} element={<ForbiddenPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
