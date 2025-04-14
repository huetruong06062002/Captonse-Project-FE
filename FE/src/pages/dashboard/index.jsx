import React, { useState, useEffect, useRef } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import { getRequest } from "@services/api";
import { Col, Row } from "antd";
import { motion } from "framer-motion";

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
  PointElement,
  LineElement,
  ArcElement
);

// Hàm tạo hiệu ứng tuyết
const generateSnowflakes = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // vị trí x ngẫu nhiên (0-100%)
    size: Math.random() * 10 + 5, // kích thước ngẫu nhiên (5-15px)
    duration: Math.random() * 20 + 15, // thời gian rơi ngẫu nhiên (15-35s)
    delay: Math.random() * 5, // độ trễ ngẫu nhiên (0-5s)
    blur: Math.random() * 3, // độ mờ ngẫu nhiên (0-3px)
    opacity: Math.random() * 0.5 + 0.3, // độ trong suốt ngẫu nhiên (0.3-0.8)
    rotation: Math.random() * 360, // góc xoay ngẫu nhiên (0-360 độ)
    symbol: i % 3 === 0 ? '❄' : i % 3 === 1 ? '❅' : '❆',
  }));
};

// Các biến thể animation cho tuyết rơi
const snowflakeVariant = {
  animate: (custom) => ({
    y: ["-10vh", "100vh"],
    x: [
      `${custom.x}vw`,
      `${custom.x - 10 + Math.random() * 20}vw`,
      `${custom.x - 5 + Math.random() * 10}vw`,
      `${custom.x + 5 + Math.random() * 15}vw`,
      `${custom.x - 5 + Math.random() * 10}vw`,
    ],
    rotate: [custom.rotation, custom.rotation + 360],
    scale: [0.8, 1.2, 0.8],
    transition: {
      y: {
        duration: custom.duration,
        repeat: Infinity,
        delay: custom.delay,
        ease: "linear",
      },
      x: {
        duration: custom.duration,
        repeat: Infinity,
        delay: custom.delay,
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut",
      },
      rotate: {
        duration: custom.duration / 2,
        repeat: Infinity,
        delay: custom.delay,
        ease: "linear",
      },
      scale: {
        duration: custom.duration / 3,
        repeat: Infinity,
        delay: custom.delay,
        ease: "easeInOut",
      }
    }
  })
};

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
  
  // Create snowflakes
  const snowflakes = generateSnowflakes(50);

  useEffect(() => {
    const fetchNumberOfCustomer = async () => {
      try {
        const response = await getRequest("DashBoard/get-customers-number");
        setNumberOfCustomer(response.data.customersNumber);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchNumberOfOrders = async () => {
      try {
        const response = await getRequest("DashBoard/get-all-orders-numbers");
        setNumberOfOrder(response.data.orderNumbers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchNumberOfServices = async () => {
      try {
        const response = await getRequest("DashBoard/get-all-services-numbers");
        setNumberOfService(response.data.servicesNumbers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchNumberOfExtras = async () => {
      try {
        const response = await getRequest("DashBoard/get-all-extras-numbers");
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

  if (!orderStats) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Loading...</div>
      {/* Snowflake effect while loading */}
      {snowflakes.slice(0, 20).map((flake) => (
        <motion.div
          key={flake.id}
          variants={snowflakeVariant}
          custom={flake}
          animate="animate"
          style={{
            position: "fixed",
            fontSize: `${flake.size}px`,
            left: `${flake.x}vw`,
            top: "-5vh",
            color: "#3bb77e",
            filter: `blur(${flake.blur}px)`,
            opacity: flake.opacity,
            zIndex: 1000,
            textShadow: "0 0 5px white",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {flake.symbol}
        </motion.div>
      ))}
    </div>
  );

  // ChartJS data for statusStatistics (Pie Chart)
  const pieData = {
    labels: orderStats.statusStatistics.map((item) => item.status),
    datasets: [
      {
        data: orderStats.statusStatistics.map((item) => item.count),
        backgroundColor: orderStats.statusStatistics.map(
          (_, index) => colors[index % colors.length]
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
        backgroundColor: ["#FF9F40", "#4BC0C0", "#FFCD56", "#FF6384"],
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
        data: [5, 20, 50],
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
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
          link.download = "dashboard.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error("Lỗi khi xuất dashboard:", error);
        });
    } else {
      console.error("dashboardRef is null");
    }
  };

  return (
    <div ref={dashboardRef} style={{ padding: "20px", backgroundColor: "#f8f9fa", position: "relative" }}>
      {/* Snowfall effect */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          variants={snowflakeVariant}
          custom={flake}
          animate="animate"
          style={{
            position: "fixed",
            fontSize: `${flake.size}px`,
            left: `${flake.x}vw`,
            top: "-5vh",
            color: "#3bb77e",
            filter: `blur(${flake.blur}px)`,
            opacity: flake.opacity,
            zIndex: 1000,
            textShadow: "0 0 5px white",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {flake.symbol}
        </motion.div>
      ))}
      
      {/* Stats Cards Row */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} md={6}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "100%"
          }}>
            <div style={{
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <img
                src={customerImage}
                alt="Customer"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
              />
            </div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#3498db",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số khách hàng
            </p>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: 0,
              textAlign: "center"
            }}>
              <CountUp start={0} end={numberOfCustomer} duration={2} separator="," />
            </h3>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "100%"
          }}>
            <div style={{
              backgroundColor: "rgba(241, 196, 15, 0.1)",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <img
                src={orderImage}
                alt="Order"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
              />
            </div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#f1c40f",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số đơn hàng
            </p>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: 0,
              textAlign: "center"
            }}>
              <CountUp start={0} end={numberOfOrder} duration={2} separator="," />
            </h3>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "100%"
          }}>
            <div style={{
              backgroundColor: "rgba(46, 204, 113, 0.1)",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <img
                src={serviesImage}
                alt="Service"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
              />
            </div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#2ecc71",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số lượng dịch vụ
            </p>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: 0,
              textAlign: "center"
            }}>
              <CountUp start={0} end={numberOfService} duration={2} separator="," />
            </h3>
          </div>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            height: "100%"
          }}>
            <div style={{
              backgroundColor: "rgba(142, 68, 173, 0.1)",
              borderRadius: "50%",
              width: "60px",
              height: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <img
                src={extraImage}
                alt="Extra Service"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
              />
            </div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#8e44ad",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số dịch vụ thêm
            </p>
            <h3 style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: 0,
              textAlign: "center"
            }}>
              <CountUp start={0} end={numberOfExtra} duration={2} separator="," />
            </h3>
          </div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[20, 20]} style={{ marginTop: "20px" }}>
        <Col xs={24} lg={12}>
          <div style={{
            position: "relative",
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "1px solid #f0f0f0"
            }}>
              Biểu đồ thống kê đơn hàng
            </h2>
            <div style={{ height: "300px" }}>
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div style={{
            position: "relative",
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "1px solid #f0f0f0"
            }}>
              Thống kế đơn hàng theo tính theo ngày, tuần, tháng
            </h2>
            <div style={{ height: "300px" }}>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Export Button */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "20px",
        marginBottom: "20px"
      }}>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToPNG}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#3bb77e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease"
          }}
        >
          <FaFileExport size={16} />
          <span>Export Dashboard</span>
        </motion.button>
      </div>

      {/* Line Chart Row */}
      <Row>
        <Col span={24}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              paddingBottom: "10px",
              borderBottom: "1px solid #f0f0f0"
            }}>
              Khách hàng mới
            </h2>
            <div style={{ height: "300px" }}>
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: "top"
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default DashBoard;
