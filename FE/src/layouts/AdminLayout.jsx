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
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  AppstoreAddOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
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
import { css } from '@emotion/css';

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

const sidebarStyles = css`
  .ant-menu-item, .ant-menu-submenu-title {
    margin: 8px 0 !important;
    height: auto !important;
    min-height: 45px !important;
    padding: 8px 12px !important;
    border-radius: 8px !important;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
    white-space: normal !important;
    line-height: 1.4 !important;
  }
  
  .ant-layout-sider-collapsed .ant-menu-item, 
  .ant-layout-sider-collapsed .ant-menu-submenu-title {
    padding: 0 calc(50% - 16px) !important;
    text-align: center !important;
  }
  
  .ant-menu-item-icon {
    margin-right: 12px !important;
    font-size: 18px !important;
  }
  
  .ant-layout-sider-collapsed .ant-menu-item-icon {
    margin-right: 0 !important;
    font-size: 18px !important;
    line-height: 45px !important;
  }
  
  .ant-menu-title-content {
    white-space: normal !important;
    line-height: 1.4 !important;
    display: inline-block !important;
    transition: opacity 0.3s !important;
  }
  
  .ant-layout-sider-collapsed .ant-menu-title-content {
    opacity: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
  }
  
  .ant-menu-item:hover, .ant-menu-submenu-title:hover {
    background-color: rgba(59, 183, 126, 0.1) !important;
    color: #3bb77e !important;
    transform: translateX(5px) !important;
  }
  
  .ant-layout-sider-collapsed .ant-menu-item:hover, 
  .ant-layout-sider-collapsed .ant-menu-submenu-title:hover {
    transform: scale(1.1) !important;
  }
  
  .ant-menu-item-selected {
    background: linear-gradient(90deg, #3bb77e 0%, #4CAF50 100%) !important;
    color: white !important;
    font-weight: 500 !important;
    box-shadow: 0 3px 10px rgba(59, 183, 126, 0.4) !important;
  }
  
  .ant-menu-item-selected .ant-menu-item-icon {
    color: white !important;
  }
  
  .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: #3bb77e !important;
    font-weight: 500 !important;
  }
  
  .ant-menu-submenu-arrow {
    transition: all 0.3s ease !important;
  }
  
  .ant-menu-submenu-open > .ant-menu-submenu-title > .ant-menu-submenu-arrow {
    transform: rotate(180deg) !important;
    color: #3bb77e !important;
  }
  
  .ant-menu-inline .ant-menu-item::after {
    display: none !important;
  }
  
  .sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    margin-bottom: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .sidebar-logo img {
    transition: all 0.3s ease;
  }
  
  .sidebar-logo span {
    margin-left: 8px;
    font-size: 18px;
    font-weight: bold;
    white-space: nowrap;
    color: #3bb77e;
    opacity: 1;
    transition: all 0.3s ease;
  }
  
  /* Fix tooltip positioning */
  .ant-tooltip {
    max-width: 300px;
  }
  
  .ant-tooltip-inner {
    word-wrap: break-word;
    word-break: break-word;
  }
`;

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

  // Hàm tạo label với tooltip
  const createLabelWithTooltip = (text) => (
    <Tooltip 
      title={text} 
      placement={collapsed ? "right" : "top"}
      overlayStyle={{ 
        wordBreak: "break-word", 
        maxWidth: "300px" 
      }}
    >
      <div style={{ 
        overflow: "hidden", 
        textOverflow: "ellipsis",
        ...(collapsed ? { width: 0, height: 0, opacity: 0 } : {})
      }}>
        {text}
      </div>
    </Tooltip>
  );

  const menuItems = [
    {
      key: endPoints.DASHBOARD,
      icon: <DashboardOutlined />,
      label: createLabelWithTooltip("Dashboard"),
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.QuanLyGiaoNhanHang,
      icon: <ShoppingCartOutlined />,
      label: createLabelWithTooltip("Quản lý giao nhận đơn hàng"),
      allowedRoles: ["Admin"],
      children: [
        {
          key: `${endPoints.DANH_SACH_TAT_CA_DON_HANG}`,
          icon: <ShoppingOutlined />,
          label: createLabelWithTooltip("Danh sách tất cả đơn hàng"),
          allowedRoles: ["Admin", "Staff"],
        },
        {
          key: `${endPoints.DANH_SACH_DON_HANG_KHACH_VUA_DAT}`,
          icon: <ClockCircleOutlined />,
          label: createLabelWithTooltip("Danh sách đơn hàng khách hàng vừa đặt"),
          allowedRoles: ["Admin", "Staff"],
        },
       
        {
          key: `${endPoints.DANH_SACH_DON_HANG_DA_KIEM_TRA_CHAT_LUONG}`,
          icon: <CheckCircleOutlined />,
          label: createLabelWithTooltip("Danh sách đơn hàng đã giặt xong và kiểm tra chất lượng"),
          allowedRoles: ["Admin", "Staff"],
        },
      ],
    },
    {
      key: `${endPoints.COMPLAINT}`,
      icon: <ExclamationCircleOutlined />,
      label: createLabelWithTooltip("Quản lý khiếu nại"),
      allowedRoles: ["Admin", "CustomerStaff"],
    },
    {
      key: endPoints.SERVICES,
      icon: <CustomerServiceOutlined />,
      label: createLabelWithTooltip("Quản lý các dịch vụ"),
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.EXTRACATEGORIES,
      icon: <AppstoreAddOutlined />,
      label: createLabelWithTooltip("Quản lý dịch vụ đi kèm"),
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.USERS,
      icon: <TeamOutlined />,
      label: createLabelWithTooltip("Quản lý người dùng"),
      allowedRoles: ["Admin"],
    },
    {
      key: endPoints.CONFIRMCUSTOMERPENDING,
      icon: <ClockCircleOutlined />,
      label: createLabelWithTooltip("Đơn hàng đang chờ xác nhận"),
      allowedRoles: ["CustomerStaff"],
    },
    {
      key: endPoints.CHAT,
      icon: <MessageOutlined />,
      label: createLabelWithTooltip("Chat"),
      allowedRoles: ["Admin", "Staff", "CustomerStaff"],
    },
    {
      key: endPoints.CHATWIITHAI,
      icon: <RobotOutlined />,
      label: createLabelWithTooltip("Chat Với AI Support"),
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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          background: "linear-gradient(180deg, #ffffff 0%, #f9fdfb 100%)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          position: "sticky",
          top: 0,
          left: 0,
          zIndex: 10,
          transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)"
        }}
        width={280}
        collapsedWidth={80}
        className={sidebarStyles}
      >
        <div className="sidebar-logo"
          style={{ 
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: "8px",
            height: collapsed ? "80px" : "90px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: collapsed ? "16px 0" : "24px 0 16px 0"
          }}
        >
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            transition: "all 0.3s ease"
          }}>
            <img
              src={collapsed ? logo2 : logo}
              alt="logo"
              className="primary-logo"
              style={{ 
                width: collapsed ? "40px" : "60px",
                height: "auto",
                transition: "all 0.3s",
                marginBottom: collapsed ? "0" : "8px"
              }}
            />
            {!collapsed && <span style={{ fontSize: "16px", fontWeight: "600", color: "#3bb77e" }}>EcoLaundry</span>}
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[activeKey]}
          openKeys={openKeys}
          onClick={handleMenuClick}
          onOpenChange={onOpenChange}
          items={filteredMenuItems}
          style={{ 
            padding: "0 8px",
            border: "none",
            background: "transparent",
            fontSize: "14px",
          }}
          inlineCollapsed={collapsed}
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
