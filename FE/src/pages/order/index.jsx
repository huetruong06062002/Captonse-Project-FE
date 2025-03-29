// src/pages/Order.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "@redux/features/orderReducer/orderSlice";
import { Table, Spin } from "antd";

const formatCurrency = (number) =>
  number?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const formatDateTime = (datetime) =>
  new Date(datetime).toLocaleString("vi-VN");

function Order() {
  const dispatch = useDispatch();
  const {
    orders,
    isLoading,
    currentPage,
    totalPages,
    pageSize,
    totalRecords
  } = useSelector((state) => state.order);

  // Gọi API lần đầu
  useEffect(() => {
    dispatch(fetchAllOrders({ page: 1, pageSize }));
  }, [dispatch, pageSize]);

  // Khi đổi trang
  const handleTableChange = (pagination) => {
    dispatch(fetchAllOrders({ page: pagination.current, pageSize }));
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "orderName",
      key: "orderName",
    },
    {
      title: "Số lượng dịch vụ",
      dataIndex: "serviceCount",
      key: "serviceCount",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: formatCurrency,
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderedDate",
      key: "orderedDate",
      render: formatDateTime,
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
    },
  ];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Danh sách đơn hàng</h2>
      {isLoading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : (
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="orderId"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
}

export default Order;
