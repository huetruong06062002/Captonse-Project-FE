import { Table, Tag, Input } from 'antd';
import data from "../../../FakeData/data";
import React, { useState } from "react";

const { Search } = Input;

function ListAllOrders() {
  const {OrderCustomerBooking} = data;
  const [filteredData, setFilteredData] = useState(OrderCustomerBooking);

  const statusColors = {
    "Chờ xử lý": "orange",
    "Đã nhận": "blue",
    "Đã giặt xong": "green",
    "Đã giao": "purple",
  };

  const handleSearch = (value) => {
    const filtered = OrderCustomerBooking.filter(order =>
      order["Mã đơn hàng"].toLowerCase().includes(value.toLowerCase()) ||
      order["Tên khách hàng"].toLowerCase().includes(value.toLowerCase()) ||
      order["Dịch vụ đã chọn"].toLowerCase().includes(value.toLowerCase()) ||
      order["Trạng thái đơn hàng"].toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "Mã đơn hàng",
      key: "order_id",
      sorter: (a, b) => a["Mã đơn hàng"].localeCompare(b["Mã đơn hàng"]),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "Tên khách hàng",
      key: "customer_name",
      sorter: (a, b) => a["Tên khách hàng"].localeCompare(b["Tên khách hàng"]),
    },
    {
      title: "Dịch vụ đã chọn",
      dataIndex: "Dịch vụ đã chọn",
      key: "service",
      sorter: (a, b) => a["Dịch vụ đã chọn"].localeCompare(b["Dịch vụ đã chọn"]),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "Trạng thái đơn hàng",
      key: "status",
      sorter: (a, b) => a["Trạng thái đơn hàng"].localeCompare(b["Trạng thái đơn hàng"]),
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Thời gian đặt hàng",
      dataIndex: "Thời gian đặt hàng",
      key: "order_time",
      sorter: (a, b) => new Date(a["Thời gian đặt hàng"]) - new Date(b["Thời gian đặt hàng"]),
    },
    {
      title: "Giá tiền",
      dataIndex: "Giá tiền",
      key: "price",
      sorter: (a, b) => parseInt(a["Giá tiền"].replace(/[^0-9]/g, "")) - parseInt(b["Giá tiền"].replace(/[^0-9]/g, "")),
    },
  ];

  return (
    <div>
      <Search
        placeholder="Tìm kiếm đơn hàng..."
        allowClear
        enterButton="Tìm kiếm"
        onSearch={handleSearch}
        style={{ marginBottom: 16, width: 300 }}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record["Mã đơn hàng"]}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}

export default ListAllOrders;
