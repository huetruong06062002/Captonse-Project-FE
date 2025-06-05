import React, { useState, useEffect } from "react";
import { Drawer, Button, List, Typography, Descriptions, Divider, Card, Row, Col, Avatar, Alert, Empty, Result, Spin, Tag, InputNumber, Space, Input, Modal, Steps, Checkbox, Image } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";
import { getRequest, postRequest, postRequestParams } from '@services/api';
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
import { 
  FileTextOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  CalculatorOutlined, 
  GiftOutlined, 
  TagOutlined, 
  PercentageOutlined, 
  BarsOutlined, 
  MessageOutlined,
  DollarOutlined,
  CarOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import { message } from "antd";

const { Title, Text } = Typography;


function OrderDetailDrawer(props) {

  const { orderId, assignmentId, visible, onClose } = props;

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editOtherPrice, setEditOtherPrice] = useState(0);
  const [editOtherPriceNote, setEditOtherPriceNote] = useState("");
  
  // Add to cart states
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingAddToCart, setLoadingAddToCart] = useState(false);

  // Lấy thông tin chi tiết đơn hàng từ API khi drawer được mở
  useEffect(() => {
          if (orderId) {
        const fetchOrderDetails = async () => {
          setLoading(true);
          try {
            const response = await getRequest(`/orders/${orderId}`);
            console.log("Order details response:", response);
            setOrderDetails(response.data);
            // Set initial values for editing
            if (response.data?.orderSummary) {
              setEditOtherPrice(response.data.orderSummary.otherprice || 0);
              setEditOtherPriceNote(response.data.orderSummary.otherPriceNote || "");
            }
          } catch (error) {
            console.error("Error fetching order details:", error);
            message.error("Không thể tải thông tin đơn hàng");
          } finally {
            setLoading(false);
          }
        };
        fetchOrderDetails();
      }
  }, [orderId]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get status color based on status
  const getStatusColor = (status) => {
    const statusMap = {
      'PENDING': '#faad14',
      'PROCESSING': '#1890ff',
      'COMPLETED': '#52c41a',
      'CANCELLED': '#ff4d4f',
      'DELIVERING': '#722ed1'
    };
    return statusMap[status] || '#1890ff';
  };

  // Handle edit price
  const handleEditPrice = () => {
    setIsEditingPrice(true);
  };

  const handleSavePrice = async () => {
    try {
      const payload = {
        otherPrice: editOtherPrice,
        otherPriceNote: editOtherPriceNote
      };
      
      const response = await postRequest(`/customer-staff/order/otherprice?orderId=${orderId}`, payload);
      
      if (response.data) {
        message.success("Cập nhật giá thành công!");
        setIsEditingPrice(false);
        // Refresh order details
        const updatedResponse = await getRequest(`/orders/${orderId}`);
        setOrderDetails(updatedResponse.data);
        if (updatedResponse.data?.orderSummary) {
          setEditOtherPrice(updatedResponse.data.orderSummary.otherprice || 0);
          setEditOtherPriceNote(updatedResponse.data.orderSummary.otherPriceNote || "");
        }
      }
    } catch (error) {
      console.error("Error updating price:", error);
      message.error("Không thể cập nhật giá. Vui lòng thử lại!");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPrice(false);
    // Reset to original values
    if (orderDetails?.orderSummary) {
      setEditOtherPrice(orderDetails.orderSummary.otherprice || 0);
      setEditOtherPriceNote(orderDetails.orderSummary.otherPriceNote || "");
    }
  };

  // Add to cart functions
  const handleAddToCart = () => {
    setIsAddToCartModalOpen(true);
    setCurrentStep(1);
    fetchCategories();
  };

  const resetAddToCartState = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSubCategories([]);
    setSelectedSubCategory(null);
    setServices([]);
    setSelectedService(null);
    setServiceDetails(null);
    setSelectedExtras([]);
    setQuantity(1);
  };

  const handleCloseAddToCartModal = () => {
    setIsAddToCartModalOpen(false);
    resetAddToCartState();
  };

  const fetchCategories = async () => {
    try {
      setLoadingAddToCart(true);
      const response = await getRequest("/categories");
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh sách danh mục");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      setLoadingAddToCart(true);
      const response = await getRequest(`/categories/${categoryId}`);
      if (response.data) {
        setSubCategories(response.data.subCategories || []);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      message.error("Không thể tải danh sách danh mục con");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  const fetchServiceDetails = async (serviceId) => {
    try {
      setLoadingAddToCart(true);
      const response = await getRequest(`/service-details/${serviceId}`);
      if (response.data) {
        setServiceDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      message.error("Không thể tải chi tiết dịch vụ");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchSubCategories(category.categoryId);
    setCurrentStep(2);
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setServices(subCategory.serviceDetails || []);
    setCurrentStep(3);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    fetchServiceDetails(service.serviceId);
    setCurrentStep(4);
  };

  const handleExtraToggle = (extraId) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const calculateTotalPrice = () => {
    if (!selectedService || !serviceDetails) return 0;
    
    let total = selectedService.price * quantity;
    
    // Add extras price
    if (serviceDetails.extraCategories) {
      serviceDetails.extraCategories.forEach(category => {
        category.extras.forEach(extra => {
          if (selectedExtras.includes(extra.extraId)) {
            total += extra.price * quantity;
          }
        });
      });
    }
    
    return total;
  };

  const handleSubmitAddToCart = async () => {
    try {
      setLoadingAddToCart(true);
      const payload = {
        serviceDetailId: selectedService.serviceId,
        quantity: quantity,
        extraIds: selectedExtras
      };
      
      const response = await postRequest(`/customer-staff/order/add-item?orderId=${orderId}`, payload);
      
      if (response.data) {
        message.success("Thêm sản phẩm vào giỏ hàng thành công!");
        handleCloseAddToCartModal();
        // Refresh order details
        const updatedResponse = await getRequest(`/orders/${orderId}`);
        setOrderDetails(updatedResponse.data);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("Không thể thêm sản phẩm vào giỏ hàng");
    } finally {
      setLoadingAddToCart(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      
      if (currentStep === 2) {
        setSelectedCategory(null);
        setSubCategories([]);
      } else if (currentStep === 3) {
        setSelectedSubCategory(null);
        setServices([]);
      } else if (currentStep === 4) {
        setSelectedService(null);
        setServiceDetails(null);
        setSelectedExtras([]);
      }
    }
  };

  console.log("Order details:", orderDetails);
  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ fontSize: 20, marginRight: 10 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            Thông tin đơn hàng: {orderId}
          </span>
        </div>
      }
      placement="right" 
      width="80vw"
      onClose={onClose}
      visible={visible}
      headerStyle={{ 
        borderBottom: '1px solid #f0f0f0', 
        padding: '16px 24px',
        backgroundColor: '#fafafa'
      }}
      bodyStyle={{ padding: '24px', backgroundColor: '#f5f7fa' }}
      footer={
        <div style={{ 
          textAlign: 'right',
          borderTop: '1px solid #f0f0f0',
          padding: '12px 24px'
        }}>
          <Space>
            {assignmentId && !isEditingPrice && (
              <>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={handleEditPrice}
                  style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                >
                  Chỉnh sửa giá
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddToCart}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Thêm sản phẩm vào giỏ hàng
                </Button>
              </>
            )}
            {assignmentId && isEditingPrice && (
              <>
                <Button 
                  type="primary" 
                  onClick={handleSavePrice}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Lưu
                </Button>
                <Button 
                  onClick={handleCancelEdit}
                >
                  Hủy
                </Button>
              </>
            )}
            <Button onClick={onClose} type="primary">
              Đóng
            </Button>
          </Space>
        </div>
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      ) : orderDetails ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  <span>Thông tin khách hàng</span>
                </div>
              } 
              bordered={false}
              style={{ borderRadius: '12px', height: '100%' }}
              headStyle={{ 
                borderBottom: '2px solid #1890ff',
                padding: '12px 16px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    label: "Tên người nhận",
                    value: orderDetails.pickupName,
                    icon: <UserOutlined style={{ color: '#1890ff' }} />
                  },
                  {
                    label: "Số điện thoại",
                    value: orderDetails.pickupPhone,
                    icon: <PhoneOutlined style={{ color: '#1890ff' }} />
                  },
                  {
                    label: "Địa chỉ nhận",
                    value: orderDetails.pickupAddressDetail,
                    icon: <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  },
                  {
                    label: "Mô tả",
                    value: orderDetails.pickupDescription || "Không có mô tả",
                    icon: <FileTextOutlined style={{ color: '#1890ff' }} />
                  },
                  {
                    label: "Thời gian nhận",
                    value: moment(orderDetails.pickupTime).format("LLL"),
                    icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  }
                ]}
                renderItem={item => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <List.Item.Meta
                      avatar={<Avatar icon={item.icon} style={{ backgroundColor: '#e6f7ff' }} />}
                      title={<Text type="secondary">{item.label}</Text>}
                      description={<Text strong>{item.value}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  <span>Thông tin giao hàng</span>
                </div>
              } 
              bordered={false}
              style={{ borderRadius: '12px', height: '100%' }}
              headStyle={{ 
                borderBottom: '2px solid #52c41a',
                padding: '12px 16px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    label: "Tên người nhận",
                    value: orderDetails.deliveryName,
                    icon: <UserOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    label: "Số điện thoại",
                    value: orderDetails.deliveryPhone,
                    icon: <PhoneOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    label: "Địa chỉ giao",
                    value: orderDetails.deliveryAddressDetail,
                    icon: <EnvironmentOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    label: "Mô tả",
                    value: orderDetails.deliveryDescription || "Không có mô tả",
                    icon: <FileTextOutlined style={{ color: '#52c41a' }} />
                  },
                  {
                    label: "Thời gian giao",
                    value: moment(orderDetails.deliveryTime).format("LLL"),
                    icon: <ClockCircleOutlined style={{ color: '#52c41a' }} />
                  }
                ]}
                renderItem={item => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <List.Item.Meta
                      avatar={<Avatar icon={item.icon} style={{ backgroundColor: '#f6ffed' }} />}
                      title={<Text type="secondary">{item.label}</Text>}
                      description={<Text strong>{item.value}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Map Section */}
          {orderDetails.deliveryLatitude && orderDetails.deliveryLongitude && (
            <Col xs={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EnvironmentOutlined style={{ color: '#fa541c', marginRight: 8 }} />
                    <span>Vị trí giao hàng</span>
                  </div>
                } 
                bordered={false}
                style={{ borderRadius: '12px', marginBottom: '24px' }}
                headStyle={{ 
                  borderBottom: '2px solid #fa541c',
                  padding: '12px 16px'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                  <MapContainer
                    center={[orderDetails.deliveryLatitude, orderDetails.deliveryLongitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[orderDetails.deliveryLatitude, orderDetails.deliveryLongitude]}>
                      <Popup>
                        <div>
                          <strong>Địa chỉ giao hàng</strong><br />
                          {orderDetails.deliveryAddressDetail}<br />
                          <strong>Người nhận:</strong> {orderDetails.deliveryName}<br />
                          <strong>SĐT:</strong> {orderDetails.deliveryPhone}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div style={{ marginTop: '12px', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                  <Text type="secondary">
                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                    Tọa độ: {orderDetails.deliveryLatitude}, {orderDetails.deliveryLongitude}
                  </Text>
                </div>
              </Card>
            </Col>
          )}

          <Col xs={24}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BarsOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  <span>Chi tiết sản phẩm</span>
                </div>
              } 
              bordered={false}
              style={{ borderRadius: '12px', marginBottom: '24px' }}
              headStyle={{ 
                borderBottom: '2px solid #1890ff',
                padding: '12px 16px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={orderDetails.orderSummary.items}
                renderItem={(item, index) => (
                  <List.Item 
                    style={{ 
                      padding: '16px 0', 
                      borderBottom: index < orderDetails.orderSummary.items.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ backgroundColor: '#1890ff', fontSize: '16px' }} 
                          size="large"
                        >
                          {index + 1}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: '16px' }}>{item.serviceName}</Text>
                          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                            {formatCurrency(item.subTotal)}
                          </Text>
                        </div>
                      }
                      description={
                        <div>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Text type="secondary">Đơn giá: </Text>
                              <Text strong>{formatCurrency(item.servicePrice)}</Text>
                            </Col>
                            <Col span={8}>
                              <Text type="secondary">Số lượng: </Text>
                              <Text strong>{item.quantity}</Text>
                            </Col>
                            <Col span={8}>
                              <Text type="secondary">Dịch vụ thêm: </Text>
                              <Text strong>{item.extras.length > 0 ? `${item.extras.length} items` : 'Không có'}</Text>
                            </Col>
                          </Row>
                          {item.extras.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">Dịch vụ bổ sung: </Text>
                              {item.extras.map((extra, idx) => (
                                <Tag key={idx} color="green" style={{ margin: '2px' }}>
                                  {extra.extraName} (+{formatCurrency(extra.extraPrice)})
                                </Tag>
                              ))}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DollarOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                  <span>Thông tin thanh toán</span>
                </div>
              } 
              bordered={false}
              style={{ borderRadius: '12px', height: '100%' }}
              headStyle={{ 
                borderBottom: '2px solid #722ed1',
                padding: '12px 16px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    label: "Tổng giá trị ước tính",
                    value: formatCurrency(orderDetails.orderSummary.estimatedTotal),
                    icon: <CalculatorOutlined style={{ color: '#722ed1' }} />
                  },
                  {
                    label: "Phí vận chuyển",
                    value: formatCurrency(orderDetails.orderSummary.shippingFee),
                    icon: <CarOutlined style={{ color: '#722ed1' }} />
                  },
                  {
                    label: "Chiết khấu vận chuyển",
                    value: formatCurrency(orderDetails.orderSummary.shippingDiscount),
                    icon: <GiftOutlined style={{ color: '#722ed1' }} />
                  },
                  {
                    label: "Phí áp dụng",
                    value: formatCurrency(orderDetails.orderSummary.applicableFee),
                    icon: <TagOutlined style={{ color: '#722ed1' }} />
                  },
                  {
                    label: "Giảm giá",
                    value: formatCurrency(orderDetails.orderSummary.discount),
                    icon: <PercentageOutlined style={{ color: '#722ed1' }} />
                  },
                  {
                    label: "Giá khác",
                    value: isEditingPrice ? (
                      <InputNumber
                        style={{ width: '100%' }}
                        value={editOtherPrice}
                        onChange={(value) => setEditOtherPrice(value || 0)}
                        placeholder="Nhập giá khác"
                        min={0}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    ) : formatCurrency(orderDetails.orderSummary.otherprice || 0),
                    icon: <DollarOutlined style={{ color: '#722ed1' }} />
                  },
                  {
                    label: "Ghi chú giá khác",
                    value: isEditingPrice ? (
                      <Input.TextArea
                        value={editOtherPriceNote}
                        onChange={(e) => setEditOtherPriceNote(e.target.value)}
                        placeholder="Nhập ghi chú cho việc thay đổi giá..."
                        rows={2}
                        style={{ width: '100%' }}
                      />
                    ) : (orderDetails.orderSummary.otherPriceNote || "Không có ghi chú"),
                    icon: <MessageOutlined style={{ color: '#722ed1' }} />
                  }
                ]}
                renderItem={item => (
                  <List.Item style={{ padding: '8px 0', borderBottom: '1px dashed #f0f0f0' }}>
                    <List.Item.Meta
                      avatar={<Avatar icon={item.icon} style={{ backgroundColor: '#f9f0ff' }} />}
                      title={<Text type="secondary">{item.label}</Text>}
                      description={<Text>{item.value}</Text>}
                    />
                  </List.Item>
                )}
                footer={
                  <div style={{ 
                    padding: '16px 0 0', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '2px solid #722ed1'
                  }}>
                    <Text strong style={{ fontSize: 16 }}>Tổng giá</Text>
                    <Text strong style={{ fontSize: 20, color: '#722ed1' }}>
                      {formatCurrency(orderDetails.orderSummary.totalPrice)}
                    </Text>
                  </div>
                }
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <BarsOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  <span>Trạng thái đơn hàng</span>
                </div>
              } 
              bordered={false}
              style={{ borderRadius: '12px' }}
              headStyle={{ 
                borderBottom: '2px solid #fa8c16',
                padding: '12px 16px'
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <Tag 
                    color={getStatusColor(orderDetails.currentOrderStatus.currentStatus)}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: 16, 
                      borderRadius: '20px',
                      display: 'inline-block'
                    }}
                  >
                    {orderDetails.currentOrderStatus.currentStatus}
                  </Tag>
                </div>
                
                <Alert
                  message="Mô tả trạng thái"
                  description={orderDetails.currentOrderStatus.statusDescription || "Không có mô tả"}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16, borderRadius: 8 }}
                />
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  <span>Cập nhật cuối: {moment(orderDetails.currentOrderStatus.lastUpdate).format("LLL")}</span>
                </div>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <MessageOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  <Text strong>Ghi chú</Text>
                </div>
                <div 
                  style={{ 
                    backgroundColor: '#fff8f0', 
                    padding: '12px 16px', 
                    borderRadius: 8,
                    border: '1px solid #ffe7ba',
                    minHeight: 80
                  }}
                >
                  {orderDetails.notes ? (
                    <p style={{ margin: 0 }}>{orderDetails.notes}</p>
                  ) : (
                    <Empty 
                      description="Không có ghi chú" 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      style={{ margin: 0 }} 
                    />
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <Result
          status="warning"
          title="Không tìm thấy thông tin"
          subTitle="Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        />
      )}
      
      {/* Modal Add to Cart */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <span>Thêm sản phẩm vào giỏ hàng</span>
          </div>
        }
        open={isAddToCartModalOpen}
        onCancel={handleCloseAddToCartModal}
        width={800}
        footer={null}
        destroyOnClose
      >
        <Steps
          current={currentStep - 1}
          style={{ marginBottom: 24 }}
          items={[
            { title: 'Chọn mục' },
            { title: 'Chọn loại' },
            { title: 'Chọn dịch vụ' },
            { title: 'Chi tiết & Xác nhận' }
          ]}
        />

        {loadingAddToCart ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : (
          <>
            {/* Step 1: Select Category */}
            {currentStep === 1 && (
              <div>
                <Title level={4}>Chọn danh mục dịch vụ</Title>
                <Row gutter={[16, 16]}>
                  {categories.map(category => (
                    <Col xs={24} sm={12} md={8} key={category.categoryId}>
                      <Card
                        hoverable
                        style={{ textAlign: 'center', height: '150px' }}
                        onClick={() => handleCategorySelect(category)}
                        cover={
                          <div style={{ padding: '20px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                              src={category.icon}
                              alt={category.name}
                              style={{ maxHeight: '60px', maxWidth: '60px' }}
                              preview={false}
                            />
                          </div>
                        }
                      >
                        <Card.Meta title={category.name} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Step 2: Select SubCategory */}
            {currentStep === 2 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button icon={<ArrowLeftOutlined />} onClick={goToPreviousStep}>
                    Quay lại
                  </Button>
                </div>
                <Title level={4}>Chọn loại dịch vụ - {selectedCategory?.name}</Title>
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                  dataSource={subCategories}
                  renderItem={subCategory => (
                    <List.Item>
                      <Card
                        hoverable
                        style={{ textAlign: 'center' }}
                        onClick={() => handleSubCategorySelect(subCategory)}
                      >
                        <Card.Meta title={subCategory.name} />
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Step 3: Select Service */}
            {currentStep === 3 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button icon={<ArrowLeftOutlined />} onClick={goToPreviousStep}>
                    Quay lại
                  </Button>
                </div>
                <Title level={4}>Chọn dịch vụ - {selectedSubCategory?.name}</Title>
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2 }}
                  dataSource={services}
                  renderItem={service => (
                    <List.Item>
                      <Card
                        hoverable
                        onClick={() => handleServiceSelect(service)}
                        cover={
                          <div style={{ height: '150px', overflow: 'hidden' }}>
                            <Image
                              src={service.imageUrl}
                              alt={service.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              preview={false}
                            />
                          </div>
                        }
                      >
                        <Card.Meta 
                          title={service.name}
                          description={
                            <div>
                              <Text strong style={{ color: '#52c41a' }}>
                                {formatCurrency(service.price)}
                              </Text>
                              {service.description && (
                                <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                                  {service.description}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Step 4: Service Details & Confirm */}
            {currentStep === 4 && serviceDetails && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button icon={<ArrowLeftOutlined />} onClick={goToPreviousStep}>
                    Quay lại
                  </Button>
                </div>
                
                {/* Service Info */}
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Image
                        src={serviceDetails.imageUrl}
                        alt={serviceDetails.name}
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Col>
                    <Col span={16}>
                      <Title level={4}>{serviceDetails.name}</Title>
                      <Text>Giá: <Text strong style={{ color: '#52c41a' }}>{formatCurrency(serviceDetails.price)}</Text></Text>
                      {serviceDetails.description && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary">{serviceDetails.description}</Text>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>

                {/* Extras */}
                {serviceDetails.extraCategories && serviceDetails.extraCategories.length > 0 && (
                  <Card title="Dịch vụ bổ sung" style={{ marginBottom: 16 }}>
                    {serviceDetails.extraCategories.map(category => (
                      <div key={category.extraCategoryId} style={{ marginBottom: 16 }}>
                        <Title level={5}>{category.categoryName}</Title>
                        <Row gutter={[8, 8]}>
                          {category.extras.map(extra => (
                            <Col span={24} key={extra.extraId}>
                              <Checkbox
                                checked={selectedExtras.includes(extra.extraId)}
                                onChange={() => handleExtraToggle(extra.extraId)}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                  <span>{extra.name}</span>
                                  <Text strong style={{ color: '#52c41a' }}>
                                    +{formatCurrency(extra.price)}
                                  </Text>
                                </div>
                              </Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    ))}
                  </Card>
                )}

                {/* Quantity */}
                <Card title="Số lượng" style={{ marginBottom: 16 }}>
                  <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    style={{ width: '100px' }}
                  />
                </Card>

                {/* Total Price */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
                    <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                      {formatCurrency(calculateTotalPrice())}
                    </Title>
                  </div>
                </Card>

                {/* Submit Button */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleSubmitAddToCart}
                    loading={loadingAddToCart}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </Drawer>
  );
}

export default OrderDetailDrawer;
