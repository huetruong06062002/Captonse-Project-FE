import React, { useState, useEffect, useRef } from "react";
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
import domtoimage from "dom-to-image";
import { FaFileExport } from "react-icons/fa6";

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
  // Create a reference to the dashboard div
  const dashboardRef = useRef();

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

  //Export dashboard to PNG

  const exportToPNG = () => {
    if (dashboardRef.current) {
      domtoimage
        .toPng(dashboardRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "dashboard.png"; // Tên file xuất ra
          link.href = dataUrl; // URL ảnh PNG
          link.click(); // Kích hoạt tải xuống
        })
        .catch((error) => {
          console.error("Lỗi khi xuất dashboard:", error);
        });
    } else {
      console.error("dashboardRef is null");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto", // Căn giữa nội dung
        padding: "0 1rem", // Thêm khoảng cách hai bên
        maxHeight: "90vh", // Giới hạn chiều cao tối đa (90% chiều cao màn hình)
        overflowY: "auto",
      }}
      ref={dashboardRef}
    >
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
              crossOrigin="anonymous"
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
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: "1.1rem",
              }}
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
            style={{
              marginLeft: "1rem",
              marginTop: "1rem",
              color: "#f1c40f",
            }}
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
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: "1.1rem",
              }}
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
            style={{
              marginLeft: "1rem",
              marginTop: "1rem",
              color: "#f1c40f",
            }}
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
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: "1.1rem",
              }}
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
              style={{
                textAlign: "center",
                color: "#000",
                fontSize: "1.1rem",
              }}
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
        <div style={{ width: "50%", float: "left", position: "relative" }}>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>
        {/* Export Button */}
        <button
          onClick={exportToPNG}
          style={{
            cursor: "pointer",
            position: "absolute",
            right: "5rem",
            top: "50%",
            transform: "translateY(-50%)", // Center vertically
            backgroundColor: "rgb(0, 216, 214)", // Button background color
            border: "none", // Remove border
            borderRadius: "8px", // Rounded corners
            padding: "10px 20px", // Add padding
            display: "flex", // Use flexbox for alignment
            alignItems: "center", // Center items vertically
            gap: "1rem", // Space between icon and text
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow
            transition: "all 0.3s ease", // Smooth hover effect
            width:"10rem"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgb(0, 180, 180)"; // Hover background color
            e.currentTarget.style.boxShadow = "0px 6px 8px rgba(0, 0, 0, 0.2)"; // Hover shadow
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgb(0, 216, 214)"; // Reset background color
            e.currentTarget.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)"; // Reset shadow
          }}
        >
          <FaFileExport size={30} color="#fff" />
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            Export Dashboard to PNG
          </p>
        </button>
      </Row>
      <Row>
        <Line
          data={lineData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
          }}
        />
      </Row>
    </div>
  );
}

export default DashBoard;
