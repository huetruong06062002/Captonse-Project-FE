import React, { useEffect, useState } from "react";
import { Button, Col, Input, message, Row, Table, Tag, theme } from "antd";
import data from "../../../FakeData/data";
import Search from "antd/es/input/Search";
import { Steps } from "antd";
import {
  setOrderedChoosen,
  setSelectedDriver,
} from "@redux/features/orderReducer/orderSlice";
import { useDispatch, useSelector } from "react-redux";
import { getRequest, postRequest } from "@services/api";
function QuanLiDonHangDaKiemTraChatLuong() {
   const [areaOrders, setAreaOrders] = useState([]); // Dữ liệu trả về từ API
    const [drivers, setDrivers] = useState([]); // Lưu danh sách tài xế
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
    const [pageSize, setPageSize] = useState(5); // Số tài xế trên mỗi trang
    const [totalDrivers, setTotalDrivers] = useState(0); // Tổng số tài xế
    const [loading, setLoading] = useState(false); // Trạng thái loading
    useEffect(() => {
      fetchAreaOrders();
      fetchDrivers();
    }, []);
  
    const fetchAreaOrders = async () => {
      setLoading(true); // Bắt đầu loading
      try {
        const response = await getRequest("admin/orders/quality-checked"); // Gọi API
        console.log("Dữ liệu trả về:", response);
        setAreaOrders(response.data); // Lưu dữ liệu vào state
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };
  
    const fetchDrivers = async (page = 1, pageSize = 5) => {
      setLoading(true);
      try {
        const response = await getRequest(
          `users?role=Driver&page=${page}&pageSize=${pageSize}`
        ); // Gọi API
        console.log("Dữ liệu tài xế trả về:", response);
        setDrivers(response.data.data); // Lưu danh sách tài xế vào state
        setTotalDrivers(response.data.totalRecords);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tài xế:", error);
        message.error("Lỗi khi tải danh sách tài xế!");
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };
  
    const columnsDriver = [
      {
        title: "Tên tài xế",
        dataIndex: "fullName",
        key: "fullName",
      },
      {
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
      },
      {
        title: "Ngày sinh",
        dataIndex: "dob",
        key: "dob",
        render: (dob) => new Date(dob).toLocaleDateString("vi-VN"),
      },
    ];
  
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
  
    const dispatch = useDispatch();
    const orderedChoosen = useSelector((state) => state.order.orderedChoosen);
    const selectedDriver = useSelector((state) => state.order.selectedDriver); // Lấy tài xế đã chọn từ store Redux
    console.log("selectedDriver", selectedDriver);
    const [selectedOrdersByArea, setSelectedOrdersByArea] = useState({});
  
    console.log("selectedOrdersByArea", selectedOrdersByArea);
    const steps = [
      {
        title: "Chọn đơn hàng",
        description: "Chọn đơn hàng cần xử lý",
      },
      {
        title: "Chọn tài xế",
        description: "Chọn tài xế đi giao đơn hàng",
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
  
    const getRowSelectionForArea = (area) => ({
      selectedRowKeys:
        selectedOrdersByArea[area]?.map((order) => order.orderId) || [],
      onChange: (selectedRowKeys, selectedRows) => {
        setSelectedOrdersByArea((prev) => ({
          ...prev,
          [area]: selectedRows, // Cập nhật danh sách đơn hàng đã chọn cho khu vực
        }));
        console.log(`Selected in ${area}:`, selectedRows);
      },
    });
  
    console.log("orderedChoosen", orderedChoosen);
  
    const rowSelectionDrivers = {
      selectedRowKeys: selectedDriver ? [selectedDriver.userId] : [], // Sử dụng userId làm khóa
      onChange: (selectedRowKeys, selectedRows) => {
        dispatch(setSelectedDriver(selectedRows[0])); // Lưu tài xế đầu tiên được chọn
        console.log(
          `Selected Row Keys: ${selectedRowKeys}`,
          "Selected Rows: ",
          selectedRows
        );
      },
    };
    const getSelectedOrders = () => {
      return Object.values(selectedOrdersByArea).flat(); // Gộp tất cả các đơn hàng từ các khu vực
    };
  
    const prepareAssignData = () => {
      const orderIds = getSelectedOrders().map((order) => order.orderId); // Lấy danh sách orderId
      const driverId = selectedDriver?.userId; // Lấy driverId từ tài xế đã chọn
  
      console.log({ orderIds, driverId });
      return { orderIds, driverId };
    };
  
    const assignOrdersToDriver = async () => {
      const { orderIds, driverId } = prepareAssignData();
  
      if (!orderIds.length || !driverId) {
        message.error("Vui lòng chọn đơn hàng và tài xế trước khi gán!");
        return;
      }
  
      try {
        const response = await postRequest("admin/assign-delivery", {
          orderIds,
          driverId,
        });
  
        if (response.data) {
          message.success("Giao đơn hàng cho tài xế thành công!");
          // Thực hiện các hành động khác nếu cần, ví dụ: làm mới danh sách
          // Reset lại trạng thái
          setCurrent(0); // Quay lại bước đầu tiên
          setSelectedOrdersByArea({}); // Xóa các đơn hàng đã chọn
          dispatch(setSelectedDriver(null)); // Xóa tài xế đã chọn
          fetchAreaOrders(); // Làm mới danh sách đơn hàng
          fetchDrivers(); // Làm mới danh sách tài xế
        } else {
          const errorData = await response.json();
          message.error(`Lỗi: ${errorData.message || "Không thể gán đơn hàng"}`);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        message.error("Đã xảy ra lỗi khi gán đơn hàng!");
      }
    };
  
    return (
      <div
        style={{
          width: "100%",
          maxHeight: "90vh", // Giới hạn chiều cao tối đa (90% chiều cao màn hình)
          overflowY: "auto",
        }}
      >
        <Steps current={current} items={steps} />
        <div style={contentStyle}>{steps[current].content}</div>
        <div
          style={{
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end", // Đẩy nội dung sang bên phải
              marginBottom: 16,
            }}
          >
            <Button type="primary" onClick={fetchAreaOrders}>
              Refresh
            </Button>
          </div>
          {current < steps.length - 1 &&
            ((current === 0 &&
              Object.values(selectedOrdersByArea).some(
                (orders) => orders.length > 0
              )) || // Bước 0: Chỉ cần có đơn hàng được chọn
              (current === 1 &&
                Object.values(selectedOrdersByArea).some(
                  (orders) => orders.length > 0
                ) &&
                selectedDriver)) && ( // Bước 1: Cần cả đơn hàng và tài xế được chọn
              <Button type="primary" onClick={() => next()}>
                Next
              </Button>
            )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => assignOrdersToDriver()}>
              Giao
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
        {current === 0 && (
          <>
            {areaOrders?.map((areaData) => (
              <div key={areaData.area} style={{ marginBottom: "24px" }}>
                <h2>Khu vực: {areaData.area}</h2>
                <Table
                  rowKey="orderId"
                  columns={[
                    {
                      title: "Mã đơn hàng",
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: ["userInfo", "fullName"],
                      key: "fullName",
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: ["userInfo", "phoneNumber"],
                      key: "phoneNumber",
                    },
                    {
                      title: "Địa chỉ lấy hàng",
                      dataIndex: "pickupAddressDetail",
                      key: "pickupAddressDetail",
                    },
                    {
                      title: "Thời gian lấy hàng",
                      dataIndex: "pickupTime",
                      key: "pickupTime",
                      render: (time) => new Date(time).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Giá tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => `${price.toLocaleString()} VND`,
                    },
                  ]}
                  dataSource={areaData.orders}
                  loading={loading} // Hiển thị loading
                  rowSelection={{
                    type: "checkbox",
                    ...getRowSelectionForArea(areaData.area),
                  }}
                  pagination={{ pageSize: 5 }}
                />
              </div>
            ))}
          </>
        )}
        {current === 1 && (
          <>
            <Row style={{ marginTop: 16 }}>
              <Col span={12} style={{ paddingRight: 10 }}>
                <h2>Các đơn hàng đã chọn</h2>
                <Table
                  columns={[
                    {
                      title: "Mã đơn hàng",
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: ["userInfo", "fullName"],
                      key: "fullName",
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: ["userInfo", "phoneNumber"],
                      key: "phoneNumber",
                    },
                    {
                      title: "Địa chỉ lấy hàng",
                      dataIndex: "pickupAddressDetail",
                      key: "pickupAddressDetail",
                    },
                    {
                      title: "Thời gian lấy hàng",
                      dataIndex: "pickupTime",
                      key: "pickupTime",
                      render: (time) => new Date(time).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Giá tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => `${price.toLocaleString()} VND`,
                    },
                  ]}
                  dataSource={getSelectedOrders()} // Hiển thị các đơn hàng đã chọn
                  rowKey="orderId"
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              </Col>
              <Col span={12}>
                <h2>Danh sách các tài xế</h2>
                <Table
                  rowSelection={{ type: "radio", ...rowSelectionDrivers }} // Chọn 1 tài xế
                  columns={columnsDriver} // Cột hiển thị
                  dataSource={drivers} // Dữ liệu tài xế
                  rowKey="userId" // Khóa duy nhất cho mỗi tài xế
                  loading={loading} // Hiển thị loading
                  bordered
                  pagination={{
                    current: currentPage, // Trang hiện tại
                    pageSize: pageSize, // Số tài xế trên mỗi trang
                    total: totalDrivers, // Tổng số tài xế
                    onChange: (page, pageSize) => {
                      setCurrentPage(page); // Cập nhật trang hiện tại
                      setPageSize(pageSize); // Cập nhật số tài xế trên mỗi trang
                      fetchDrivers(page, pageSize); // Gọi lại API với trang mới
                    },
                  }}
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
                  columns={[
                    {
                      title: "Mã đơn hàng",
                      dataIndex: "orderId",
                      key: "orderId",
                    },
                    {
                      title: "Tên khách hàng",
                      dataIndex: ["userInfo", "fullName"],
                      key: "fullName",
                    },
                    {
                      title: "Số điện thoại",
                      dataIndex: ["userInfo", "phoneNumber"],
                      key: "phoneNumber",
                    },
                    {
                      title: "Địa chỉ lấy hàng",
                      dataIndex: "pickupAddressDetail",
                      key: "pickupAddressDetail",
                    },
                    {
                      title: "Thời gian lấy hàng",
                      dataIndex: "pickupTime",
                      key: "pickupTime",
                      render: (time) => new Date(time).toLocaleString("vi-VN"),
                    },
                    {
                      title: "Giá tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => `${price.toLocaleString()} VND`,
                    },
                  ]}
                  dataSource={getSelectedOrders()} // Hiển thị các đơn hàng đã chọn
                  rowKey="orderId"
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              </Col>
              <Col span={12}>
                <h2>Danh sách các tài xế</h2>
                <Table
                  rowSelection={{ type: "radio", ...rowSelectionDrivers }} // Chọn 1 tài xế
                  columns={columnsDriver} // Cột hiển thị
                  dataSource={drivers} // Dữ liệu tài xế
                  rowKey="userId" // Khóa duy nhất cho mỗi tài xế
                  bordered
                  pagination={{
                    current: currentPage, // Trang hiện tại
                    pageSize: pageSize, // Số tài xế trên mỗi trang
                    total: totalDrivers, // Tổng số tài xế
                    onChange: (page, pageSize) => {
                      setCurrentPage(page); // Cập nhật trang hiện tại
                      setPageSize(pageSize); // Cập nhật số tài xế trên mỗi trang
                      fetchDrivers(page, pageSize); // Gọi lại API với trang mới
                    },
                  }}
                />
              </Col>
            </Row>
          </>
        )}
      </div>
    );
}

export default QuanLiDonHangDaKiemTraChatLuong
