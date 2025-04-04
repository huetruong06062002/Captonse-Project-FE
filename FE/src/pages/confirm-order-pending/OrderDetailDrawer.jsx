import React, { useState, useEffect } from "react";
import { Drawer, Button, List, Typography, Descriptions, Divider } from "antd";
import { useSelector } from "react-redux";
import moment from "moment";
import { getRequest } from '@services/api';

const { Title } = Typography;


function OrderDetailDrawer(props) {

  const { orderId, visible, onClose } = props;

  const [orderDetails, setOrderDetails] = useState(null);

  // Lấy thông tin chi tiết đơn hàng từ API khi drawer được mở
  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const response = await getRequest(`/orders/${orderId}`);
          console.log("Order details response:", response);
          setOrderDetails(response.data);
        } catch (error) {
          console.error("Error fetching order details:", error);
        }
      };
      fetchOrderDetails();
    }
  }, [orderId]);


  console.log("Order details:", orderDetails);
  return (
    <Drawer
      title={`Thông tin đơn hàng: ${orderId}`}
      placement="right" 
      width="80vw"
      onClose={onClose}
      visible={visible}
    >
      {orderDetails ? (
        <>
          <Title level={4}>Thông tin khách hàng</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên người nhận">
              {orderDetails.pickupName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {orderDetails.pickupPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ nhận">
              {orderDetails.pickupAddressDetail}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {orderDetails.pickupDescription}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian nhận">
              {moment(orderDetails.pickupTime).format("LLL")}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Thông tin giao hàng</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên người nhận">
              {orderDetails.deliveryName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {orderDetails.deliveryPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao">
              {orderDetails.deliveryAddressDetail}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {orderDetails.deliveryDescription}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian giao">
              {moment(orderDetails.deliveryTime).format("LLL")}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Thông tin đơn hàng</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tổng giá trị ước tính">
              {orderDetails.orderSummary.estimatedTotal}
            </Descriptions.Item>
            <Descriptions.Item label="Phí vận chuyển">
              {orderDetails.orderSummary.shippingFee}
            </Descriptions.Item>
            <Descriptions.Item label="Chiết khấu vận chuyển">
              {orderDetails.orderSummary.shippingDiscount}
            </Descriptions.Item>
            <Descriptions.Item label="Phí áp dụng">
              {orderDetails.orderSummary.applicableFee}
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              {orderDetails.orderSummary.discount}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng giá">
              {orderDetails.orderSummary.totalPrice}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Trạng thái đơn hàng</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Trạng thái">
              {orderDetails.currentOrderStatus.currentStatus}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả trạng thái">
              {orderDetails.currentOrderStatus.statusDescription}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật cuối">
              {moment(orderDetails.currentOrderStatus.lastUpdate).format("LLL")}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Ghi chú</Title>
          <p>{orderDetails.notes}</p>
        </>
      ) : (
        <p>Đang tải thông tin đơn hàng...</p>
      )}
    </Drawer>
  );
}

export default OrderDetailDrawer;
