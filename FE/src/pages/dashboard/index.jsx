import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement, // Đăng ký PointElement
  LineElement, // Đăng ký LineElement
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
import customerImage from "../../assets/image/customer.png";
import serviesImage from "../../assets/image/service.png";
import extraImage from "../../assets/image/services-extra.png";
import CountUp from "react-countup";
import { Line } from "react-chartjs-2";

// Đăng ký các thành phần cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement, // Đăng ký PointElement
  LineElement, // Đăng ký LineElement
  ArcElement // Đăng ký ArcElement để sử dụng Pie Chart
);

function DashBoard() {
  // Tạo một mảng 14 màu sắc
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#C9CBCF",
    "#E74C3C",
    "#3498DB",
    "#F1C40F",
    "#2ECC71",
    "#9B59B6",
    "#34495E",
    "#1ABC9C",
  ];

  //fetch api customer
  const [numberOfCustomer, setNumberOfCustomer] = useState(0);
  const [numberOfOrder, setNumberOfOrder] = useState(0);
  const [numberOfService, setNumberOfService] = useState(0);
  const [numberOfExtra, setNumberOfExtra] = useState(0);
  const [orderStats, setOrderStats] = useState(null);
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

    const fetchNumberOfServices = async () => {
      try {
        const response = await getRequest("DashBoard/get-all-services-numbers");
        console.log("response", response);
        setNumberOfService(response.data.servicesNumbers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchNumberOfExtras = async () => {
      try {
        const response = await getRequest("DashBoard/get-all-extras-numbers");
        console.log("response", response);
        setNumberOfExtra(response.data.extrasNumbers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchNumberOfOrderStatistics = async () => {
      const response = await getRequest("DashBoard/get-order-statistics");

      setOrderStats(response.data);
    };

    fetchNumberOfCustomer();
    fetchNumberOfOrders();
    fetchNumberOfServices();
    fetchNumberOfExtras();
    fetchNumberOfOrderStatistics();
  }, []);

  console.log("orderStats", orderStats);

  if (!orderStats) return <div>Loading...</div>;

  // ChartJS data for statusStatistics (Pie Chart)
  const pieData = {
    labels: orderStats.statusStatistics.map((item) => item.status),
    datasets: [
      {
        data: orderStats.statusStatistics.map((item) => item.count),
        backgroundColor: orderStats.statusStatistics.map(
          (_, index) => colors[index % colors.length] // Lấy màu theo chỉ số, lặp lại nếu hết màu
        ),
        hoverOffset: 4,
      },
    ],
  };

  // ChartJS data cho orders in nhiều thời gian  (Bar Chart)
  const barData = {
    labels: [
      "Hôm nay",
      "Trong tuần này",
      "Trong tháng này",
      "số đơn hàng chưa được xử lý",
    ],
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

  //line chart user
  const lineData = {
    labels: ["Hôm nay", "Tuần này", "Tháng này"],
    datasets: [
      {
        label: "Khách hàng mới",
        data: [5, 20, 50], // Dữ liệu khách hàng mới
        borderColor: "#36A2EB", // Màu đường
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Màu nền dưới đường
        tension: 0.4, // Độ cong của đường
        fill: true, // Tô màu dưới đường
      },
    ],
  };

  return (
    <div style={{ width: "100%",   margin: "0 auto", // Căn giữa nội dung
      padding: "0 1rem", // Thêm khoảng cách hai bên
      maxHeight: "90vh", // Giới hạn chiều cao tối đa (90% chiều cao màn hình)
      overflowY: "auto",  }}>
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
            <img
              src={customerImage}
              alt="Order"
              style={{
                width: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                height: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                objectFit: "contain", // Giữ tỷ lệ hình ảnh
                borderRadius: "50%", // Bo tròn hình ảnh
              }}
            />
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
              {/* Sử dụng CountUp để tạo hiệu ứng tăng số */}
              <CountUp
                start={0} // Bắt đầu từ 0
                end={numberOfCustomer} // Kết thúc tại giá trị thực tế
                duration={2} // Thời gian hiệu ứng (2 giây)
                separator="," // Thêm dấu phẩy phân cách số
              />
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
          <div
            style={{ marginLeft: "1rem", marginTop: "1rem", color: "#f1c40f" }}
          >
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
              <CountUp
                start={0} // Bắt đầu từ 0
                end={numberOfOrder} // Kết thúc tại giá trị thực tế
                duration={2} // Thời gian hiệu ứng (2 giây)
                separator="," // Thêm dấu phẩy phân cách số
              />
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
              backgroundColor: "#2ecc71",
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
              src={serviesImage}
              alt="Serives"
              style={{
                width: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                height: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                objectFit: "contain", // Giữ tỷ lệ hình ảnh
                borderRadius: "50%", // Bo tròn hình ảnh
              }}
            />
          </div>
          <div
            style={{ marginLeft: "1rem", marginTop: "1rem", color: "#f1c40f" }}
          >
            <p
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#2ecc71",
              }}
            >
              Tổng số lượng dịch vụ
            </p>
            <h3
              style={{ textAlign: "center", color: "#000", fontSize: "1.1rem" }}
            >
              <CountUp
                start={0} // Bắt đầu từ 0
                end={numberOfService} // Kết thúc tại giá trị thực tế
                duration={2} // Thời gian hiệu ứng (2 giây)
                separator="," // Thêm dấu phẩy phân cách số
              />
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
              backgroundColor: "#8e44ad",
            }}
          >
            <img
              src={extraImage}
              alt="Order"
              style={{
                width: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                height: "100%", // Đảm bảo hình ảnh chiếm toàn bộ không gian div
                objectFit: "contain", // Giữ tỷ lệ hình ảnh
                borderRadius: "50%", // Bo tròn hình ảnh
                backgroundolor: "#8e44ad",
              }}
            />
          </div>
          <div style={{ marginLeft: "1rem", marginTop: "1rem" }}>
            <p
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#8e44ad",
              }}
            >
              Tổng số dịch vụ thêm
            </p>
            <h3
              style={{ textAlign: "center", color: "#000", fontSize: "1.1rem" }}
            >
              <CountUp
                start={0} // Bắt đầu từ 0
                end={numberOfExtra} // Kết thúc tại giá trị thực tế
                duration={2} // Thời gian hiệu ứng (2 giây)
                separator="," // Thêm dấu phẩy phân cách số
              />
            </h3>
          </div>
        </Col>
      </Row>
      <Row style={{ marginTop: "3rem", display: "flex" }}>
        <div style={{ width: "25%", float: "left" }}>
          <h1 style={{ marginLeft: "5rem", opacity: 0.5 }}>
            Biểu đồ thống kê đơn hàng
          </h1>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
        <div style={{ width: "50%", float: "left" }}>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
      </Row>
      <Row>
        <Line
          data={lineData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
        ;
      </Row>
    </div>
  );
}

export default DashBoard;
