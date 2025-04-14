import React, { useState, useEffect } from "react";
import { Drawer, Button, List, Typography, Descriptions, Divider, Card, Row, Col, Avatar, Alert, Empty, Result, Spin, Tag } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";
import { getRequest } from '@services/api';
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
  CarOutlined
} from "@ant-design/icons";
import { message } from "antd";

const { Title, Text } = Typography;


function OrderDetailDrawer(props) {

  const { orderId, visible, onClose } = props;

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin chi tiết đơn hàng từ API khi drawer được mở
  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        try {
          const response = await getRequest(`/orders/${orderId}`);
          console.log("Order details response:", response);
          setOrderDetails(response.data);
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
          <Button onClick={onClose} type="primary">
            Đóng
          </Button>
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

          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DollarOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                  <span>Thông tin đơn hàng</span>
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
    </Drawer>
  );
}

export default OrderDetailDrawer;
