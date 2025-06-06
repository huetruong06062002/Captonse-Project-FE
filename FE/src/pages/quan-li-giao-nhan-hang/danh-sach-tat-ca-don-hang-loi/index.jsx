import { Table, Tag, Input, Button, Space, Tooltip, message, Modal, Descriptions, Typography, Timeline, Image, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { getRequest } from "@services/api";
import { SearchOutlined, ReloadOutlined, EyeOutlined, HistoryOutlined, CameraOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create custom colored SVG icons
const createColoredMarkerSVG = (color) => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.3 12.5 28.5 12.5 28.5s12.5-20.2 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#ffffff"/>
    </svg>
  `)}`;
};

const pickupIcon = new L.Icon({
  iconUrl: createColoredMarkerSVG('#1890ff'),
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: createColoredMarkerSVG('#52c41a'),
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const combinedIcon = new L.Icon({
  iconUrl: createColoredMarkerSVG('#722ed1'),
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// MapWrapper component
const MapWrapper = ({ children, ...props }) => {
  const [mapKey, setMapKey] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey(prev => prev + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [props.center]);

  return (
    <div key={mapKey} style={{ height: '100%', width: '100%' }}>
      {children}
    </div>
  );
};

const { Search } = Input;
const { Text } = Typography;

function ListAllOrdersFail() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [orderHistory, setOrderHistory] = useState(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryPhotos, setSelectedHistoryPhotos] = useState([]);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  console.log("selectedOrder", selectedOrder);

  useEffect(() => {
    fetchAllOrdersFail();
  }, [currentPage, pageSize]);

  const fetchAllOrdersFail = async () => {
    setLoading(true);
    try {
      const response = await getRequest("/admin/quality-fail");
      console.log("Quality fail orders response: ", response);

      if (response && response.data) {
        setOrders(response.data);
        setTotalRecords(response.data.length);
      }
    } catch (error) {
      console.error("Error fetching quality fail orders:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Lỗi từ server';
        message.error(`Không thể tải danh sách đơn hàng lỗi: ${errorMessage}`);
      } else if (error.request) {
        message.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        message.error(`Lỗi tải đơn hàng lỗi: ${error.message || 'Lỗi không xác định'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      QUALITY_CHECKED: "#722ed1",
      COMPLAINT: "#ff4d4f",
      COMPLETED: "#52c41a",
      PENDING: "#faad14",
      WASHING: "#13c2c2",
      PICKEDUP: "#1890ff",
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={'Tìm kiếm ' + dataIndex}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      setIsLoadingDetail(true);
      // Thử với API chi tiết đơn hàng
      const response = await getRequest(`/orders/${orderId}`);
      if (response && response.data) {
        setSelectedOrder(response.data);
      } else {
        // Nếu không có dữ liệu từ API chi tiết, sử dụng dữ liệu từ danh sách
        const existingOrder = orders.find(order => order.orderId === orderId);
        if (existingOrder) {
          setSelectedOrder(existingOrder);
        }
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      // Fallback sử dụng dữ liệu từ danh sách nếu API bị lỗi
      const existingOrder = orders.find(order => order.orderId === orderId);
      if (existingOrder) {
        setSelectedOrder(existingOrder);
        message.warning("Hiển thị dữ liệu cơ bản - không thể tải chi tiết đầy đủ");
      } else {
        message.error("Không thể tải chi tiết đơn hàng");
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetail = (orderId) => {
    fetchOrderDetail(orderId);
    setIsModalVisible(true);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + ' VND';
  };

  const fetchOrderHistory = async (orderId) => {
    try {
      setIsLoadingHistory(true);
      const response = await getRequest(`/orders/history/${orderId}`);
      if (response && response.data) {
        setOrderHistory(response.data);
      } else {
        // Nếu không có API lịch sử, hiển thị thông báo
        setOrderHistory([]);
        message.info("Không có lịch sử chi tiết cho đơn hàng này");
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      setOrderHistory([]);
      if (error.response?.status === 404) {
        message.warning("Lịch sử đơn hàng chưa có sẵn");
      } else {
        message.error("Không thể tải lịch sử đơn hàng");
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = (orderId) => {
    fetchOrderHistory(orderId);
    setIsHistoryModalVisible(true);
  };

  const getTimelineItemColor = (status) => {
    const colors = {
      PENDING: 'orange',
      CONFIRMED: 'blue',
      SCHEDULED_PICKUP: 'cyan',
      PICKEDUP: 'green',
      WASHING: 'purple',
      WASHED: 'magenta',
      QUALITY_CHECKED: 'volcano',
      DELIVERING: 'gold',
      DELIVERED: 'lime',
      COMPLETED: 'green',
      CANCELLED: 'red',
      COMPLAINT: 'red'
    };
    return colors[status] || 'gray';
  };

  const fetchHistoryPhotos = async (statusHistoryId) => {
    try {
      setLoadingPhotos(true);
      const response = await getRequest(`/orders/history/${statusHistoryId}/photos`);
      if (response && response.data) {
        setSelectedHistoryPhotos(response.data);
        setIsPhotoModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching history photos:", error);
      message.error("Không thể tải ảnh lịch sử");
    } finally {
      setLoadingPhotos(false);
    }
  };

  // Function to check if pickup and delivery locations are the same
  const isSameLocation = (order) => {
    if (!order.pickupLatitude || !order.pickupLongitude || 
        !order.deliveryLatitude || !order.deliveryLongitude) {
      return false;
    }
    
    const latDiff = Math.abs(order.pickupLatitude - order.deliveryLatitude);
    const lngDiff = Math.abs(order.pickupLongitude - order.deliveryLongitude);
    
    return latDiff < 0.001 && lngDiff < 0.001;
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      ...getColumnSearchProps('orderId'),
      sorter: (a, b) => a.orderId.localeCompare(b.orderId),
      sortOrder: sortedInfo.columnKey === 'orderId' && sortedInfo.order,
      render: (text) => (
        <Tooltip title="Nhấn để xem chi tiết">
          <span 
            style={{ fontWeight: 500, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleViewDetail(text)}
          >
            {text}
          </span>
        </Tooltip>
      ),
      fixed: 'left',
      width: 150,
    },
    {
      title: "Tên đơn hàng",
      dataIndex: "orderName",
      key: "orderName",
      ...getColumnSearchProps('orderName'),
      sorter: (a, b) => a.orderName.localeCompare(b.orderName),
      sortOrder: sortedInfo.columnKey === 'orderName' && sortedInfo.order,
      render: (text) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
      width: 200,
    },
    {
      title: "Số lượng dịch vụ",
      dataIndex: "serviceCount",
      key: "serviceCount",
      sorter: (a, b) => a.serviceCount - b.serviceCount,
      sortOrder: sortedInfo.columnKey === 'serviceCount' && sortedInfo.order,
      align: 'center',
      width: 150,
      render: (count) => (
        <span style={{ 
          backgroundColor: '#f6ffed', 
          color: '#52c41a',
          padding: '4px 12px',
          borderRadius: '12px',
          fontWeight: 500
        }}>
          {count}
        </span>
      ),
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      sortOrder: sortedInfo.columnKey === 'totalPrice' && sortedInfo.order,
      align: 'right',
      width: 150,
      render: (price) => (
        <span style={{ 
          fontWeight: 600,
          color: '#d4380d'
        }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderedDate",
      key: "orderedDate",
      sorter: (a, b) => new Date(a.orderedDate) - new Date(b.orderedDate),
      sortOrder: sortedInfo.columnKey === 'orderedDate' && sortedInfo.order,
      width: 180,
      render: (date) => (
        <span style={{ 
          color: '#8c8c8c',
          fontSize: '0.9rem'
        }}>
          {formatDateTime(date)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: 'center',
      width: 150,
      filters: [
        { text: 'Đã kiểm tra chất lượng', value: 'QUALITY_CHECKED' },
        { text: 'Khiếu nại', value: 'COMPLAINT' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
        { text: 'Đang chờ', value: 'PENDING' },
      ],
      filteredValue: filteredInfo.orderStatus || null,
      onFilter: (value, record) => record.orderStatus === value,
      render: (status) => (
        <Tag style={getStatusStyle(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Mức độ khẩn cấp",
      dataIndex: "emergency",
      key: "emergency",
      align: 'center',
      width: 150,
      render: (emergency) => {
        if (!emergency) {
          return <span style={{ color: '#8c8c8c' }}>Bình thường</span>;
        }
        return (
          <span style={{
            backgroundColor: '#fff2f0',
            color: '#ff4d4f',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 500
          }}>
            {emergency}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record.orderId)}
            />
          </Tooltip>
          <Tooltip title="Xem lịch sử">
            <Button 
              type="link" 
              icon={<HistoryOutlined />} 
              onClick={() => handleViewHistory(record.orderId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ 
              backgroundColor: "#ff4d4f", 
              width: "6px", 
              height: "28px", 
              marginRight: "12px",
              borderRadius: "3px" 
            }}></div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "24px",
              fontWeight: "600",
              background: "linear-gradient(90deg, #ff4d4f, #ff7875)", 
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}>Danh sách tất cả đơn hàng lỗi</h2>
          </div>
          <Space>
            <Button onClick={clearFilters}>Xóa lọc</Button>
            <Button onClick={clearAll}>Xóa lọc và sắp xếp</Button>
          </Space>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <Space>
            <Search
              placeholder="Tìm kiếm đơn hàng lỗi..."
              allowClear
              enterButton={
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '40px'
                  }}
                >
                  Tìm kiếm
                </Button>
              }
              size="large"
              onSearch={(value) => {
                console.log("Search:", value);
              }}
              style={{ 
                width: 400,
              }}
            />
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchAllOrdersFail}
              size="large"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px'
              }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={orders}
          loading={loading}
          onChange={handleChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng lỗi`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          rowKey="orderId"
          scroll={{ x: 1200 }}
          size="middle"
          bordered
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}
        />
      </div>

      {/* Modal xem chi tiết */}
      <Modal
        title={<Text strong>Chi tiết đơn hàng lỗi {selectedOrder?.orderId}</Text>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1400}
        style={{ top: 20 }}
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
            <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <Row gutter={24}>
                <Col span={14}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Trạng thái">
                      <Tag style={getStatusStyle(selectedOrder.currentOrderStatus?.currentStatus || selectedOrder.orderStatus)}>
                        {selectedOrder.currentOrderStatus?.currentStatus || selectedOrder.orderStatus}
                      </Tag>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {selectedOrder.currentOrderStatus?.statusDescription}
                      </Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thông tin lấy hàng">
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

                    <Descriptions.Item label="Thông tin giao hàng">
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

                    <Descriptions.Item label="Chi tiết dịch vụ">
                      {selectedOrder.orderSummary?.items?.map((item, index) => (
                        <div key={index} style={{ marginBottom: 16 }}>
                          <Space direction="vertical">
                            <Text strong>{item.serviceName}</Text>
                            <Space>
                              <Text>Đơn giá: {formatCurrency(item.servicePrice)}</Text>
                              <Text>Số lượng: {item.quantity}</Text>
                              <Text>Tổng: {formatCurrency(item.subTotal)}</Text>
                            </Space>
                            {item.extras?.length > 0 && (
                              <div>
                                <Text>Dịch vụ thêm:</Text>
                                {item.extras.map((extra, idx) => (
                                  <div key={idx}>
                                    <Text>{extra.extraName} - {formatCurrency(extra.extraPrice)}</Text>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Space>
                        </div>
                      )) || (
                        <Text type="secondary">Không có thông tin chi tiết dịch vụ</Text>
                      )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Tổng tiền hàng">
                      {formatCurrency(selectedOrder.orderSummary?.estimatedTotal || selectedOrder.totalPrice)}
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
                    <Descriptions.Item label="Tổng cộng" className="total-amount">
                      <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                        {formatCurrency(selectedOrder.orderSummary?.totalPrice || selectedOrder.totalPrice)}
                      </Text>
                    </Descriptions.Item>

                    {selectedOrder.notes && (
                      <Descriptions.Item label="Ghi chú">
                        {selectedOrder.notes}
                      </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Thời gian tạo đơn">
                      {formatDateTime(selectedOrder.createdAt || selectedOrder.orderedDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cập nhật cuối">
                      {formatDateTime(selectedOrder.currentOrderStatus?.lastUpdate)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col span={10}>
                  {/* Map Section */}
                  {(selectedOrder.pickupLatitude && selectedOrder.pickupLongitude) || 
                   (selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude) ? (
                    <div style={{ height: '100%' }}>
                      <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 16 }}>
                        Bản đồ vị trí
                      </Text>
                      <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d9d9d9' }}>
                        <style>{`
                          .leaflet-container {
                            height: 500px !important;
                            width: 100% !important;
                          }
                        `}</style>
                        <MapWrapper center={[
                          selectedOrder.pickupLatitude || selectedOrder.deliveryLatitude,
                          selectedOrder.pickupLongitude || selectedOrder.deliveryLongitude
                        ]}>
                          <MapContainer
                            center={[
                              selectedOrder.pickupLatitude || selectedOrder.deliveryLatitude,
                              selectedOrder.pickupLongitude || selectedOrder.deliveryLongitude
                            ]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            whenCreated={(mapInstance) => {
                              setTimeout(() => {
                                mapInstance.invalidateSize();
                              }, 100);
                            }}
                          >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                            subdomains={['a', 'b', 'c']}
                          />
                          
                          {/* Check if pickup and delivery are at same location */}
                          {isSameLocation(selectedOrder) ? (
                            /* Combined Marker for same location */
                            <Marker 
                              position={[selectedOrder.pickupLatitude, selectedOrder.pickupLongitude]}
                              icon={combinedIcon}
                            >
                              <Popup>
                                <div style={{ maxWidth: '250px' }}>
                                  <strong style={{ color: '#722ed1' }}>📍 Địa chỉ nhận và giao hàng</strong><br />
                                  <br />
                                  <div style={{ backgroundColor: '#f0f8ff', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}>
                                    <strong style={{ color: '#1890ff' }}>📦 THÔNG TIN NHẬN HÀNG</strong><br />
                                    <strong>Người nhận:</strong> {selectedOrder.pickupName}<br />
                                    <strong>SĐT:</strong> {selectedOrder.pickupPhone}<br />
                                    <strong>Thời gian:</strong> {formatDateTime(selectedOrder.pickupTime)}<br />
                                    {selectedOrder.pickupDescription && (
                                      <>
                                        <strong>Ghi chú:</strong> {selectedOrder.pickupDescription}<br />
                                      </>
                                    )}
                                  </div>
                                  
                                  <div style={{ backgroundColor: '#f6ffed', padding: '8px', borderRadius: '4px' }}>
                                    <strong style={{ color: '#52c41a' }}>🚚 THÔNG TIN GIAO HÀNG</strong><br />
                                    <strong>Người nhận:</strong> {selectedOrder.deliveryName}<br />
                                    <strong>SĐT:</strong> {selectedOrder.deliveryPhone}<br />
                                    <strong>Thời gian:</strong> {formatDateTime(selectedOrder.deliveryTime)}<br />
                                    {selectedOrder.deliveryDescription && (
                                      <>
                                        <strong>Ghi chú:</strong> {selectedOrder.deliveryDescription}<br />
                                      </>
                                    )}
                                  </div>
                                  
                                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                    <strong>Địa chỉ:</strong> {selectedOrder.pickupAddressDetail}
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                          ) : (
                            <>
                              {/* Separate Pickup Marker */}
                              {selectedOrder.pickupLatitude && selectedOrder.pickupLongitude && (
                                <Marker 
                                  position={[selectedOrder.pickupLatitude, selectedOrder.pickupLongitude]}
                                  icon={pickupIcon}
                                >
                                  <Popup>
                                    <div style={{ maxWidth: '200px' }}>
                                      <strong style={{ color: '#1890ff' }}>📦 Địa chỉ nhận hàng</strong><br />
                                      <strong>Người nhận:</strong> {selectedOrder.pickupName}<br />
                                      <strong>SĐT:</strong> {selectedOrder.pickupPhone}<br />
                                      <strong>Địa chỉ:</strong> {selectedOrder.pickupAddressDetail}<br />
                                      <strong>Thời gian:</strong> {formatDateTime(selectedOrder.pickupTime)}<br />
                                      {selectedOrder.pickupDescription && (
                                        <>
                                          <strong>Ghi chú:</strong> {selectedOrder.pickupDescription}
                                        </>
                                      )}
                                    </div>
                                  </Popup>
                                </Marker>
                              )}

                              {/* Separate Delivery Marker */}
                              {selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude && (
                                <Marker 
                                  position={[selectedOrder.deliveryLatitude, selectedOrder.deliveryLongitude]}
                                  icon={deliveryIcon}
                                >
                                  <Popup>
                                    <div style={{ maxWidth: '200px' }}>
                                      <strong style={{ color: '#52c41a' }}>🚚 Địa chỉ giao hàng</strong><br />
                                      <strong>Người nhận:</strong> {selectedOrder.deliveryName}<br />
                                      <strong>SĐT:</strong> {selectedOrder.deliveryPhone}<br />
                                      <strong>Địa chỉ:</strong> {selectedOrder.deliveryAddressDetail}<br />
                                      <strong>Thời gian:</strong> {formatDateTime(selectedOrder.deliveryTime)}<br />
                                      {selectedOrder.deliveryDescription && (
                                        <>
                                          <strong>Ghi chú:</strong> {selectedOrder.deliveryDescription}
                                        </>
                                      )}
                                    </div>
                                  </Popup>
                                </Marker>
                              )}
                            </>
                          )}
                          </MapContainer>
                        </MapWrapper>
                        </div>
                      
                      {/* Map Legend */}
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '8px 12px', 
                        backgroundColor: '#f6f6f6', 
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        {!isSameLocation(selectedOrder) ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: '#1890ff', 
                                borderRadius: '50%' 
                              }}></div>
                              <Text type="secondary">Địa chỉ nhận hàng</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: '#52c41a', 
                                borderRadius: '50%' 
                              }}></div>
                              <Text type="secondary">Địa chỉ giao hàng</Text>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ 
                              width: '12px', 
                              height: '12px', 
                              backgroundColor: '#722ed1', 
                              borderRadius: '50%' 
                            }}></div>
                            <Text type="secondary">Địa chỉ nhận và giao hàng (cùng vị trí)</Text>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Text type="secondary">Không có thông tin tọa độ để hiển thị bản đồ</Text>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          )
        )}
      </Modal>

       {/* Modal xem lịch sử  */}
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
        ) : orderHistory && orderHistory.length > 0 ? (
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
                      <Text>{item.updatedBy?.fullName}</Text>
                      <Text type="secondary"> - </Text>
                      <Text>{item.updatedBy?.phoneNumber}</Text>
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
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Không có lịch sử cho đơn hàng này</Text>
          </div>
        )}
      </Modal>

      {/* Modal xem ảnh */}
      <Modal
        title={<Text strong>Hình ảnh đính kèm</Text>}
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsPhotoModalVisible(false)}>
            Đóng
          </Button>
        ]}
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
    </>
  );
}

export default ListAllOrdersFail; 