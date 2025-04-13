import React, { useEffect, useState } from "react";
import { 
  Button, 
  Col, 
  Input, 
  message, 
  Row, 
  Table, 
  Tag, 
  theme, 
  Steps, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Badge, 
  Checkbox 
} from "antd";
import { 
  CheckCircleFilled, 
  UserOutlined, 
  CarOutlined, 
  CheckOutlined, 
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import Search from "antd/es/input/Search";
import {
  setOrderedChoosen,
  setSelectedDriver,
} from "@redux/features/orderReducer/orderSlice";
import { useDispatch, useSelector } from "react-redux";
import { getRequest, postRequest } from "@services/api";

const { Text, Title } = Typography;

function OrderBookingCustomer() {
  const [areaOrders, setAreaOrders] = useState([]); // Dữ liệu trả về từ API
  const [drivers, setDrivers] = useState([]); // Lưu danh sách tài xế
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số tài xế trên mỗi trang
  const [totalDrivers, setTotalDrivers] = useState(0); // Tổng số tài xế
  const [loading, setLoading] = useState(false); // Trạng thái loading
  
  useEffect(() => {
    fetchAreaOrders();
    fetchDrivers();
  }, []);

  const fetchAreaOrders = async () => {
    setLoading(true); // Bắt đầu loading
    try {
      const response = await getRequest("admin/orders/confirmed"); // Gọi API
      setAreaOrders(response.data); // Lưu dữ liệu vào state
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const fetchDrivers = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const response = await getRequest(
        `users?role=Driver&page=${page}&pageSize=${pageSize}`
      ); // Gọi API
      setDrivers(response.data.data); // Lưu danh sách tài xế vào state
      setTotalDrivers(response.data.totalRecords);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài xế:", error);
      message.error("Lỗi khi tải danh sách tài xế!");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const columnsDriver = [
    {
      title: "Tên tài xế",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (dob) => new Date(dob).toLocaleDateString("vi-VN"),
    },
  ];

  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const dispatch = useDispatch();
  const orderedChoosen = useSelector((state) => state.order.orderedChoosen);
  const selectedDriver = useSelector((state) => state.order.selectedDriver); // Lấy tài xế đã chọn từ store Redux
  const [selectedOrdersByArea, setSelectedOrdersByArea] = useState({});

  const steps = [
    {
      title: "Chọn đơn hàng",
      description: "Chọn đơn hàng cần xử lý",
      icon: <CheckCircleOutlined />
    },
    {
      title: "Chọn tài xế",
      description: "Chọn tài xế lấy đơn hàng",
      icon: <CarOutlined />
    },
    {
      title: "Finish",
      description: "Hoàn thành",
      icon: <CheckOutlined />
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };
  
  const prev = () => {
    setCurrent(current - 1);
  };

  const getRowSelectionForArea = (area) => ({
    selectedRowKeys:
      selectedOrdersByArea[area]?.map((order) => order.orderId) || [],
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedOrdersByArea((prev) => ({
        ...prev,
        [area]: selectedRows, // Cập nhật danh sách đơn hàng đã chọn cho khu vực
      }));
    },
  });

  const rowSelectionDrivers = {
    selectedRowKeys: selectedDriver ? [selectedDriver.userId] : [], // Sử dụng userId làm khóa
    onChange: (selectedRowKeys, selectedRows) => {
      dispatch(setSelectedDriver(selectedRows[0])); // Lưu tài xế đầu tiên được chọn
    },
  };

  const getSelectedOrders = () => {
    return Object.values(selectedOrdersByArea).flat(); // Gộp tất cả các đơn hàng từ các khu vực
  };

  const prepareAssignData = () => {
    const orderIds = getSelectedOrders().map((order) => order.orderId); // Lấy danh sách orderId
    const driverId = selectedDriver?.userId; // Lấy driverId từ tài xế đã chọn
    return { orderIds, driverId };
  };

  const assignOrdersToDriver = async () => {
    const { orderIds, driverId } = prepareAssignData();

    if (!orderIds.length || !driverId) {
      message.error("Vui lòng chọn đơn hàng và tài xế trước khi gán!");
      return;
    }

    try {
      const response = await postRequest("admin/assign-pickup", {
        orderIds,
        driverId,
      });

      if (response.data) {
        message.success("Giao đơn hàng cho tài xế thành công!");
        // Thực hiện các hành động khác nếu cần, ví dụ: làm mới danh sách
        // Reset lại trạng thái
        setCurrent(0); // Quay lại bước đầu tiên
        setSelectedOrdersByArea({}); // Xóa các đơn hàng đã chọn
        dispatch(setSelectedDriver(null)); // Xóa tài xế đã chọn
        fetchAreaOrders(); // Làm mới danh sách đơn hàng
        fetchDrivers(); // Làm mới danh sách tài xế
      } else {
        const errorData = await response.json();
        message.error(`Lỗi: ${errorData.message || "Không thể gán đơn hàng"}`);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      message.error("Đã xảy ra lỗi khi gán đơn hàng!");
    }
  };

  // Hiển thị nội dung dựa trên bước hiện tại
  const renderContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            {areaOrders?.map((areaData) => (
              <div key={areaData.area} style={{ marginBottom: "24px" }}>
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Khu vực: {areaData.area || "Unknown"}
                </Title>
                <Table
                  rowKey="orderId"
                  columns={[
                    {
                      title: "Mã đơn hàng",
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: ["userInfo", "fullName"],
                      key: "fullName",
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: ["userInfo", "phoneNumber"],
                      key: "phoneNumber",
                    },
                    {
                      title: "Địa chỉ lấy hàng",
                      dataIndex: "pickupAddressDetail",
                      key: "pickupAddressDetail",
                      ellipsis: true,
                    },
                    {
                      title: "Thời gian lấy hàng",
                      dataIndex: "pickupTime",
                      key: "pickupTime",
                      render: (time) => new Date(time).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Giá tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => `${price.toLocaleString()} VND`,
                    },
                  ]}
                  dataSource={areaData.orders}
                  loading={loading}
                  rowSelection={{
                    type: "checkbox",
                    ...getRowSelectionForArea(areaData.area),
                  }}
                  pagination={{ pageSize: 5 }}
                  size="small"
                  bordered
                />
              </div>
            ))}
          </>
        );
      case 1:
        return (
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Các đơn hàng đã chọn" bordered={false}>
                <Table
                  columns={[
                    {
                      title: "Mã đơn hàng",
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: ["userInfo", "fullName"],
                      key: "fullName",
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: ["userInfo", "phoneNumber"],
                      key: "phoneNumber",
                    },
                    {
                      title: "Địa chỉ lấy hàng",
                      dataIndex: "pickupAddressDetail",
                      key: "pickupAddressDetail",
                      ellipsis: true,
                    },
                    {
                      title: "Thời gian lấy hàng",
                      dataIndex: "pickupTime",
                      key: "pickupTime",
                      render: (time) => new Date(time).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Giá tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => `${price.toLocaleString()} VND`,
                    },
                  ]}
                  dataSource={getSelectedOrders()}
                  rowKey="orderId"
                  size="small"
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Danh sách các tài xế" bordered={false}>
                <Table
                  rowSelection={{ 
                    type: "radio", 
                    ...rowSelectionDrivers,
                    columnWidth: 40
                  }}
                  columns={columnsDriver}
                  dataSource={drivers}
                  rowKey="userId"
                  loading={loading}
                  size="small"
                  bordered
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalDrivers,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setPageSize(pageSize);
                      fetchDrivers(page, pageSize);
                    },
                  }}
                />
              </Card>
            </Col>
          </Row>
        );
      case 2:
        return (
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card 
                title="Đơn hàng đã chọn" 
                bordered={false}
                style={{ height: '100%' }}
              >
                <Table
                  columns={[
                    {
                      title: "Mã đơn hàng",
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: ["userInfo", "fullName"],
                      key: "fullName",
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: ["userInfo", "phoneNumber"],
                      key: "phoneNumber",
                    },
                    {
                      title: "Địa chỉ lấy hàng",
                      dataIndex: "pickupAddressDetail",
                      key: "pickupAddressDetail", 
                      ellipsis: true,
                    },
                    {
                      title: "Thời gian lấy hàng",
                      dataIndex: "pickupTime",
                      key: "pickupTime",
                      render: (time) => new Date(time).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Giá tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => `${price.toLocaleString()} VND`,
                    },
                  ]}
                  dataSource={getSelectedOrders()}
                  rowKey="orderId"
                  size="small"
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card 
                title="Danh sách các tài xế" 
                bordered={false}
                style={{ height: '100%' }}
              >
                <Table
                  rowSelection={{ 
                    type: "radio", 
                    ...rowSelectionDrivers,
                    columnWidth: 40 
                  }}
                  columns={columnsDriver}
                  dataSource={drivers}
                  rowKey="userId"
                  size="small"
                  bordered
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: totalDrivers,
                    onChange: (page, pageSize) => {
                      setCurrentPage(page);
                      setPageSize(pageSize);
                      fetchDrivers(page, pageSize);
                    },
                  }}
                />
              </Card>
            </Col>
          </Row>
        );
      default:
        return null;
    }
  };

  const hasSelectedOrders = Object.values(selectedOrdersByArea).some(
    (orders) => orders.length > 0
  );

  return (
    <Card className="order-booking-container">
      {/* Step indicator */}
      <Steps
        current={current}
        items={steps.map((item, index) => ({
          title: (
            <Text strong={current === index}>
              {item.title}
            </Text>
          ),
          description: (
            <Text 
              type={current === index ? "primary" : "secondary"}
              style={{ fontSize: 12 }}
            >
              {item.description}
            </Text>
          ),
          status: index < current ? "finish" : index === current ? "process" : "wait",
        }))}
      />

      <Divider />

      {/* Refresh button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={fetchAreaOrders}
        >
          Refresh
        </Button>
      </div>

      {/* Content area */}
      <div style={{ marginBottom: 24 }}>
        {renderContent()}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {current > 0 && (
            <Button 
              onClick={prev}
              icon={<LeftOutlined />}
            >
              Previous
            </Button>
          )}
        </div>
        <div>
          {current < steps.length - 1 && (
            (current === 0 && hasSelectedOrders) || 
            (current === 1 && hasSelectedOrders && selectedDriver)
          ) && (
            <Button 
              type="primary"
              onClick={next}
            >
              Next <RightOutlined />
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button 
              type="primary" 
              onClick={assignOrdersToDriver}
              icon={<CheckOutlined />}
            >
              Giao
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default OrderBookingCustomer;
