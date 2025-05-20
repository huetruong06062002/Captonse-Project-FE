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
import { Col, Row, Card, Rate, Table, Modal, Button, DatePicker, Radio, Spin, message } from "antd";
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
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

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
  // State cho ratings
  const [ratingStats, setRatingStats] = useState({ totalReviews: 0, averageStar: 0 });
  const [ratingList, setRatingList] = useState([]);
  // Create a reference to the dashboard div
  const dashboardRef = useRef();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dailyStats, setDailyStats] = useState({ averageStar: 0, totalReviews: 0 });
  const [selectedWeekDate, setSelectedWeekDate] = useState(dayjs());
  const [weeklyStats, setWeeklyStats] = useState({ averageStar: 0, totalReviews: 0 });
  const [chartMode, setChartMode] = useState("day"); // "day" hoặc "week"
  const [chartLoading, setChartLoading] = useState(false);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState([dayjs().subtract(29, 'day'), dayjs()]); // 30 ngày gần nhất mặc định
  const [monthPicker, setMonthPicker] = useState(dayjs());
  const [monthlyRatings, setMonthlyRatings] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [ratingListMode, setRatingListMode] = useState('month'); // 'day' | 'week' | 'month'
  const [dayPicker, setDayPicker] = useState(dayjs());
  const [weekPicker, setWeekPicker] = useState(dayjs());
  const [listLoading, setListLoading] = useState(false);
  const [listRatings, setListRatings] = useState([]);

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

    // Fetch tổng quan đánh giá
    const fetchRatingStats = async () => {
      try {
        const res = await getRequest("ratings/statistics");
        setRatingStats(res.data);
      } catch (err) {
        setRatingStats({ totalReviews: 0, averageStar: 0 });
      }
    };
    // Fetch chi tiết đánh giá
    const fetchRatingList = async () => {
      try {
        const res = await getRequest("https://laundry.vuhai.me/api/ratings");
        setRatingList(res.data);
      } catch (err) {
        setRatingList([]);
      }
    };

    // Fetch daily stats khi đổi ngày
    const fetchDailyStats = async () => {
      try {
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const res = await getRequest(`ratings/statistics/daily?date=${dateStr}`);
        setDailyStats(res.data);
      } catch (err) {
        setDailyStats({ averageStar: 0, totalReviews: 0 });
      }
    };

    // Fetch weekly stats khi đổi ngày
    const fetchWeeklyStats = async () => {
      try {
        const dateStr = selectedWeekDate.format("YYYY-MM-DD");
        const res = await getRequest(`ratings/statistics/weekly?dateInWeek=${dateStr}`);
        setWeeklyStats(res.data);
      } catch (err) {
        setWeeklyStats({ averageStar: 0, totalReviews: 0 });
      }
    };

    fetchNumberOfCustomer();
    fetchNumberOfOrders();
    fetchNumberOfServices();
    fetchNumberOfExtras();
    fetchNumberOfOrderStatistics();
    fetchRatingStats();
    fetchRatingList();
    fetchDailyStats();
    fetchWeeklyStats();
  }, [selectedDate, selectedWeekDate]);

  // Hàm lấy mảng ngày liên tiếp
  const getDateArray = (start, end) => {
    const arr = [];
    let dt = start.startOf('day');
    while (dt.isBefore(end) || dt.isSame(end, 'day')) {
      arr.push(dt.format('YYYY-MM-DD'));
      dt = dt.add(1, 'day');
    }
    return arr;
  };
  // Hàm lấy mảng ngày đầu tuần liên tiếp
  const getWeekArray = (start, end) => {
    const arr = [];
    let dt = start.startOf('week');
    while (dt.isBefore(end) || dt.isSame(end, 'week')) {
      arr.push(dt.format('YYYY-MM-DD'));
      dt = dt.add(1, 'week');
    }
    return arr;
  };

  // Fetch dữ liệu cho chart
  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        let labels = [];
        let data = [];
        if (chartMode === "day") {
          labels = getDateArray(chartRange[0], chartRange[1]);
          const promises = labels.map(date => getRequest(`ratings/statistics/daily?date=${date}`));
          const results = await Promise.all(promises);
          data = results.map(res => res.data.averageStar || 0);
        } else if (chartMode === "week") {
          labels = getWeekArray(chartRange[0], chartRange[1]);
          const promises = labels.map(date => getRequest(`ratings/statistics/weekly?dateInWeek=${date}`));
          const results = await Promise.all(promises);
          data = results.map(res => res.data.averageStar || 0);
        } else if (chartMode === "month") {
          // Lấy mảng tháng liên tiếp
          const getMonthArray = (start, end) => {
            const arr = [];
            let dt = start.startOf('month');
            while (dt.isBefore(end) || dt.isSame(end, 'month')) {
              arr.push(dt.format('YYYY-MM'));
              dt = dt.add(1, 'month');
            }
            return arr;
          };
          labels = getMonthArray(chartRange[0], chartRange[1]);
          const promises = labels.map(monthStr => {
            const [year, month] = monthStr.split('-');
            return getRequest(`ratings/statistics/monthly?year=${year}&month=${parseInt(month, 10)}`);
          });
          const results = await Promise.all(promises);
          data = results.map(res => res.data.averageStar || 0);
        }
        setChartLabels(labels);
        setChartData(data);
      } catch (err) {
        setChartLabels([]);
        setChartData([]);
      }
      setChartLoading(false);
    };
    fetchChartData();
  }, [chartMode, chartRange]);

  // Fetch ratings theo tháng khi đổi tháng/năm và khi mở modal
  useEffect(() => {
    if (!isRatingModalOpen) return;
    const fetchMonthlyRatings = async () => {
      setMonthlyLoading(true);
      try {
        const year = monthPicker.year();
        const month = monthPicker.month() + 1;
        const res = await getRequest(`ratings/list/monthly?year=${year}&month=${month}`);
        setMonthlyRatings(res.data);
      } catch (err) {
        setMonthlyRatings([]);
      }
      setMonthlyLoading(false);
    };
    fetchMonthlyRatings();
  }, [monthPicker, isRatingModalOpen]);

  // Fetch ratings theo chế độ khi đổi mode, ngày, tuần, tháng hoặc khi mở modal
  useEffect(() => {
    if (!isRatingModalOpen) return;
    const fetchListRatings = async () => {
      setListLoading(true);
      try {
        let res;
        if (ratingListMode === 'day') {
          res = await getRequest(`ratings/list/daily?date=${dayPicker.format('YYYY-MM-DD')}`);
        } else if (ratingListMode === 'week') {
          res = await getRequest(`ratings/list/weekly?dateInWeek=${weekPicker.format('YYYY-MM-DD')}`);
        } else {
          const year = monthPicker.year();
          const month = monthPicker.month() + 1;
          res = await getRequest(`ratings/list/monthly?year=${year}&month=${month}`);
        }
        setListRatings(res.data);
      } catch (err) {
        setListRatings([]);
        message.error('Không lấy được dữ liệu đánh giá!');
      }
      setListLoading(false);
    };
    fetchListRatings();
  }, [ratingListMode, dayPicker, weekPicker, monthPicker, isRatingModalOpen]);

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
        {/* Card tổng quan đánh giá */}
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "24px 12px 20px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 260,
              background: "#fff",
              border: "none"
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#222", marginBottom: 12, textAlign: "center" }}>
              Đánh giá khách hàng
            </div>
            <div style={{ margin: "10px 0 0 0", textAlign: "center" }}>
              <Rate disabled allowHalf value={ratingStats.averageStar} style={{ fontSize: 28, color: "#FFD700" }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#222", margin: "8px 0 0 0", textAlign: "center" }}>
              {ratingStats.averageStar}/5
            </div>
            <div style={{ color: "#888", fontSize: 15, margin: "8px 0 0 0", textAlign: "center" }}>
              Tổng số đánh giá: <b style={{ color: "#222" }}>{ratingStats.totalReviews}</b>
            </div>
            <Button
              type="primary"
              style={{
                marginTop: 18,
                width: "100%",
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                background: "#1677ff",
                boxShadow: "0 2px 8px rgba(22,119,255,0.08)"
              }}
              onClick={() => setIsRatingModalOpen(true)}
            >
              Chi tiết
            </Button>
          </Card>
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
      {/* Bảng chi tiết đánh giá */}
      <Modal
        title="Chi tiết đánh giá khách hàng"
        open={isRatingModalOpen}
        onCancel={() => setIsRatingModalOpen(false)}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Radio.Group value={ratingListMode} onChange={e => setRatingListMode(e.target.value)}>
            <Radio.Button value="day">Theo ngày</Radio.Button>
            <Radio.Button value="week">Theo tuần</Radio.Button>
            <Radio.Button value="month">Theo tháng</Radio.Button>
          </Radio.Group>
          {ratingListMode === 'day' && (
            <DatePicker
              value={dayPicker}
              onChange={date => setDayPicker(date || dayjs())}
              allowClear={false}
              format="DD-MM-YYYY"
            />
          )}
          {ratingListMode === 'week' && (
            <DatePicker
              picker="week"
              value={weekPicker}
              onChange={date => setWeekPicker(date || dayjs())}
              allowClear={false}
              format="WW-YYYY"
            />
          )}
          {ratingListMode === 'month' && (
            <DatePicker
              picker="month"
              value={monthPicker}
              onChange={date => setMonthPicker(date || dayjs())}
              allowClear={false}
              format="MM-YYYY"
            />
          )}
        </div>
        <Table
          columns={[
            { title: "Mã đơn", dataIndex: "orderId", key: "orderId" },
            { title: "Khách hàng", dataIndex: "fullName", key: "fullName" },
            { title: "Số sao", dataIndex: "star", key: "star", render: (star) => <Rate disabled value={star} /> },
            { title: "Đánh giá", dataIndex: "review", key: "review", render: (text) => text || <span style={{ color: '#aaa' }}>[Không có]</span> },
            { title: "Ngày", dataIndex: "createdAt", key: "createdAt", render: (date) => new Date(date).toLocaleString() },
          ]}
          dataSource={listRatings}
          rowKey="orderId"
          loading={listLoading}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
      {/* Chart đánh giá theo ngày/tuần */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card title="Biểu đồ điểm trung bình đánh giá">
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Radio.Group value={chartMode} onChange={e => setChartMode(e.target.value)}>
                <Radio.Button value="day">Theo ngày</Radio.Button>
                <Radio.Button value="week">Theo tuần</Radio.Button>
                <Radio.Button value="month">Theo tháng</Radio.Button>
              </Radio.Group>
              {chartMode === 'month' ? (
                <DatePicker.RangePicker
                  picker="month"
                  value={chartRange}
                  onChange={range => setChartRange(range || [dayjs().subtract(11, 'month'), dayjs()])}
                  allowClear={false}
                  format="MM-YYYY"
                  style={{ marginLeft: 16 }}
                />
              ) : (
                <DatePicker.RangePicker
                  value={chartRange}
                  onChange={range => setChartRange(range || [dayjs().subtract(29, 'day'), dayjs()])}
                  allowClear={false}
                  format="DD-MM-YYYY"
                  style={{ marginLeft: 16 }}
                />
              )}
            </div>
            {chartLoading ? <Spin /> :
              <Line
                data={{
                  labels: chartLabels.map(label => {
                    if (chartMode === 'day') return dayjs(label).format('DD-MM-YYYY');
                    if (chartMode === 'week') return dayjs(label).format('DD-MM-YYYY');
                    if (chartMode === 'month') return dayjs(label, 'YYYY-MM').format('MM-YYYY');
                    return label;
                  }),
                  datasets: [
                    {
                      label: 'Điểm trung bình',
                      data: chartData,
                      borderColor: '#36A2EB',
                      backgroundColor: 'rgba(54,162,235,0.2)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: 'top' },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 5 },
                  },
                }}
                height={80}
              />
            }
          </Card>
        </Col>
      </Row>
    </motion.div> // Kết thúc motion.div bọc toàn bộ dashboard
  );
}

export default DashBoard;
