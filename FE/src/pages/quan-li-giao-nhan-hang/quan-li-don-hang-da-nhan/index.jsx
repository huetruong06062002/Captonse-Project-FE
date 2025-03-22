import React, { useState } from "react";
import { Button, Col, Input, Row, Table, Tag, theme } from "antd";
import data from "../../../FakeData/data";
import Search from "antd/es/input/Search";
import { Steps } from "antd";
import {  setOrderedChoosenReceivered, setSelectedStaff } from "@redux/features/orderReducer/orderSlice";
import { useDispatch, useSelector } from "react-redux";

function QuanLiDonHangDaNhan() {
  let { OrderCustomerBooking, staffs } = data;
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
        (order) => order["Trạng thái đơn hàng"] === "Đã nhận"
      )
    );
  
    const dispatch = useDispatch();
    const orderedChoosenReceivered = useSelector((state) => state.order.orderedChoosenReceivered);
    const selectedStaff = useSelector((state) => state.order.selectedStaff); // Lấy tài xế đã chọn từ store Redux
  
  
    const steps = [
      {
        title: "Chọn đơn hàng",
        description: "Chọn đơn hàng cần xử lý",
      },
      {
        title: "Chọn nhân viên",
        description: "Chọn nhân viên xử lý đơn hàng(giặt hàng)",
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
  
    const columnsStaff = [
      {
        title: "Mã nhân viên",
        dataIndex: "Mã nhân viên",
        key: "Mã nhân viên",
      },
      {
        title: "Tên nhân viên",
        dataIndex: "Tên nhân viên",
        key: "Tên nhân viên",
      },
      {
        title: "Số điện thoại",
        dataIndex: "Số điện thoại",
        key: "Số điện thoại",
      },
    ];
  
  
    const rowSelectionOrders = {
      selectedRowKeys: orderedChoosenReceivered.map((order) => order.ID), // Giữ các đơn hàng đã chọn
      onChange: (selectedRowKeys, selectedRows) => {
        dispatch(setOrderedChoosenReceivered(selectedRows));
        console.log(
          `Selected Row Keys: ${selectedRowKeys}`,
          "Selected Rows: ",
          selectedRows
        );
      },
    };
  
    const rowSelectionStaffs = {
      selectedRowKeys: selectedStaff ? [selectedStaff["Mã nhân viên"]] : [], // Chỉ chọn 1 nhân viên
      onChange: (selectedRowKeys, selectedRows) => {
        dispatch(setSelectedStaff(selectedRows[0])); // Lưu tài xế đầu tiên được chọn
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
        {current < steps.length - 1 && orderedChoosenReceivered.length > 0 && (
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
                dataSource={orderedChoosenReceivered}
                bordered
              />
            </Col>
            <Col span={12}>
              <h2>Danh sách các nhân viên</h2>
              <Table
                rowKey="Mã nhân viên"
                rowSelection={{ type: "radio", ...rowSelectionStaffs }}
                columns={columnsStaff}
                dataSource={staffs}
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
                dataSource={orderedChoosenReceivered}
                bordered
              />
            </Col>
            <Col span={12}>
              <h2>Nhân viên đã chọn</h2>
              <Table
                columns={columnsStaff}
                dataSource={[selectedStaff]} // Chỉ hiển thị nhân viên đã chọn
                bordered
                pagination={false}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  )
}

export default QuanLiDonHangDaNhan
