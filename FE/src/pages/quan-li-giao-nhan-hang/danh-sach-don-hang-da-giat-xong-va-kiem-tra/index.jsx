import { Table, Tag, Input, Button, Space, Tooltip, message, Modal, Descriptions, Typography, Timeline, Image, Popconfirm, Row, Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { getRequest, getRequestParams, deleteRequest, postRequest } from "@services/api";
import { SearchOutlined, ReloadOutlined, EyeOutlined, FilterFilled, EnvironmentOutlined, HistoryOutlined, CameraOutlined, DeleteOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { axiosClientVer2 } from '../../../config/axiosInterceptor';
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

// Create custom colored SVG icons for pickup and delivery
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

// Combined icon for same location pickup and delivery
const combinedIcon = new L.Icon({
  iconUrl: createColoredMarkerSVG('#722ed1'),
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const { Search, TextArea } = Input;
const { Text } = Typography;

// MapWrapper component to handle map rendering issues
const MapWrapper = ({ children, ...props }) => {
  const [mapKey, setMapKey] = React.useState(0);
  
  React.useEffect(() => {
    // Force re-render when modal opens
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

function ListOrdersQualityChecked() {
  const [orders, setOrders] = useState([]);

  // Function to check if pickup and delivery locations are the same
  const isSameLocation = (order) => {
    if (!order.pickupLatitude || !order.pickupLongitude || 
        !order.deliveryLatitude || !order.deliveryLongitude) {
      return false;
    }
    
    // Check if coordinates are exactly the same or very close (within 0.001 degrees)
    const latDiff = Math.abs(order.pickupLatitude - order.deliveryLatitude);
    const lngDiff = Math.abs(order.pickupLongitude - order.deliveryLongitude);
    
    return latDiff < 0.001 && lngDiff < 0.001;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
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

  // Payment states
  const [isCashPaymentModalVisible, setIsCashPaymentModalVisible] = useState(false);
  const [isOnlinePaymentModalVisible, setIsOnlinePaymentModalVisible] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [cashPaymentLoading, setCashPaymentLoading] = useState(false);
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState(false);
  const [cashPaymentForm] = Form.useForm();
  const [onlinePaymentForm] = Form.useForm();

  useEffect(() => {
    fetchQualityCheckedOrders();
  }, [currentPage, pageSize]);

  const fetchQualityCheckedOrders = async () => {
    setLoading(true);
    try {
      const params = {
        status: 'QUALITY_CHECKED',
        page: currentPage,
        pageSize: pageSize,
      };
      const response = await getRequestParams("orders/all-orders", params);
      console.log("Quality checked orders response: ", response);

      if (response && response.data) {
        setOrders(response.data.data || []);
        setTotalRecords(response.data.totalRecords || 0);
      }
    } catch (error) {
      console.error("Error fetching quality checked orders:", error);
      message.error("Không thể tải danh sách đơn hàng đã kiểm tra chất lượng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      SCHEDULED_PICKUP: "#1890ff",
      CANCELLED: "#ff4d4f",
      PENDING: "#faad14",
      WASHING: "#13c2c2",
      PICKEDUP: "#52c41a",
      WASHED: "#722ed1",
      QUALITY_CHECKED: "#52c41a",
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
    setSearchedColumn(dataIndex);
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
          <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

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

  const fetchOrderDetail = async (orderId) => {
    try {
      setIsLoadingDetail(true);
      const response = await getRequest(`/orders/${orderId}`);
      console.log("Order detail response:", response);
      
      if (response && response.data) {
        console.log("Order detail data:", response.data);
        setSelectedOrder(response.data);
      } else {
        const existingOrder = orders.find(order => order.orderId === orderId);
        console.log("Using existing order:", existingOrder);
        if (existingOrder) {
          setSelectedOrder(existingOrder);
          message.info("Hiển thị thông tin cơ bản - chi tiết đầy đủ không có sẵn");
        }
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      const existingOrder = orders.find(order => order.orderId === orderId);
      console.log("Fallback to existing order:", existingOrder);
      if (existingOrder) {
        setSelectedOrder(existingOrder);
        message.warning("Hiển thị thông tin cơ bản - không thể tải chi tiết đầy đủ");
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
    if (!dateString || dateString === 'Invalid Date') {
      return 'Chưa có thông tin';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      return date.toLocaleString('vi-VN');
    } catch (error) {
      return 'Lỗi hiển thị ngày';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) {
      return '0 ₫';
    }
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    } catch (error) {
      return `${amount} ₫`;
    }
  };

  const fetchOrderHistory = async (orderId) => {
    try {
      setIsLoadingHistory(true);
      const response = await getRequest(`/orders/history/${orderId}`);
      console.log("Order history response:", response);
      
      if (response && response.data) {
        console.log("Order history data:", response.data);
        setOrderHistory(response.data);
      } else {
        console.log("No order history data received");
        setOrderHistory([]);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      message.error("Không thể tải lịch sử đơn hàng");
      setOrderHistory([]);
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
      QUALITY_CHECKED: 'green',
      DELIVERING: 'geekblue',
      DELIVERED: 'lime',
      COMPLETED: 'green',
      CANCELLED: 'red',
      COMPLAINT: 'red',
      ARRIVED: 'cyan',
      CHECKING: 'orange',
      CHECKED: 'blue',
      UNKNOWN: 'gray',
    };
    return colors[status] || 'gray';
  };

  const fetchHistoryPhotos = async (statusHistoryId) => {
    try {
      setLoadingPhotos(true);
      const response = await getRequest(`/photos/?statusHistoryId=${statusHistoryId}`);
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

  // Payment functions
  const handleCashPayment = (order) => {
    setSelectedOrderForPayment(order);
    setIsCashPaymentModalVisible(true);
    cashPaymentForm.resetFields();
  };

  const handleOnlinePayment = (order) => {
    setSelectedOrderForPayment(order);
    setIsOnlinePaymentModalVisible(true);
    onlinePaymentForm.setFieldsValue({
      orderId: order.orderId,
      description: `Thanh toán đơn hàng ${order.orderId}`
    });
  };

  const confirmCashPayment = async (values) => {
    try {
      setCashPaymentLoading(true);
      
      // Tạo query parameters
      const queryParams = new URLSearchParams({
        orderId: selectedOrderForPayment.orderId,
        notes: values.notes || ''
      });
      
      const response = await postRequest(`/customer-staff/order/confirm-complete?${queryParams.toString()}`, {});
      
      if (response) {
        message.success('Xác nhận thanh toán tiền mặt thành công!');
        setIsCashPaymentModalVisible(false);
        fetchQualityCheckedOrders(); // Refresh list
      }
    } catch (error) {
      console.error('Error confirming cash payment:', error);
      message.error('Không thể xác nhận thanh toán tiền mặt');
    } finally {
      setCashPaymentLoading(false);
    }
  };

  const createOnlinePaymentLink = async (values) => {
    try {
      setOnlinePaymentLoading(true);
      const payload = {
        orderId: values.orderId,
        description: values.description
      };
      
      const response = await postRequest('/payments/payos/link', payload);
      
      if (response && response.data && response.data.checkoutUrl) {
        message.success('Tạo link thanh toán thành công!');
        window.open(response.data.checkoutUrl, '_blank');
        setIsOnlinePaymentModalVisible(false);
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      message.error(error.response.data.message);
    } finally {
      setOnlinePaymentLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      fixed: 'left',
      ...getColumnSearchProps('orderId'),
      render: (orderId) => (
        <Text code style={{ fontSize: '13px', fontWeight: 'bold', color: '#1890ff' }}>
          {orderId}
        </Text>
      ),
    },
    {
      title: 'Tên đơn hàng',
      dataIndex: 'orderName',
      key: 'orderName',
      width: 200,
      ...getColumnSearchProps('orderName'),
      render: (name) => (
        <Text style={{ fontWeight: 500 }}>{name}</Text>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 130,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      sortOrder: sortedInfo.columnKey === 'totalPrice' && sortedInfo.order,
      render: (price) => (
        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 140,
      filters: [
        { text: 'QUALITY_CHECKED', value: 'QUALITY_CHECKED' },
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
      title: 'Ngày đặt hàng',
      dataIndex: 'orderedDate',
      key: 'orderedDate',
      width: 160,
      sorter: (a, b) => new Date(a.orderedDate) - new Date(b.orderedDate),
      sortOrder: sortedInfo.columnKey === 'orderedDate' && sortedInfo.order,
      render: (date) => (
        <Text style={{ fontSize: '13px' }}>{formatDateTime(date)}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record.orderId)}
              style={{ minWidth: '36px' }}
            />
          </Tooltip>
          <Tooltip title="Xem lịch sử">
            <Button
              type="default"
              icon={<HistoryOutlined />}
              size="small"
              onClick={() => handleViewHistory(record.orderId)}
              style={{ minWidth: '36px' }}
            />
          </Tooltip>
          <Tooltip title="Thanh toán tiền mặt">
            <Button
              type="primary"
              icon={<DollarOutlined />}
              size="small"
              onClick={() => handleCashPayment(record)}
              style={{ 
                backgroundColor: '#52c41a', 
                borderColor: '#52c41a',
                minWidth: '36px'
              }}
            />
          </Tooltip>
          <Tooltip title="Thanh toán trực tuyến">
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              size="small"
              onClick={() => handleOnlinePayment(record)}
              style={{ 
                backgroundColor: '#722ed1', 
                borderColor: '#722ed1',
                minWidth: '36px'
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1890ff' }}>Danh sách đơn hàng đã giặt xong và kiểm tra chất lượng</h2>
          <Text type="secondary">Quản lý các đơn hàng đã hoàn thành kiểm tra chất lượng</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchQualityCheckedOrders}>
            Làm mới
          </Button>
        </Space>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <Button onClick={clearFilters}>Xóa bộ lọc</Button>
            <Button onClick={clearAll}>Xóa bộ lọc và sắp xếp</Button>
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
              `${range[0]}-${range[1]} của ${total} đơn hàng đã kiểm tra chất lượng`,
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

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng: ${selectedOrder?.orderId || ''}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={null}
        loading={isLoadingDetail}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Mã đơn hàng">{selectedOrder.orderId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedOrder.pickupName || 'Chưa có tên'}</Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {formatCurrency(selectedOrder.orderSummary?.totalPrice || selectedOrder.totalPrice)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag style={getStatusStyle(selectedOrder.currentOrderStatus?.currentStatus || selectedOrder.orderStatus || 'UNKNOWN')}>
                  {selectedOrder.currentOrderStatus?.currentStatus || selectedOrder.orderStatus || 'Không xác định'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo đơn">{formatDateTime(selectedOrder.createdAt || selectedOrder.orderedDate)}</Descriptions.Item>
              <Descriptions.Item label="Số lượng dịch vụ">
                {selectedOrder.orderSummary?.items?.length || selectedOrder.serviceCount || 0}
              </Descriptions.Item>
            </Descriptions>

            {/* Thông tin liên hệ */}
            <Descriptions title="Thông tin liên hệ" bordered column={2} style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Tên người nhận">{selectedOrder.pickupName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedOrder.pickupPhone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ nhận hàng" span={2}>
                {selectedOrder.pickupAddressDetail || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Tên người giao">{selectedOrder.deliveryName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="SĐT người giao">{selectedOrder.deliveryPhone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                {selectedOrder.deliveryAddressDetail || 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* Thông tin thời gian */}
            <Descriptions title="Thông tin thời gian" bordered column={2} style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Thời gian nhận hàng">
                {formatDateTime(selectedOrder.pickupTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian giao hàng">
                {formatDateTime(selectedOrder.deliveryTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDateTime(selectedOrder.currentOrderStatus?.lastUpdate)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedOrder.notes || selectedOrder.currentOrderStatus?.statusDescription || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>

            {/* Chi tiết đơn hàng */}
            {selectedOrder.orderSummary && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Chi tiết đơn hàng</h4>
                <Descriptions bordered column={1}>
                  {selectedOrder.orderSummary.items?.map((item, index) => (
                    <Descriptions.Item 
                      key={index} 
                      label={`Dịch vụ ${index + 1}: ${item.serviceName || 'N/A'}`}
                    >
                      <div>
                        <div>Số lượng: {item.quantity || 0}</div>
                        <div>Giá: {formatCurrency(item.servicePrice || 0)}</div>
                        <div>Thành tiền: {formatCurrency(item.subTotal || 0)}</div>
                        {item.extras && item.extras.length > 0 && (
                          <div>Dịch vụ thêm: {item.extras.map(extra => extra.name || extra).join(', ')}</div>
                        )}
                      </div>
                    </Descriptions.Item>
                  ))}
                  <Descriptions.Item label="Tạm tính">
                    {formatCurrency(selectedOrder.orderSummary.estimatedTotal || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phí vận chuyển">
                    {formatCurrency(selectedOrder.orderSummary.shippingFee || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giảm giá vận chuyển">
                    {formatCurrency(selectedOrder.orderSummary.shippingDiscount || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giảm giá">
                    {formatCurrency(selectedOrder.orderSummary.discount || 0)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng cộng">
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                      {formatCurrency(selectedOrder.orderSummary.totalPrice || 0)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* Location Map */}
            {(selectedOrder.pickupLatitude && selectedOrder.pickupLongitude) && (
              <div style={{ marginTop: '24px' }}>
                <h4>Vị trí nhận và giao hàng</h4>
                <div style={{ height: '300px', width: '100%' }}>
                  <MapWrapper center={[selectedOrder.pickupLatitude, selectedOrder.pickupLongitude]}>
                    <MapContainer
                      center={[selectedOrder.pickupLatitude, selectedOrder.pickupLongitude]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      
                      {/* Pickup marker */}
                      <Marker 
                        position={[selectedOrder.pickupLatitude, selectedOrder.pickupLongitude]} 
                        icon={isSameLocation(selectedOrder) ? combinedIcon : pickupIcon}
                      >
                        <Popup>
                          <div>
                            <strong>📍 Điểm nhận hàng</strong><br/>
                            <strong>Tên:</strong> {selectedOrder.pickupName}<br/>
                            <strong>SĐT:</strong> {selectedOrder.pickupPhone}<br/>
                            <strong>Địa chỉ:</strong> {selectedOrder.pickupAddressDetail}<br/>
                            {selectedOrder.pickupDescription && (
                              <><strong>Mô tả:</strong> {selectedOrder.pickupDescription}<br/></>
                            )}
                            {isSameLocation(selectedOrder) && (
                              <>
                                <br/><strong>🚚 Điểm giao hàng</strong><br/>
                                <strong>Tên:</strong> {selectedOrder.deliveryName}<br/>
                                <strong>SĐT:</strong> {selectedOrder.deliveryPhone}<br/>
                                <strong>Địa chỉ:</strong> {selectedOrder.deliveryAddressDetail}
                              </>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                      
                      {/* Delivery marker - only if different from pickup */}
                      {!isSameLocation(selectedOrder) && selectedOrder.deliveryLatitude && selectedOrder.deliveryLongitude && (
                        <Marker 
                          position={[selectedOrder.deliveryLatitude, selectedOrder.deliveryLongitude]} 
                          icon={deliveryIcon}
                        >
                          <Popup>
                            <div>
                              <strong>🚚 Điểm giao hàng</strong><br/>
                              <strong>Tên:</strong> {selectedOrder.deliveryName}<br/>
                              <strong>SĐT:</strong> {selectedOrder.deliveryPhone}<br/>
                              <strong>Địa chỉ:</strong> {selectedOrder.deliveryAddressDetail}<br/>
                              {selectedOrder.deliveryDescription && (
                                <><strong>Mô tả:</strong> {selectedOrder.deliveryDescription}</>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </MapWrapper>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        title={`Lịch sử đơn hàng: ${selectedOrder?.orderId || ''}`}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={800}
        footer={null}
        loading={isLoadingHistory}
      >
        {orderHistory && Array.isArray(orderHistory) && orderHistory.length > 0 ? (
          <Timeline mode="left">
            {orderHistory.map((item, index) => (
              <Timeline.Item
                key={index}
                color={getTimelineItemColor(item.status || 'UNKNOWN')}
                label={formatDateTime(item.createdAt || item.dateCreated || item.date)}
              >
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <Tag color={getTimelineItemColor(item.status || 'UNKNOWN')} style={{ marginBottom: '4px' }}>
                      {item.status || 'Trạng thái không xác định'}
                    </Tag>
                    {item.isFail && (
                      <Tag color="red" style={{ marginLeft: '4px' }}>
                        LỖI
                      </Tag>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <Text>{item.statusDescription || 'Không có mô tả'}</Text>
                  </div>

                  {item.notes && (
                    <div style={{ marginBottom: '8px', color: '#666' }}>
                      <Text type="secondary">
                        <strong>Ghi chú:</strong> {item.notes}
                      </Text>
                    </div>
                  )}

                  {item.updatedBy && (
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>
                      <Text type="secondary">
                        Cập nhật bởi: <strong>{item.updatedBy.fullName}</strong> ({item.updatedBy.phoneNumber})
                      </Text>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {item.containMedia && item.statusHistoryId && (
                      <Button
                        type="link"
                        size="small"
                        icon={<CameraOutlined />}
                        onClick={() => fetchHistoryPhotos(item.statusHistoryId)}
                        loading={loadingPhotos}
                        style={{ padding: 0 }}
                      >
                        Xem ảnh ({item.containMedia ? 'Có ảnh' : 'Không có ảnh'})
                      </Button>
                    )}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Không có lịch sử đơn hàng</Text>
          </div>
        )}
      </Modal>

      {/* Photos Modal */}
      <Modal
        title="Ảnh lịch sử"
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        width={800}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          {selectedHistoryPhotos.map((photo, index) => (
            <Col span={8} key={index}>
              <Image
                src={photo.photoUrl}
                alt={`Photo ${index + 1}`}
                style={{ width: '100%', borderRadius: '8px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                preview={{
                  src: photo.photoUrl,
                }}
              />
            </Col>
          ))}
        </Row>
        {selectedHistoryPhotos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Không có ảnh nào</Text>
          </div>
        )}
      </Modal>

      {/* Cash Payment Modal */}
      <Modal
        title={`Xác nhận thanh toán tiền mặt - ${selectedOrderForPayment?.orderId || ''}`}
        open={isCashPaymentModalVisible}
        onCancel={() => setIsCashPaymentModalVisible(false)}
        width={600}
        footer={null}
      >
        <Form
          form={cashPaymentForm}
          layout="vertical"
          onFinish={confirmCashPayment}
        >
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
            <Text strong>Đơn hàng: </Text>
            <Text code>{selectedOrderForPayment?.orderId}</Text>
            <br />
            <Text strong>Tổng tiền: </Text>
            <Text style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
              {formatCurrency(selectedOrderForPayment?.orderSummary?.totalPrice || selectedOrderForPayment?.totalPrice)}
            </Text>
          </div>

          <Form.Item
            label="Ghi chú (tùy chọn)"
            name="notes"
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về thanh toán..."
              maxLength={500}
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCashPaymentModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={cashPaymentLoading}
                icon={<DollarOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Xác nhận thanh toán tiền mặt
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Online Payment Modal */}
      <Modal
        title={`Tạo link thanh toán trực tuyến - ${selectedOrderForPayment?.orderId || ''}`}
        open={isOnlinePaymentModalVisible}
        onCancel={() => setIsOnlinePaymentModalVisible(false)}
        width={600}
        footer={null}
      >
        <Form
          form={onlinePaymentForm}
          layout="vertical"
          onFinish={createOnlinePaymentLink}
        >
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: '6px' }}>
            <Text strong>Đơn hàng: </Text>
            <Text code>{selectedOrderForPayment?.orderId}</Text>
            <br />
            <Text strong>Tổng tiền: </Text>
            <Text style={{ color: '#722ed1', fontSize: '16px', fontWeight: 'bold' }}>
              {formatCurrency(selectedOrderForPayment?.orderSummary?.totalPrice || selectedOrderForPayment?.totalPrice)}
            </Text>
          </div>

          <Form.Item
            label="Mã đơn hàng"
            name="orderId"
            rules={[{ required: true, message: 'Mã đơn hàng là bắt buộc!' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Mô tả thanh toán"
            name="description"
            rules={[{ required: true, message: 'Mô tả là bắt buộc!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Mô tả về thanh toán..."
              maxLength={200}
            />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsOnlinePaymentModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={onlinePaymentLoading}
                icon={<CreditCardOutlined />}
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              >
                Tạo link thanh toán
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default ListOrdersQualityChecked; 