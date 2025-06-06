import { Table, Tag, Input, Button, Space, Tooltip, message, Modal, Descriptions, Typography, Timeline, Image, Row, Col, Avatar, Empty, List, Divider, Checkbox, InputNumber, Spin, Card } from "antd";
import React, { useEffect, useState } from "react";
import { getRequest, putRequest } from "@services/api";
import { SearchOutlined, ReloadOutlined, EyeOutlined, HistoryOutlined, CameraOutlined, EnvironmentOutlined, EditOutlined, DollarOutlined, PlusOutlined, ShoppingCartOutlined, TagOutlined, CheckCircleOutlined } from '@ant-design/icons';
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

function ListOrdersChecking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [orderHistory, setOrderHistory] = useState(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryPhotos, setSelectedHistoryPhotos] = useState([]);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Edit service states
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editingOrderItem, setEditingOrderItem] = useState(null);
  const [editServiceDetails, setEditServiceDetails] = useState(null);
  const [editSelectedExtras, setEditSelectedExtras] = useState([]);
  const [editQuantity, setEditQuantity] = useState(1);
  const [loadingEditService, setLoadingEditService] = useState(false);

  useEffect(() => {
    fetchOrdersChecking();
  }, [currentPage, pageSize]);

  const fetchOrdersChecking = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`/orders/all-orders?status=CHECKING&page=${currentPage}&pageSize=${pageSize}`);
      
              if (response) {
          // Đảm bảo data luôn là array
          const ordersData = Array.isArray(response.data.data) ? response.data.data : [];
          setOrders(ordersData);
          setTotalRecords(response.data.totalRecords || 0);
      } else {
        // Fallback nếu không có response
        setOrders([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching checking orders:", error);
      // Đảm bảo set orders thành array rỗng khi có lỗi
      setOrders([]);
      setTotalRecords(0);
      
      if (error.response) {
        message.error(`Lỗi server: ${error.response.data?.message || "Không thể tải danh sách đơn hàng"}`);
      } else if (error.request) {
        message.error("Lỗi kết nối: Không thể kết nối đến server");
      } else {
        message.error(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "orange",
      CONFIRMED: "blue", 
      SCHEDULED_PICKUP: "cyan",
      PICKEDUP: "green",
      WASHING: "purple",
      WASHED: "magenta",
      QUALITY_CHECKED: "volcano",
      CHECKING: "gold",
      DELIVERING: "geekblue",
      DELIVERED: "lime",
      COMPLETED: "green",
      CANCELLED: "red",
      COMPLAINT: "red",
    };
    return colors[status] || "default";
  };

  const getStatusStyle = (status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `var(--ant-${color}-1)`,
      borderColor: `var(--ant-${color}-3)`,
      color: `var(--ant-${color}-6)`,
    };
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
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
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : "",
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
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
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
      // Thử gọi API chi tiết đơn hàng
      const response = await getRequest(`/orders/${orderId}`);
      if (response && response.data) {
        setSelectedOrder(response.data);
      } else {
        // Fallback: sử dụng dữ liệu từ danh sách nếu API chi tiết không có
        const existingOrder = orders.find(order => order.orderId === orderId);
        if (existingOrder) {
          setSelectedOrder(existingOrder);
          message.info("Hiển thị thông tin cơ bản - chi tiết đầy đủ không có sẵn");
        }
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      // Fallback: sử dụng dữ liệu từ danh sách
      const existingOrder = orders.find(order => order.orderId === orderId);
      if (existingOrder) {
        setSelectedOrder(existingOrder);
        message.warning("Hiển thị thông tin cơ bản - không thể tải chi tiết đầy đủ");
      } else {
        if (error.response) {
          message.error(`Lỗi server: ${error.response.data?.message || "Không thể tải chi tiết đơn hàng"}`);
        } else if (error.request) {
          message.error("Lỗi kết nối: Không thể kết nối đến server");
        } else {
          message.error(`Lỗi: ${error.message}`);
        }
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
      return "Chưa có thông tin";
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Chưa có thông tin";
    }
    
    return date.toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "Chưa có thông tin";
    }
    return amount.toLocaleString('vi-VN') + ' VND';
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
      } else if (error.response) {
        message.error(`Lỗi server: ${error.response.data?.message || "Không thể tải lịch sử đơn hàng"}`);
      } else if (error.request) {
        message.error("Lỗi kết nối: Không thể kết nối đến server");
      } else {
        message.error(`Lỗi: ${error.message}`);
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
      CHECKING: 'gold',
      DELIVERING: 'geekblue',
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
      if (error.response) {
        message.error(`Lỗi server: ${error.response.data?.message || "Không thể tải ảnh lịch sử"}`);
      } else if (error.request) {
        message.error("Lỗi kết nối: Không thể kết nối đến server");
      } else {
        message.error(`Lỗi: ${error.message}`);
      }
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

  // Edit service functions
  const handleEditService = async (orderItem) => {
    console.log("Editing order item:", orderItem);
    setEditingOrderItem(orderItem);
    setEditQuantity(orderItem.quantity);
    // Use extraIds from extras array
    setEditSelectedExtras(orderItem.extras?.map(extra => extra.orderextraId) || []);
    setIsEditServiceModalOpen(true);
    
    // Try to find service details
    await findAndFetchServiceDetails(orderItem);
  };

  const findAndFetchServiceDetails = async (orderItem) => {
    try {
      setLoadingEditService(true);
      // First get all categories
      const categoriesResponse = await getRequest("/categories");
      
      if (!categoriesResponse.data) {
        throw new Error("Không thể tải danh sách danh mục");
      }

      let foundServiceId = null;
      
      // Search through all categories and subcategories
      for (const category of categoriesResponse.data) {
        const subCategoriesResponse = await getRequest(`/categories/${category.categoryId}`);
        if (subCategoriesResponse.data && subCategoriesResponse.data.subCategories) {
          for (const subCategory of subCategoriesResponse.data.subCategories) {
            if (subCategory.serviceDetails) {
              const matchingService = subCategory.serviceDetails.find(service => 
                service.name === orderItem.serviceName && service.price === orderItem.servicePrice
              );
              if (matchingService) {
                foundServiceId = matchingService.serviceId;
                break;
              }
            }
          }
        }
        if (foundServiceId) break;
      }
      
      if (foundServiceId) {
        // Get the full service details with extras
        const serviceDetailsResponse = await getRequest(`/service-details/${foundServiceId}`);
        if (!serviceDetailsResponse.data) {
          throw new Error("Không thể tải chi tiết dịch vụ");
        }

        setEditServiceDetails(serviceDetailsResponse.data);
        
        // Map current orderextraId to extraId by matching names and prices
        const mappedExtraIds = [];
        if (orderItem.extras && serviceDetailsResponse.data.extraCategories) {
          orderItem.extras.forEach(orderExtra => {
            serviceDetailsResponse.data.extraCategories.forEach(category => {
              category.extras.forEach(serviceExtra => {
                if (serviceExtra.name === orderExtra.extraName && 
                    serviceExtra.price === orderExtra.extraPrice) {
                  mappedExtraIds.push(serviceExtra.extraId);
                }
              });
            });
          });
        }
        setEditSelectedExtras(mappedExtraIds);
      } else {
        message.warning("Không tìm thấy thông tin chi tiết dịch vụ. Hiển thị thông tin cơ bản.");
        // Fallback to basic info if service not found
        setEditServiceDetails({
          name: orderItem.serviceName,
          price: orderItem.servicePrice,
          imageUrl: null,
          description: null,
          extraCategories: []
        });
      }
    } catch (error) {
      console.error("Error finding service details:", error);
      message.error(`Lỗi khi tải thông tin dịch vụ: ${error.message || 'Lỗi không xác định'}`);
      
      // Fallback to basic info
      setEditServiceDetails({
        name: orderItem.serviceName,
        price: orderItem.servicePrice,
        imageUrl: null,
        description: null,
        extraCategories: []
      });
    } finally {
      setLoadingEditService(false);
    }
  };

  const handleEditExtraToggle = (extraId) => {
    setEditSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const calculateEditTotalPrice = () => {
    if (!editingOrderItem || !editServiceDetails) return 0;
    
    let total = editingOrderItem.servicePrice * editQuantity;
    
    // Add selected extras price from service details
    if (editServiceDetails.extraCategories) {
      editServiceDetails.extraCategories.forEach(category => {
        category.extras.forEach(extra => {
          if (editSelectedExtras.includes(extra.extraId)) {
            total += extra.price * editQuantity;
          }
        });
      });
    }
    
    return total;
  };

  const handleSubmitEditService = async () => {
    try {
      setLoadingEditService(true);
      
      if (!editingOrderItem || !editingOrderItem.orderitemId) {
        throw new Error("Thông tin đơn hàng không hợp lệ");
      }

      if (editQuantity <= 0) {
        throw new Error("Số lượng phải lớn hơn 0");
      }

      const payload = {
        orderItemId: editingOrderItem.orderitemId,
        quantity: editQuantity,
        extraIds: editSelectedExtras
      };
      
      console.log("Update payload:", payload);
      
      const response = await putRequest(`customer-staff/order/update-order`, payload);
      
      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      message.success("Cập nhật dịch vụ thành công!");
      setIsEditServiceModalOpen(false);
      
      // Refresh order details
      if (selectedOrder) {
        const updatedResponse = await getRequest(`/orders/${selectedOrder.orderId}`);
        if (updatedResponse.data) {
          setSelectedOrder(updatedResponse.data);
        }
      }
      
      // Refresh orders list
      fetchOrdersChecking();
    } catch (error) {
      console.error("Error updating service:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Lỗi từ server';
        message.error(`Không thể cập nhật dịch vụ: ${errorMessage}`);
      } else if (error.request) {
        message.error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        message.error(`Lỗi cập nhật dịch vụ: ${error.message || 'Lỗi không xác định'}`);
      }
    } finally {
      setLoadingEditService(false);
    }
  };

  const handleCloseEditServiceModal = () => {
    setIsEditServiceModalOpen(false);
    setEditingOrderItem(null);
    setEditServiceDetails(null);
    setEditSelectedExtras([]);
    setEditQuantity(1);
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
          backgroundColor: '#fff7e6', 
          color: '#d46b08',
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
          color: '#d46b08'
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
              backgroundColor: "#faad14", 
              width: "6px", 
              height: "28px", 
              marginRight: "12px",
              borderRadius: "3px" 
            }}></div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "24px",
              fontWeight: "600",
              background: "linear-gradient(90deg, #faad14, #ffc53d)", 
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}>Đơn hàng đang nhận kiểm tra</h2>
          </div>
          <Space>
            <Button onClick={clearFilters}>Xóa lọc</Button>
            <Button onClick={clearAll}>Xóa lọc và sắp xếp</Button>
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="Tìm kiếm đơn hàng..."
              allowClear
              enterButton={
                <Button type="primary" icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
              }
              size="large"
              onSearch={(value) => console.log("Search:", value)}
              style={{ 
                width: 400,
              }}
            />
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchOrdersChecking}
              size="large"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                backgroundColor: '#fff7e6',
                borderColor: '#faad14',
                color: '#d46b08',
                fontWeight: 500
              }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={Array.isArray(orders) ? orders : []}
          loading={loading}
          onChange={handleChange}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng đang kiểm tra`,
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
        title={<Text strong>Chi tiết đơn hàng đang kiểm tra {selectedOrder?.orderId}</Text>}
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
                        <div key={index} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: '16px' }}>{item.serviceName}</Text>
                              <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEditService(item)}
                                style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                              >
                                Chỉnh sửa
                              </Button>
                            </div>
                            <Space wrap>
                              <Text>Đơn giá: <Text strong style={{ color: '#faad14' }}>{formatCurrency(item.servicePrice)}</Text></Text>
                              <Text>Số lượng: <Text strong>{item.quantity}</Text></Text>
                              <Text>Tổng: <Text strong style={{ color: '#52c41a' }}>{formatCurrency(item.subTotal)}</Text></Text>
                            </Space>
                            {item.extras?.length > 0 && (
                              <div>
                                <Text style={{ fontWeight: 500 }}>Dịch vụ thêm:</Text>
                                <div style={{ marginTop: 4 }}>
                                  {item.extras.map((extra, idx) => (
                                    <Tag key={idx} color="blue" style={{ margin: '2px' }}>
                                      {extra.extraName} (+{formatCurrency(extra.extraPrice)})
                                    </Tag>
                                  ))}
                                </div>
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
                      <Text strong style={{ fontSize: '16px', color: '#faad14' }}>
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

      {/* Modal Edit Service - Enhanced UI */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'linear-gradient(90deg, #faad14, #ffc53d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #faad14, #ffc53d)',
              borderRadius: '50%',
              padding: '8px',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)'
            }}>
              <EditOutlined style={{ color: 'white', fontSize: '16px' }} />
            </div>
            <span>Chỉnh sửa dịch vụ</span>
          </div>
        }
        open={isEditServiceModalOpen}
        onCancel={handleCloseEditServiceModal}
        width={900}
        style={{ top: 20 }}
        bodyStyle={{ 
          padding: '24px',
          background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)',
          borderRadius: '0 0 12px 12px'
        }}
        footer={[
          <div key="footer" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px 24px',
            background: 'linear-gradient(90deg, #f6f6f6, #fafafa)',
            borderRadius: '0 0 12px 12px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button
              size="large"
              onClick={handleCloseEditServiceModal}
              style={{
                borderRadius: '8px',
                height: '44px',
                paddingLeft: '24px',
                paddingRight: '24px',
                fontWeight: '500'
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loadingEditService}
              onClick={handleSubmitEditService}
              icon={<CheckCircleOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #faad14, #ffc53d)',
                border: 'none',
                borderRadius: '8px',
                height: '44px',
                paddingLeft: '32px',
                paddingRight: '32px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Cập nhật dịch vụ
            </Button>
          </div>
        ]}
        destroyOnClose
      >
        {loadingEditService ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)',
            borderRadius: '12px'
          }}>
            <Spin size="large" tip="Đang tải thông tin dịch vụ..." />
          </div>
        ) : editingOrderItem && editServiceDetails ? (
          <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
            {/* Service Info Card */}
            <Card
              style={{ 
                marginBottom: 20,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #fff9e6 0%, #fefbf3 100%)',
                border: '2px solid #faad14',
                boxShadow: '0 6px 20px rgba(250, 173, 20, 0.15)'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #faad14, #ffc53d)',
                  borderRadius: '50%',
                  padding: '10px',
                  marginRight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingCartOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: '20px', color: '#d46b08', display: 'block' }}>
                    {editServiceDetails.name}
                  </Text>
                  <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                    Dịch vụ chính
                  </Text>
                </div>
              </div>
              <div style={{ 
                background: 'linear-gradient(90deg, #ffffff, #fff9e6)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #ffd666'
              }}>
                <Text strong style={{ fontSize: '18px' }}>
                  Giá dịch vụ: <Text style={{ color: '#faad14', fontSize: '20px' }}>{formatCurrency(editServiceDetails.price)}</Text>
                </Text>
                {editServiceDetails.description && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>{editServiceDetails.description}</Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Current Selection Info Card */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TagOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  <span style={{ color: '#1890ff' }}>Thông tin hiện tại</span>
                </div>
              }
              style={{ 
                marginBottom: 20,
                borderRadius: '12px',
                border: '1px solid #91d5ff'
              }}
              bodyStyle={{ padding: '20px' }}
              headStyle={{ 
                background: 'linear-gradient(135deg, #e6f7ff, #f0f9ff)',
                borderRadius: '12px 12px 0 0'
              }}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f6f6f6', borderRadius: '8px' }}>
                    <Text type="secondary">Số lượng</Text>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {editingOrderItem.quantity}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f6f6f6', borderRadius: '8px' }}>
                    <Text type="secondary">Dịch vụ thêm</Text>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      {editingOrderItem.extras?.length || 0}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '12px', background: '#f6f6f6', borderRadius: '8px' }}>
                    <Text type="secondary">Tổng tiền</Text>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                      {formatCurrency(editingOrderItem.subTotal)}
                    </div>
                  </div>
                </Col>
              </Row>
              {editingOrderItem.extras && editingOrderItem.extras.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
                  <Text strong style={{ color: '#1890ff', marginBottom: 8, display: 'block' }}>
                    Dịch vụ bổ sung hiện tại:
                  </Text>
                  <div>
                    {editingOrderItem.extras.map((extra, idx) => (
                      <Tag key={idx} color="processing" style={{ margin: '2px', padding: '4px 8px', borderRadius: '6px' }}>
                        {extra.extraName} (+{formatCurrency(extra.extraPrice)})
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Available Extras Card */}
            {editServiceDetails && editServiceDetails.extraCategories && editServiceDetails.extraCategories.length > 0 && (
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PlusOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                    <span style={{ color: '#722ed1' }}>Tất cả dịch vụ bổ sung</span>
                  </div>
                }
                style={{ 
                  marginBottom: 20,
                  borderRadius: '12px',
                  border: '1px solid #d3adf7'
                }}
                bodyStyle={{ padding: '20px' }}
                headStyle={{ 
                  background: 'linear-gradient(135deg, #f9f0ff, #fafafa)',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                {editServiceDetails.extraCategories.map(category => (
                  <div key={category.extraCategoryId} style={{ marginBottom: 20 }}>
                    <div style={{
                      background: 'linear-gradient(90deg, #722ed1, #9254de)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      marginBottom: 12,
                      fontWeight: 'bold'
                    }}>
                      {category.categoryName}
                    </div>
                    <Row gutter={[12, 12]}>
                      {category.extras.map(extra => (
                        <Col span={24} key={extra.extraId}>
                          <div style={{
                            padding: '12px',
                            background: editSelectedExtras.includes(extra.extraId) 
                              ? 'linear-gradient(135deg, #f6ffed, #f0f9ff)' 
                              : '#fafafa',
                            border: editSelectedExtras.includes(extra.extraId) 
                              ? '2px solid #52c41a' 
                              : '1px solid #d9d9d9',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}>
                            <Checkbox
                              checked={editSelectedExtras.includes(extra.extraId)}
                              onChange={() => handleEditExtraToggle(extra.extraId)}
                              style={{ width: '100%' }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                width: '100%'
                              }}>
                                <span style={{ fontWeight: '500' }}>{extra.name}</span>
                                <Text strong style={{ 
                                  color: editSelectedExtras.includes(extra.extraId) ? '#52c41a' : '#faad14',
                                  fontSize: '16px'
                                }}>
                                  +{formatCurrency(extra.price)}
                                </Text>
                              </div>
                            </Checkbox>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </Card>
            )}

            {/* Quantity Card */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TagOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  <span style={{ color: '#fa8c16' }}>Số lượng</span>
                </div>
              }
              style={{ 
                marginBottom: 20,
                borderRadius: '12px',
                border: '1px solid #ffd591'
              }}
              bodyStyle={{ padding: '20px' }}
              headStyle={{ 
                background: 'linear-gradient(135deg, #fff7e6, #fafafa)',
                borderRadius: '12px 12px 0 0'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <InputNumber
                  min={1}
                  value={editQuantity}
                  onChange={(value) => setEditQuantity(value || 1)}
                  style={{ 
                    width: '200px', 
                    fontSize: '18px',
                    borderRadius: '8px'
                  }}
                  size="large"
                />
              </div>
            </Card>

            {/* Total Price Card */}
            <Card
              style={{ 
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                border: '2px solid #52c41a',
                boxShadow: '0 6px 20px rgba(82, 196, 26, 0.15)'
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                </div>
                <Text style={{ fontSize: '18px', color: '#595959', display: 'block', marginBottom: 8 }}>
                  Tổng cộng sau chỉnh sửa
                </Text>
                <Text strong style={{ 
                  fontSize: '32px', 
                  color: '#52c41a',
                  background: 'linear-gradient(90deg, #52c41a, #73d13d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'block'
                }}>
                  {formatCurrency(calculateEditTotalPrice())}
                </Text>
              </div>
            </Card>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default ListOrdersChecking; 