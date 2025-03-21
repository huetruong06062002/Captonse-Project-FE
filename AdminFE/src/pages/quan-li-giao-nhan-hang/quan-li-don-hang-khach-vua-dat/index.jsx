import React, { useState } from "react";
import { Button, Col, Input, Row, Table, Tag, theme } from "antd";
import data from "../../../FakeData/data";
import Search from "antd/es/input/Search";
import { Steps } from "antd";
import { setOrderedChoosen, setSelectedDriver } from "@redux/features/orderReducer/orderSlice";
import { useDispatch, useSelector } from "react-redux";
function OrderBookingCustomer() {
  let { OrderCustomerBooking, drivers } = data;
  const OrderCustomerBookingAddKey = OrderCustomerBooking.map(
    (order, index) => ({
      ID: index + 1,
      ...order,
    })
  );
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [filteredData, setFilteredData] = useState(
    OrderCustomerBookingAddKey.filter(
      (order) => order["Trạng thái đơn hàng"] === "Chờ xử lý"
    )
  );

  const dispatch = useDispatch();
  const orderedChoosen = useSelector((state) => state.order.orderedChoosen);
  const selectedDriver = useSelector((state) => state.order.selectedDriver); // Lấy tài xế đã chọn từ store Redux
  console.log("selectedDriver", selectedDriver);

  const steps = [
    {
      title: "Chọn đơn hàng",
      description: "Chọn đơn hàng cần xử lý",
    },
    {
      title: "Chọn tài xế",
      description: "Chọn tài xế lấy đơn hàng",
    },
    {
      title: "Finish",
      description: "Hoàn thành",
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const contentStyle = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const statusColors = {
    "Chờ xử lý": "orange",
    "Đã nhận": "blue",
    "Đã giặt xong": "green",
    "Đã giao": "purple",
  };

  var handleSearch = (value) => {
    const filtered = OrderCustomerBooking.filter(
      (order) =>
        order["Mã đơn hàng"].toLowerCase().includes(value.toLowerCase()) ||
        order["Tên khách hàng"].toLowerCase().includes(value.toLowerCase()) ||
        order["Dịch vụ đã chọn"].toLowerCase().includes(value.toLowerCase()) ||
        order["Trạng thái đơn hàng"].toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  var columnsOrder = [
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
      sorter: (a, b) =>
        a["Dịch vụ đã chọn"].localeCompare(b["Dịch vụ đã chọn"]),
    },
    {
      title: "Trạng thái đơn hàng",
      dataIndex: "Trạng thái đơn hàng",
      key: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Thời gian đặt hàng",
      dataIndex: "Thời gian đặt hàng",
      key: "order_time",
      sorter: (a, b) =>
        new Date(a["Thời gian đặt hàng"]) - new Date(b["Thời gian đặt hàng"]),
    },
    {
      title: "Giá tiền",
      dataIndex: "Giá tiền",
      key: "price",
      sorter: (a, b) =>
        parseInt(a["Giá tiền"].replace(/[^0-9]/g, "")) -
        parseInt(b["Giá tiền"].replace(/[^0-9]/g, "")),
    },
  ];

  const ColumnOrdersChoose = [
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
      sorter: (a, b) =>
        a["Dịch vụ đã chọn"].localeCompare(b["Dịch vụ đã chọn"]),
    },
  ];

  const columnsDriver = [
    { title: "Mã tài xế", dataIndex: "Mã tài xế", key: "Mã tài xế" },
    { title: "Tên tài xế", dataIndex: "Tên tài xế", key: "Tên tài xế" },
    {
      title: "Số đơn hàng đang giao",
      dataIndex: "Số đơn hàng đang giao",
      key: "Số đơn hàng đang giao",
    },
  ];

  console.log("orderedChoosen", orderedChoosen);
  const rowSelectionOrders = {
    selectedRowKeys: orderedChoosen.map((order) => order.ID), // Giữ các đơn hàng đã chọn
    onChange: (selectedRowKeys, selectedRows) => {
      dispatch(setOrderedChoosen(selectedRows));
      console.log(
        `Selected Row Keys: ${selectedRowKeys}`,
        "Selected Rows: ",
        selectedRows
      );
    },
  };

  const rowSelectionDrivers = {
    selectedRowKeys: selectedDriver ? [selectedDriver.key] : [], // Chỉ chọn 1 nhân viên
    onChange: (selectedRowKeys, selectedRows) => {
      dispatch(setSelectedDriver(selectedRows[0])); // Lưu tài xế đầu tiên được chọn
      console.log(
        `Selected Row Keys: ${selectedRowKeys}`,
        "Selected Rows: ",
        selectedRows
      );
    },
  };
  return (
    <div>
      <Steps current={current} items={steps} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div
        style={{
          marginTop: 24,
        }}
      >
        {current < steps.length - 1 && orderedChoosen.length > 0 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => message.success("Processing complete!")}
          >
            Done
          </Button>
        )}
        {current > 0 && (
          <Button
            style={{
              margin: "0 8px",
            }}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )}
      </div>
      {current == 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Search
              placeholder="Tìm kiếm đơn hàng..."
              allowClear
              enterButton="Tìm kiếm"
              onSearch={handleSearch}
              style={{ marginBottom: 16, width: 300 }}
            />
          </div>
          <Table
            rowKey="ID"
            columns={columnsOrder}
            dataSource={filteredData}
            rowSelection={{ type: "checkbox", ...rowSelectionOrders }}
            // bordered
            pagination={{ pageSize: 8 }}
          />
        </>
      )}

      {current == 1 && (
        <>
          <Row style={{ marginTop: 16 }}>
            <Col span={12} style={{ paddingRight: 10 }}>
              <h2>Các đơn hàng đã chọn</h2>
              <Table
                columns={ColumnOrdersChoose}
                dataSource={orderedChoosen}
                bordered
              />
            </Col>
            <Col span={12}>
              <h2>Danh sách các tài xế</h2>
              <Table
                rowSelection={{ type: "radio", ...rowSelectionDrivers }}
                columns={columnsDriver}
                dataSource={drivers}
                bordered
                pagination={{ pageSize: 5 }}
              />
            </Col>
          </Row>
        </>
      )}

      {current === 2 && (
        <>
          <Row style={{ marginTop: 16 }}>
            <Col span={12} style={{ paddingRight: 10 }}>
              <h2>Đơn hàng đã chọn</h2>
              <Table
                columns={ColumnOrdersChoose}
                dataSource={orderedChoosen}
                bordered
              />
            </Col>
            <Col span={12}>
              <h2>Tài xế đã chọn</h2>
              <Table
                columns={columnsDriver}
                dataSource={[selectedDriver]} // Chỉ hiển thị tài xế đã chọn
                bordered
                pagination={false}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default OrderBookingCustomer;
