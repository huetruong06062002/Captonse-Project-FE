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
import { motion, useAnimation } from "framer-motion";

import orderImage from "../../assets/image/order.png";
import customerImage from "../../assets/image/customer.png";
import serviesImage from "../../assets/image/service.png";
import extraImage from "../../assets/image/services-extra.png";
import CountUp from "react-countup";
import { Line } from "react-chartjs-2";
import domtoimage from "dom-to-image";
import { FaFileExport } from "react-icons/fa6";
import { useInView } from "react-intersection-observer";

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

// Định nghĩa các biến thể animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Hiệu ứng xuất hiện lần lượt cho các children
      delayChildren: 0.2
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const cardHoverVariants = {
  scale: 1.03,
  boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
  transition: { type: "spring", stiffness: 400, damping: 10 }
};

const iconVariants = {
  initial: { scale: 0, rotate: -90 },
  animate: { 
    scale: 1, 
    rotate: 0, 
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 } 
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const numberVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 500, damping: 30, delay: 0.4 } 
  }
};

const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 20, delay: 0.1 } 
  }
};

const chartContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const exportButtonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.5 } }
};

// Component cho Chart với animation khi scroll vào view
const AnimatedChart = ({ children, options, data, ChartComponent }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true, // Chỉ trigger animation một lần
    threshold: 0.1,    // Trigger khi 10% component hiển thị
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={chartContainerVariants}
      style={{
        position: "relative",
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}
    >
      {children}
      <div style={{ height: "300px" }}>
        <ChartComponent data={data} options={options} />
      </div>
    </motion.div>
  );
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
   const pieOptions = {
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
  const barOptions = {
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
  };

  //line chart user
  const lineData = {
    labels: ["Hôm nay", "Tuần này", "Tháng này"],
    datasets: [
      {
        label: "Khách hàng mới",
        data: [5, 20, 50], // Dữ liệu giả định, cần thay thế bằng API nếu có
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
   const lineOptions = {
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
  };

  //Export dashboard to PNG
  const exportToPNG = () => {
    if (dashboardRef.current) {
      domtoimage
        .toPng(dashboardRef.current, { bgcolor: '#f8f9fa' }) // Thêm bgcolor để nền trắng
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
    <motion.div // Bọc toàn bộ dashboard để có thể áp dụng stagger cho children
      ref={dashboardRef} 
      style={{ padding: "20px", backgroundColor: "#f8f9fa", position: "relative" }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Title */}
      <motion.h1 
        style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontWeight: 'bold' }}
        variants={titleVariants} // Áp dụng animation cho title
      >
        Dashboard Quản Trị
      </motion.h1>

      {/* Stats Cards Row */}
      <Row gutter={[20, 20]}>
        {/* Customer Card */}
        <Col xs={24} sm={12} md={6}>
          <motion.div 
            variants={cardItemVariants} // Animation cho từng card item
            whileHover={cardHoverVariants} // Animation khi hover
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              height: "100%"
            }}
          >
            <motion.div // Wrapper cho icon
              style={{
                backgroundColor: "rgba(52, 152, 219, 0.1)",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "15px"
              }}
              variants={iconVariants} // Initial animation cho icon
              initial="initial"
              animate="animate"
            >
              <motion.img // Icon với animation pulse
                src={customerImage}
                alt="Customer"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
                animate="pulse"
                variants={iconVariants}
              />
            </motion.div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#3498db",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số khách hàng
            </p>
            <motion.h3 // Wrapper cho số liệu
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants} // Animation cho số liệu
              initial="initial"
              animate="animate"
            >
              <CountUp start={0} end={numberOfCustomer} duration={2} separator="," />
            </motion.h3>
          </motion.div>
        </Col>
        
        {/* Order Card */}
         <Col xs={24} sm={12} md={6}>
          <motion.div 
            variants={cardItemVariants} // Animation cho từng card item
            whileHover={cardHoverVariants} // Animation khi hover
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              height: "100%"
            }}
          >
            <motion.div // Wrapper cho icon
              style={{
                backgroundColor: "rgba(241, 196, 15, 0.1)",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "15px"
              }}
              variants={iconVariants} // Initial animation cho icon
              initial="initial"
              animate="animate"
            >
              <motion.img // Icon với animation pulse
                src={orderImage}
                alt="Order"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
                animate="pulse"
                variants={iconVariants}
              />
            </motion.div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#f1c40f",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số đơn hàng
            </p>
            <motion.h3 // Wrapper cho số liệu
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants} // Animation cho số liệu
              initial="initial"
              animate="animate"
            >
              <CountUp start={0} end={numberOfOrder} duration={2} separator="," />
            </motion.h3>
          </motion.div>
        </Col>
        
        {/* Service Card */}
         <Col xs={24} sm={12} md={6}>
          <motion.div 
            variants={cardItemVariants} // Animation cho từng card item
            whileHover={cardHoverVariants} // Animation khi hover
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              height: "100%"
            }}
          >
            <motion.div // Wrapper cho icon
              style={{
                backgroundColor: "rgba(46, 204, 113, 0.1)",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "15px"
              }}
              variants={iconVariants} // Initial animation cho icon
              initial="initial"
              animate="animate"
            >
              <motion.img // Icon với animation pulse
                src={serviesImage}
                alt="Service"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
                animate="pulse"
                variants={iconVariants}
              />
            </motion.div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#2ecc71",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số lượng dịch vụ
            </p>
            <motion.h3 // Wrapper cho số liệu
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants} // Animation cho số liệu
              initial="initial"
              animate="animate"
            >
              <CountUp start={0} end={numberOfService} duration={2} separator="," />
            </motion.h3>
          </motion.div>
        </Col>
        
        {/* Extra Service Card */}
        <Col xs={24} sm={12} md={6}>
          <motion.div 
            variants={cardItemVariants} // Animation cho từng card item
            whileHover={cardHoverVariants} // Animation khi hover
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              height: "100%"
            }}
          >
            <motion.div // Wrapper cho icon
              style={{
                backgroundColor: "rgba(142, 68, 173, 0.1)",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "15px"
              }}
              variants={iconVariants} // Initial animation cho icon
              initial="initial"
              animate="animate"
            >
              <motion.img // Icon với animation pulse
                src={extraImage}
                alt="Extra Service"
                style={{
                  width: "30px",
                  height: "30px",
                  objectFit: "contain",
                }}
                animate="pulse"
                variants={iconVariants}
              />
            </motion.div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#8e44ad",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              Tổng số dịch vụ thêm
            </p>
            <motion.h3 // Wrapper cho số liệu
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants} // Animation cho số liệu
              initial="initial"
              animate="animate"
            >
              <CountUp start={0} end={numberOfExtra} duration={2} separator="," />
            </motion.h3>
          </motion.div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[20, 20]} style={{ marginTop: "20px" }}>
        {/* Pie Chart */}
        <Col xs={24} lg={12}>
           <AnimatedChart ChartComponent={Pie} data={pieData} options={pieOptions}>
             <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
               Biểu đồ thống kê đơn hàng
             </h2>
           </AnimatedChart>
        </Col>

        {/* Bar Chart */}
        <Col xs={24} lg={12}>
           <AnimatedChart ChartComponent={Bar} data={barData} options={barOptions}>
             <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
               Thống kê đơn hàng theo ngày, tuần, tháng
             </h2>
           </AnimatedChart>
        </Col>
      </Row>

      {/* Export Button */}
      <motion.div // Wrapper cho nút export
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          marginBottom: "20px"
        }}
        variants={exportButtonVariants} // Animation cho nút export
      >
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
      </motion.div>

      {/* Line Chart Row */}
      <Row>
        <Col span={24}>
           <AnimatedChart ChartComponent={Line} data={lineData} options={lineOptions}>
             <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
               Khách hàng mới
             </h2>
           </AnimatedChart>
        </Col>
      </Row>
    </motion.div> // Kết thúc motion.div bọc toàn bộ dashboard
  );
}

export default DashBoard;
