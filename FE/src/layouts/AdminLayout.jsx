import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UsergroupAddOutlined,
  DashboardOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
  SettingOutlined,
  SolutionOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  theme,
  Tag,
  Tooltip,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import logo from "../assets/logo3.jpg";
import logo2 from "../assets/logo3.jpg";
import WelcomeMessage from "./WelcomeLayout";
import {
  setActiveKey,
  toggleSidebar,
  setOpenKeys,
} from "@redux/features/sidebarMenuSlice";
import { logout } from "@redux/features/authReducer/authSlice";

import endPoints from "../routers/router";
import { imageBaseUrl } from "@utils/imageUtils";
import DashBoard from "@pages/dashboard";
import ConfirmOrderPending from "@pages/confirm-order-pending";
import { getRequestParams } from "@services/api";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const dispatch = useDispatch();
  const { collapsed, activeKey, openKeys } = useSelector(
    (state) => state.sidebar
  );

  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { user, role } = useSelector((state) => state.auth);

  const [userInfo, setUserInfo] = useState(null);


  useEffect(() => {
    const currentPath = location.pathname;
    let activeKey = currentPath;
    dispatch(setActiveKey(activeKey));
    const parentKey = menuItems.find(
      (item) =>
        item.children && item.children.some((child) => child.key === activeKey)
    )?.key;
    if (parentKey) dispatch(setOpenKeys([parentKey]));
  }, [location.pathname, dispatch]);

  const handleMenuClick = ({ key }) => {
    dispatch(setActiveKey(key));
    navigate(key);
  };

  const onOpenChange = (keys) => {
    dispatch(setOpenKeys(keys));
  };

  const menuItems = [
    {
      key: endPoints.DASHBOARD,
      icon: <DashboardOutlined />,
      label: "Dashboard",
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.QuanLyGiaoNhanHang,
      icon: <TeamOutlined />,
      label: "Quản lý giao nhận đơn hàng",
      allowedRoles: ["Admin"],
      children: [
        {
          key: `${endPoints.DANH_SACH_TAT_CA_DON_HANG}`,
          icon: <UsergroupAddOutlined />,
          label: "Danh sách tất cả đơn hàng",
          allowedRoles: ["Admin", "Staff"],
        },
        {
          key: `${endPoints.DANH_SACH_DON_HANG_KHACH_VUA_DAT}`,
          icon: <UsergroupAddOutlined />,
          label: (
            <Tooltip title="Danh sách đơn hàng khách hàng vừa đặt">
              Danh sách đơn hàng khách hàng vừa đặt
            </Tooltip>
          ),
          allowedRoles: ["Admin", "Staff"],
        },
        {
          key: `${endPoints.DANH_SACH_DON_HANG_DA_KIEM_TRA_CHAT_LUONG}`,
          icon: <CalendarOutlined />,
          label: (
            <Tooltip title="Danh sách đơn hàng đã giặt xong và kiểm tra chất lượng">
              Danh sách đơn hàng đã giặt xong và kiểm tra chất lượng
            </Tooltip>
          ),
          allowedRoles: ["Admin", "Staff"],
        },
      ],
    },

    {
      key: endPoints.SERVICES,
      icon: <UsergroupAddOutlined />,
      label: "Quản lý các dịch vụ",
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.EXTRACATEGORIES,
      icon: <UsergroupAddOutlined />,
      label: "Quản lý dịch vụ thêm",
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.ORDER,
      icon: <UsergroupAddOutlined />,
      label: "Quản lý đơn hàng",
      allowedRoles: ["Admin", "Staff"],
    },
    {
      key: endPoints.USERS,
      icon: <UsergroupAddOutlined />,
      label: "Quản lý người dùng",
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.CONFIRMCUSTOMERPENDING,
      icon: <UsergroupAddOutlined />,
      label: "Đơn hàng đang chờ xác nhận",
      allowedRoles: ["CustomerStaff"],
    },
    {
      key: endPoints.CHAT,
      icon: <UsergroupAddOutlined />,
      label: "Chat",
      allowedRoles: ["Admin", "Staff", "CustomerStaff"],
    },
    {
      key: endPoints.CHATWIITHAI,
      icon: <UsergroupAddOutlined />,
      label: "Chat Với AI Support",
      allowedRoles: ["Admin"],
    },
  ];

  const filteredMenuItems = menuItems
    .filter((item) => {
      if (item.children) {
        item.children = item.children.filter((child) =>
          child.allowedRoles?.includes(role)
        );
        return item.children.length > 0;
      }
      return item.allowedRoles?.includes(role);
    })
    .map(({ allowedRoles, ...item }) => {
      if (item.children) {
        item.children = item.children.map(
          ({ allowedRoles, ...child }) => child
        );
      }
      return item;
    });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getRequestParams(`/users/${user?.userId}`);
      setUserInfo(response.data);
      console.log("check response", response);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          borderRadius: 20,
          marginRight: 10,
        }}
        theme="light"
        width={300}
      >
        <div style={{ textAlign: "center", padding: "16px" }}>
          <img
            src={collapsed ? logo2 : logo}
            alt="logo"
            className="primary-logo"
            style={{ maxWidth: collapsed ? "32px" : "120px", height: "auto" }}
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onClick={handleMenuClick}
          onOpenChange={onOpenChange}
          items={filteredMenuItems}
          style={{ whiteSpace: "normal" }} // Allow text to wrap
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            borderRadius: 20,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => dispatch(toggleSidebar())}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />

          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <Button onClick={() => navigate("/profile")} style={{ color:"white", background:"blue" ,width: "100%" }}>
                      Profile
                    </Button>
                  ),
                  key: "1",
                  style: { textAlign: "center" },
                },
                {
                  label: (
                    <Button onClick={handleLogout} style={{ width: "100%", color:"white",background:"red" }}>
                      Logout
                    </Button>
                  ),
                  key: "0",
                  style: { textAlign: "center" },
                },
              ],
            }}
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()} style={{ color: "black" }}>
              <Space>
                <Avatar
                  size="large"
                  src={
                    userInfo?.avatar &&
                    userInfo?.avatar !== "null" &&
                    userInfo?.avatar !== ""
                      ? userInfo.avatar
                      : "data:image/png;base64,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"
                  }
                />
                Hi
                <Tag color="blue">{user?.fullName}</Tag>
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 20,
            overflow: "hidden", // Ẩn nội dung tràn
          }}
        >
          {location.pathname === "/" && role == "Admin" ? (
            <DashBoard />
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
