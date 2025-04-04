import { getRequestParams } from '@services/api';
import React, { useEffect, useRef, useState } from "react";
import OrderDetailDrawer from './OrderDetailDrawer';

function ConfirmOrderPending() {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(10); // Số bản ghi trên mỗi trang
  const [totalRecords, setTotalRecords] = useState(0); // Tổng số bản ghi
  const [orderId, setOrderId] = useState(null); // ID đơn hàng được chọn
  useEffect(() => {
    fetchPendingOrder();
  }, [currentPage, pageSize]); // Gọi lại khi currentPage hoặc pageSize thay đổi

  const fetchPendingOrder = async () => {
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
      }
      const response = await  getRequestParams("/customer-staff/pending-orders", params)
      console.log("Response:", response); // Kiểm tra phản hồi từ API
      if (!response.data) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setOrders(response.data.data); // Lưu danh sách đơn hàng vào state
      setTotalRecords(response.data.totalRecords); // Lưu tổng số bản ghi để phân trang
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  const [dropdownVisible, setDropdownVisible] = useState(null); // Quản lý dropdown hiển thị
  const dropdownRef = useRef(null); // Tham chiếu đến dropdown

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(null); // Đóng dropdown nếu bấm ra ngoài
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (orderId) => {
    setDropdownVisible((prev) => (prev === orderId ? null : orderId));
  };

  const handleViewDetails = (orderId) => {
    setOrderId(orderId); // Lưu ID đơn hàng để hiển thị chi tiết
    console.log("Xem chi tiết đơn hàng:", orderId);
    showDrawer(); // Mở drawer để xem chi tiết đơn hàng
    // Thêm logic xử lý xem chi tiết ở đây
  };

  const handleAcceptOrder = (orderId) => {
    console.log("Nhận xử lý đơn hàng:", orderId);
    // Thêm logic xử lý nhận đơn hàng ở đây
  };

  const handleUpdateOrder = (orderId) => {
    console.log("Cập nhật đơn hàng:", orderId);
    // Thêm logic xử lý cập nhật đơn hàng ở đây
  };

  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  console.log(orderId, drawerVisible, orders); // Kiểm tra giá trị của orderId và drawerVisible


  return (
    <div style={{ overflow: "hidden" }}>
      <div
        style={{
          overflowY: "auto", // Thêm thanh cuộn dọc nếu nội dung tràn
          maxHeight: "50rem", // Giới hạn chiều cao tối đa
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>STT</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Tên đơn hàng
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Tổng giá
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Trạng thái
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Ngày đặt
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.orderId}>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {index + 1 + (currentPage - 1) * pageSize}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {order.orderName}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {order.totalPrice} VND
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {order.orderStatus}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {new Date(order.orderedDate).toLocaleString("vi-VN")}
                </td>
                <td
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    ref={dropdownRef} // Tham chiếu đến dropdown
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    {/* Icon menu */}
                    <button
                      style={{
                        backgroundColor: "#f9f9f9",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem",
                        padding: "0 1rem",
                      }}
                      onClick={() => toggleDropdown(order.orderId)}
                    >
                      &#x22EE; {/* Icon menu (vertical ellipsis) */}
                    </button>

                    {/* Dropdown menu */}
                    {dropdownVisible === order.orderId && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: "0",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "5px",
                          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                          zIndex: 1000,
                          width: "13rem",
                        }}
                      >
                        <button
                          style={{
                            display: "flex", // Sử dụng flex để căn chỉnh icon và text
                            alignItems: "center", // Căn giữa icon và text theo chiều dọc
                            width: "100%",
                            padding: "8px",
                            border: "none",
                            background: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#007bff", // Màu chữ
                            fontWeight: "bold", // Chữ đậm
                            fontSize: "14px", // Kích thước chữ
                          }}
                          onClick={() => handleViewDetails(order.orderId)}
                        >
                          <span style={{ marginRight: "8px" }}>🔍</span>{" "}
                          {/* Icon tìm kiếm */}
                          <p> Xem chi tiết</p>
                        </button>
                        <button
                          style={{
                            display: "flex", // Sử dụng flex để căn chỉnh icon và text
                            alignItems: "center", // Căn giữa icon và text theo chiều dọc
                            width: "100%",
                            padding: "8px",
                            border: "none",
                            background: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#28a745", // Màu chữ xanh lá
                            fontWeight: "bold", // Chữ đậm
                            fontSize: "14px", // Kích thước chữ
                          }}
                          onClick={() => handleAcceptOrder(order.orderId)}
                        >
                          <span style={{ marginRight: "8px" }}>✅</span>{" "}
                          {/* Icon check */}
                          Nhận xử lý đơn hàng
                        </button>
                        <button
                          style={{
                            display: "flex", // Sử dụng flex để căn chỉnh icon và text
                            alignItems: "center", // Căn giữa icon và text theo chiều dọc
                            width: "100%",
                            padding: "8px",
                            border: "none",
                            background: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#ffc107", // Màu chữ vàng
                            fontWeight: "bold", // Chữ đậm
                            fontSize: "14px", // Kích thước chữ
                          }}
                          onClick={() => handleUpdateOrder(order.orderId)}
                        >
                          <span style={{ marginRight: "8px" }}>✏️</span>{" "}
                          {/* Icon chỉnh sửa */}
                          Cập nhật
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
          
      </div>
      <OrderDetailDrawer orderId={orderId} visible={drawerVisible} onClose={onClose} />
    </div>
  );
}

function Pagination({
  currentPage,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.ceil(totalRecords / pageSize); // Tính tổng số trang

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        textAlign: "center",
        maxHeight: "400px", // Giới hạn chiều cao tối đa
        overflowY: "auto", // Thêm thanh cuộn dọc nếu nội dung tràn
      }}
    >
      {/* Nút Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ marginRight: "10px", padding: "0.5rem 0.5rem" }}
      >
        Previous
      </button>

      {/* Danh sách các trang */}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              backgroundColor: page === currentPage ? "#007bff" : "#fff",
              color: page === currentPage ? "#fff" : "#000",
              border: "1px solid #ddd",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {page}
          </button>
        )
      )}

      {/* Nút Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ marginRight: "10px", padding: "0.5rem 0.5rem" }}
      >
        Next
      </button>

      {/* Chọn số lượng bản ghi mỗi trang */}
      <div style={{ marginTop: "10px" }}>
        <label>
          Số lượng bản ghi mỗi trang:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{ marginLeft: "10px" }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>
    </div>
  );
}

export default ConfirmOrderPending;
