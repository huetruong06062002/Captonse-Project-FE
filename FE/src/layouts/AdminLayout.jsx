import React, { useEffect } from "react";
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
import DashBoard from '@pages/dashboard';

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
      allowedRoles: ["Admin", "Staff"],
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
          key: `${endPoints.DANH_SACH_DON_HANG_DA_NHAN}`,
          icon: <CalendarOutlined />,
          label: (
            <Tooltip title="Danh sách đơn hàng đã nhận">
              Danh sách đơn hàng đã nhận
            </Tooltip>
          ),
          allowedRoles: ["Admin", "Staff"],
        },
        {
          key: `${endPoints.QUANLYINTERN}/${endPoints.KYTHUCTAP}`,
          icon: <CalendarOutlined />,
          label: (
            <Tooltip title="Danh sách đơn hàng đã giặt xong">
              Danh sách đơn hàng đã giặt xong
            </Tooltip>
          ),
          allowedRoles: ["Admin", "Staff"],
        },
        {
          key: `${endPoints.QUANLYINTERN}/${endPoints.KYTHUCTAP}`,
          icon: <CalendarOutlined />,
          label: (
            <Tooltip title="Danh sách đơn hàng đã hoàn thành">
              Danh sách đơn hàng đã hoàn thành
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
      key: endPoints.CHAT,
      icon: <UsergroupAddOutlined />,
      label: "Chat",
      allowedRoles: ["Admin", "Staff"],
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
                    <Button onClick={handleLogout} style={{ width: "100%" }}>
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
                    `${imageBaseUrl}${user?.imagePath}` ||
                    "https://i.pravatar.cc/300"
                  }
                />
                Hi {user?.username}
                <Tag color="blue">{role}</Tag>
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
          }}
        >
          {location.pathname === "/" ? <DashBoard /> : <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
