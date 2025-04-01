import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Thêm ArcElement
} from "chart.js";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import { getRequest } from "@services/api";
import { Col, Image, Row } from "antd";

import { FaUserTie } from "react-icons/fa6";
import orderImage from "../../assets/image/order.png";

// Đăng ký các thành phần cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Đăng ký ArcElement để sử dụng Pie Chart
);

function DashBoard() {
  //fetch api customer
  const [numberOfCustomer, setNumberOfCustomer] = useState(0);
  const [numberOfOrder, setNumberOfOrder] = useState(0);

  useEffect(() => {
    const fetchNumberOfCustomer = async () => {
      try {
        const response = await getRequest("DashBoard/get-customers-number");
        console.log("response", response);
        setNumberOfCustomer(response.data.customersNumber);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchNumberOfOrders = async () => {
      try {
        const response = await getRequest("DashBoard/get-all-orders-numbers");
        console.log("response", response);
        setNumberOfOrder(response.data.orderNumbers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchNumberOfCustomer();
    fetchNumberOfOrders();
  }, [numberOfCustomer]);

  console.log("numberOfCustomer", numberOfCustomer);

  const [orderStats, setOrderStats] = useState(null);

  useEffect(() => {
    // Giả sử bạn lấy dữ liệu từ API
    const response = {
      statusStatistics: [
        { status: "PENDING", count: 61 },
        { status: "CONFIRMED", count: 1 },
      ],
      todayOrders: 0,
      weeklyOrders: 1,
      monthlyOrders: 0,
      incompleteOrders: 62,
    };

    setOrderStats(response);
  }, []);

  if (!orderStats) return <div>Loading...</div>;

  // ChartJS data for statusStatistics (Pie Chart)
  const pieData = {
    labels: orderStats.statusStatistics.map((item) => item.status),
    datasets: [
      {
        data: orderStats.statusStatistics.map((item) => item.count),
        backgroundColor: ["#FF6384", "#36A2EB"], // Tùy chỉnh màu sắc
        hoverOffset: 4,
      },
    ],
  };

  // ChartJS data cho orders in nhiều thời gian  (Bar Chart)
  const barData = {
    labels: ["Today", "This Week", "This Month", "Incomplete"],
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: [
          orderStats.todayOrders,
          orderStats.weeklyOrders,
          orderStats.monthlyOrders,
          orderStats.incompleteOrders,
        ],
        backgroundColor: ["#FF9F40", "#4BC0C0", "#FFCD56", "#FF6384"], // Tùy chỉnh màu sắc
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <Row display="flex" style={{ gap: "0.3rem", flexWrap: "nowrap" }}>
        <Col
          span={6}
          style={{
            borderRadius: "1rem",
            backgroundColor: "#f0f0f0",
            padding: "1rem",
            display: "flex",
            color: "#2980b9",
          }}
        >
          <div
            style={{
              backgroundColor: "#2980b9",
              borderRadius: "50%",
              width: "5rem",
              height: "5rem",
              padding: "1rem",
            }}
          >
            <FaUserTie style={{ fontSize: "3rem", color: "white" }} />
          </div>
          <div style={{ marginLeft: "1rem", marginTop: "1rem" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Tổng số khách hàng
            </p>
            <h3
              style={{ textAlign: "center", color: "#000", fontSize: "1.1rem" }}
            >
              {numberOfCustomer}
            </h3>
          </div>
        </Col>
        <Col
          span={6}
          style={{
            borderRadius: "1rem",
            backgroundColor: "#f0f0f0",
            padding: "1rem",
            display: "flex",
            color: "#2980b9",
          }}
        >
          <div
            style={{
              backgroundColor: "#f1c40f",
              borderRadius: "50%",
              width: "5rem",
              height: "5rem",
              padding: "1rem",
              display: "flex", // Sử dụng flexbox
              justifyContent: "center", // Căn giữa theo chiều ngang
              alignItems: "center", // Căn giữa theo chiều dọc
            }}
          >
            <img
              src={orderImage}
              alt="Order"
              style={{
                width: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                height: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                objectFit: "contain", // Giữ tỷ lệ hình ảnh
                borderRadius: "50%", // Bo tròn hình ảnh

              }}
            />
          </div>
          <div style={{ marginLeft: "1rem", marginTop: "1rem" , color: "#f1c40f"}}>
            <p
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              Tổng số đơn hàng
            </p>
            <h3
              style={{ textAlign: "center", color: "#000", fontSize: "1.1rem" }}
            >
              { numberOfOrder}
            </h3>
          </div>
        </Col>
      </Row>
      <div style={{ width: "25%", float: "left" }}>
        <h3>Order Statistics</h3>
        <Pie
          data={pieData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>

      <div style={{ width: "50%", float: "left" }}>
        <h3>Số lượng đơn hàng</h3>
        <Bar
          data={barData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </div>
    </div>
  );
}

export default DashBoard;
