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
  Checkbox,
  Modal,
  Descriptions,
  Timeline,
  Tooltip,
  Image,
  Avatar
} from "antd";
import {
  CheckCircleFilled,
  UserOutlined,
  CarOutlined,
  CheckOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  CameraOutlined
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

  // State cho xem chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // State cho xem lịch sử đơn hàng
  const [orderHistory, setOrderHistory] = useState(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryPhotos, setSelectedHistoryPhotos] = useState([]);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

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

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await getRequest("users/drivers/available"); // API mới
      console.log("Dữ liệu tài xế trả về:", response);
      setDrivers(response.data.data); // Lưu danh sách tài xế vào state
      setTotalDrivers(response.data.count); // Sử dụng count từ response
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tài xế:", error);
      message.error("Lỗi khi tải danh sách tài xế!");
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  const getWorkStatus = (driver) => {
    const { deliveryOrderCount, pickupOrderCount } = driver;
    
    if (deliveryOrderCount === 0 && pickupOrderCount === 0) {
      return { text: "Không có đơn", color: "default" };
    } else if (pickupOrderCount > 0 && deliveryOrderCount === 0) {
      return { text: "Có đơn nhận", color: "processing" };
    } else if (deliveryOrderCount > 0 && pickupOrderCount === 0) {
      return { text: "Có đơn giao", color: "warning" };
    } else {
      return { text: "Có đơn nhận và giao", color: "error" };
    }
  };

  const columnsDriver = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar, record) => (
        <Avatar 
          src={avatar} 
          size={50}
          icon={<UserOutlined />}
        />
      ),
    },
    {
      title: "Tên tài xế",
      dataIndex: "fullname", // Đổi từ fullName thành fullname
      key: "fullname",
    },
    {
      title: "Trạng thái công việc",
      key: "workStatus",
      render: (_, record) => {
        const status = getWorkStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => gender === "Male" ? "Nam" : "Nữ",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (dob) => new Date(dob).toLocaleDateString("vi-VN"),
    },

    {
      title: "Số đơn hiện tại",
      dataIndex: "currentOrderCount",
      key: "currentOrderCount",
      render: (count) => <Badge count={count} showZero />,
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

  // Hàm xem chi tiết đơn hàng
  const fetchOrderDetail = async (orderId) => {
    setIsLoadingDetail(true);
    try {
      const response = await getRequest(`orders/${orderId}`);
      if (response && response.data) {
        setSelectedOrder(response.data);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      message.error("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetail = (orderId) => {
    fetchOrderDetail(orderId);
  };

  // Hàm xem lịch sử đơn hàng
  const fetchOrderHistory = async (orderId) => {
    setIsLoadingHistory(true);
    try {
      const response = await getRequest(`orders/history/${orderId}`);
      if (response && response.data) {
        setOrderHistory(response.data);
        setIsHistoryModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      message.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = (orderId) => {
    fetchOrderHistory(orderId);
  };

  // Hàm hỗ trợ format
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() + " VND";
  };

  const getStatusColor = (status) => {
    const statusColors = {
      SCHEDULED_PICKUP: "#1890ff",
      CANCELLED: "#ff4d4f",
      PENDING: "#faad14",
      WASHING: "#13c2c2",
      PICKEDUP: "#52c41a",
      WASHED: "#722ed1",
      DELIVERYFAILED: "#eb2f96"
    };
    return statusColors[status] || "#000000";
  };

  const getStatusStyle = (status) => {
    return {
      color: getStatusColor(status),
      backgroundColor: getStatusColor(status) + '10',
      borderColor: getStatusColor(status),
      fontWeight: 500,
      textTransform: 'uppercase',
      fontSize: '0.85rem',
      padding: '4px 12px',
      borderRadius: '6px'
    };
  };

  const getTimelineItemColor = (status) => {
    const statusColors = {
      PENDING: '#faad14',
      CONFIRMED: '#52c41a',
      SCHEDULED_PICKUP: '#1890ff',
      PICKINGUP: '#722ed1',
      PICKEDUP: '#13c2c2',
      PICKUP_SUCCESS: '#52c41a',
      CHECKING: '#fa8c16',
      CHECKED: '#52c41a',
      WASHING: '#1890ff',
      CANCELLED: '#ff4d4f',
      WASHED: '#722ed1',
      DELIVERYFAILED: '#ff4d4f'
    };
    return statusColors[status] || '#000000';
  };

  const fetchHistoryPhotos = async (statusHistoryId) => {
    setLoadingPhotos(true);
    try {
      const response = await getRequest(`photos?statusHistoryId=${statusHistoryId}`);
      if (response && response.data) {
        setSelectedHistoryPhotos(response.data);
        setIsPhotoModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      message.error("Không thể tải hình ảnh");
    } finally {
      setLoadingPhotos(false);
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
                    {
                      title: "Số lần người dùng hủy",
                      dataIndex: "userDeclineCount",
                      key: "userDeclineCount",
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      width: 120,
                      render: (_, record) => (
                        <Space size="small">
                          <Tooltip title="Xem chi tiết">
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetail(record.orderId)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Xem lịch sử">
                            <Button
                              type="link"
                              icon={<HistoryOutlined />}
                              onClick={() => handleViewHistory(record.orderId)}
                              size="small"
                            />
                          </Tooltip>
                        </Space>
                      ),
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
                    {
                      title: 'Thao tác',
                      key: 'action',
                      width: 100,
                      render: (_, record) => (
                        <Space size="small">
                          <Tooltip title="Xem chi tiết">
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetail(record.orderId)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Xem lịch sử">
                            <Button
                              type="link"
                              icon={<HistoryOutlined />}
                              onClick={() => handleViewHistory(record.orderId)}
                              size="small"
                            />
                          </Tooltip>
                        </Space>
                      ),
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
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
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
                    {
                      title: 'Thao tác',
                      key: 'action',
                      width: 100,
                      render: (_, record) => (
                        <Space size="small">
                          <Tooltip title="Xem chi tiết">
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetail(record.orderId)}
                              size="small"
                            />
                          </Tooltip>
                          <Tooltip title="Xem lịch sử">
                            <Button
                              type="link"
                              icon={<HistoryOutlined />}
                              onClick={() => handleViewHistory(record.orderId)}
                              size="small"
                            />
                          </Tooltip>
                        </Space>
                      ),
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
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
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

      {/* Modal xem chi tiết đơn hàng */}
      <Modal
        title={<Text strong>Chi tiết đơn hàng {selectedOrder?.orderId}</Text>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {isLoadingDetail ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
        ) : (
          selectedOrder && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Tag style={getStatusStyle(selectedOrder.currentOrderStatus?.currentStatus)}>
                    {selectedOrder.currentOrderStatus?.currentStatus}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {selectedOrder.currentOrderStatus?.statusDescription}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Thông tin lấy hàng" span={2}>
                  <Space direction="vertical">
                    <Text strong>{selectedOrder.pickupName} - {selectedOrder.pickupPhone}</Text>
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{selectedOrder.pickupAddressDetail}</Text>
                    </Space>
                    <Text type="secondary">Thời gian: {formatDateTime(selectedOrder.pickupTime)}</Text>
                    {selectedOrder.pickupDescription && (
                      <Text type="secondary">Ghi chú: {selectedOrder.pickupDescription}</Text>
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Thông tin giao hàng" span={2}>
                  <Space direction="vertical">
                    <Text strong>{selectedOrder.deliveryName} - {selectedOrder.deliveryPhone}</Text>
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{selectedOrder.deliveryAddressDetail}</Text>
                    </Space>
                    <Text type="secondary">Thời gian: {formatDateTime(selectedOrder.deliveryTime)}</Text>
                    {selectedOrder.deliveryDescription && (
                      <Text type="secondary">Ghi chú: {selectedOrder.deliveryDescription}</Text>
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Tổng tiền hàng">
                  {formatCurrency(selectedOrder.orderSummary?.estimatedTotal)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí vận chuyển">
                  {formatCurrency(selectedOrder.orderSummary?.shippingFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá vận chuyển">
                  {formatCurrency(selectedOrder.orderSummary?.shippingDiscount)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí phát sinh">
                  {formatCurrency(selectedOrder.orderSummary?.applicableFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  {formatCurrency(selectedOrder.orderSummary?.discount)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng cộng">
                  <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                    {formatCurrency(selectedOrder.orderSummary?.totalPrice)}
                  </Text>
                </Descriptions.Item>

                {selectedOrder.notes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedOrder.notes}
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Thời gian tạo đơn">
                  {formatDateTime(selectedOrder.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật cuối">
                  {formatDateTime(selectedOrder.currentOrderStatus?.lastUpdate)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )
        )}
      </Modal>

      {/* Modal xem lịch sử đơn hàng */}
      <Modal
        title={<Text strong>Lịch sử đơn hàng {orderHistory?.[0]?.orderId}</Text>}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsHistoryModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {isLoadingHistory ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
        ) : (
          <Timeline
            mode="left"
            items={orderHistory?.map(item => ({
              color: getTimelineItemColor(item.status),
              label: (
                <div style={{ width: '150px' }}>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </Text>
                </div>
              ),
              children: (
                <div style={{ padding: '0 8px' }}>
                  <Space direction="vertical" size="small">
                    <Text strong>{item.statusDescription}</Text>
                    <div>
                      <Text type="secondary">Cập nhật bởi: </Text>
                      <Text>{item.updatedBy.fullName}</Text>
                      <Text type="secondary"> - </Text>
                      <Text>{item.updatedBy.phoneNumber}</Text>
                    </div>
                    {item.notes && (
                      <Text italic>Ghi chú: {item.notes}</Text>
                    )}
                    {item.containMedia && (
                      <Tag
                        color="blue"
                        icon={<CameraOutlined />}
                        style={{ cursor: 'pointer' }}
                        onClick={() => fetchHistoryPhotos(item.statusHistoryId)}
                      >
                        Xem hình ảnh đính kèm
                      </Tag>
                    )}
                  </Space>
                </div>
              ),
            }))}
          />
        )}
      </Modal>

      {/* Modal xem hình ảnh lịch sử */}
      <Modal
        title="Hình ảnh đính kèm"
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsPhotoModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {loadingPhotos ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải ảnh...</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {selectedHistoryPhotos.map((photo, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <Image
                  src={photo.photoUrl}
                  alt={`Ảnh ${index + 1}`}
                  style={{ objectFit: 'cover' }}
                  width={200}
                  height={200}
                />
                <Text type="secondary" style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '4px',
                  fontSize: '0.9em'
                }}>
                  {new Date(photo.createdAt).toLocaleString("vi-VN")}
                </Text>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
}

export default OrderBookingCustomer;
