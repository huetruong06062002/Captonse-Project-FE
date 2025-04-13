import { Table, Tag, Input, Button } from "antd";
import React, { useEffect, useState } from "react";
import { getRequest, getRequestParams } from "@services/api";

const { Search } = Input;

function ListAllOrders() { 
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(10); // Số bản ghi trên mỗi trang
  const [totalRecords, setTotalRecords] = useState(0); // Tổng số bản ghi
  const [loading, setLoading] = useState(false); // Trạng thái loading

  useEffect(() => {
    fetchAllOrder();
  }, [currentPage, pageSize]);
  
  const fetchAllOrder = async () => {
    setLoading(true); // Bật trạng thái loading
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
      };
      const response = await getRequestParams("orders/all-orders", params);
      console.log("check response: ", response);

      if (response && response.data) {
        setOrders(response.data.data); // Lưu danh sách đơn hàng vào state
        setTotalRecords(response.data.totalRecords); // Lưu tổng số bản ghi để phân trang
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      sorter: (a, b) => a.orderId.localeCompare(b.orderId),
    },
    {
      title: "Tên đơn hàng",
      dataIndex: "orderName",
      key: "orderName",
      sorter: (a, b) => a.orderName.localeCompare(b.orderName),
    },
    {
      title: "Số lượng dịch vụ",
      dataIndex: "serviceCount",
      key: "serviceCount",
      sorter: (a, b) => a.serviceCount - b.serviceCount,
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      render: (price) => `${price?.toLocaleString()} VND`,
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderedDate",
      key: "orderedDate",
      sorter: (a, b) => new Date(a.orderedDate) - new Date(b.orderedDate),
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => {
        const statusColors = {
          SCHEDULED_PICKUP: "blue",
          CANCELLED: "red",
          PENDING: "orange",
        };
        return <Tag color={statusColors[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "90vh", // Giới hạn chiều cao tối đa (90% chiều cao màn hình)
        overflowY: "auto",
        paddingBottom: "50px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Tìm kiếm đơn hàng..."
          allowClear
          enterButton="Tìm kiếm"
          onSearch={(value) => console.log("Search:", value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          onClick={fetchAllOrder} // Gọi lại hàm fetchAllOrder khi nhấn nút
        >
          Refresh
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey={(record) => record.orderId}
        loading={loading} // Hiển thị loading khi đang tải dữ liệu
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalRecords,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
      />
    </div>
  );
}

export default ListAllOrders;
