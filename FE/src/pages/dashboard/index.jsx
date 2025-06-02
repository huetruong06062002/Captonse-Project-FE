import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { Col, Row, Card, Rate, Table, Modal, Button, DatePicker, Radio, Spin, message, Tag } from "antd";
import { motion, useAnimation } from "framer-motion";

import orderImage from "../../assets/image/order.png";
import customerImage from "../../assets/image/customer.png";
import revenueImage from "../../assets/image/revenue.png";

import serviesImage from "../../assets/image/service.png";
import extraImage from "../../assets/image/services-extra.png";
import CountUp from "react-countup";
import { Line } from "react-chartjs-2";
import domtoimage from "dom-to-image";
import { FaFileExport } from "react-icons/fa";
import { BsCalendarDay, BsCalendarMonth, BsCalendar } from "react-icons/bs";
import { BiMoney, BiCreditCard } from "react-icons/bi";
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
const AnimatedChart = ({ children, options, data, ChartComponent, footerContent }) => {
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
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        height: "100%",
        minHeight: "430px",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {children}
      <div style={{ height: "340px", flex: 1 }}>
        <ChartComponent data={data} options={options} />
      </div>
      {footerContent && (
        <div style={{ marginTop: "auto", paddingTop: "15px" }}>
          {footerContent}
        </div>
      )}
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
  const [totalRevenue, setTotalRevenue] = useState(0);
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

  // States for revenue charts
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [paymentMethodsRevenue, setPaymentMethodsRevenue] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [revenueTimeMode, setRevenueTimeMode] = useState("monthly"); // "daily", "monthly", "yearly"
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueByDate, setRevenueByDate] = useState({});
  const [revenueDateRange, setRevenueDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

  // Thêm state riêng cho biểu đồ doanh thu theo thời gian
  const [timeChartData, setTimeChartData] = useState([]);
  const [timeChartLoading, setTimeChartLoading] = useState(false);
  
  // Thêm state riêng cho biểu đồ doanh thu theo khoảng ngày
  const [dateRangeChartData, setDateRangeChartData] = useState({});
  const [dateRangeChartLoading, setDateRangeChartLoading] = useState(false);

  // Thêm state cho modal chi tiết phương thức thanh toán
  const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentDetailLoading, setPaymentDetailLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState([]);

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

    const fetchTotalRevenue = async () => {
      try {
        const response = await getRequest("DashBoard/get-total-revenue");
        setTotalRevenue(response.data.totalRevenue);
      } catch (error) {
        setTotalRevenue(0);
      }
    };

    // Fetch phương thức thanh toán và doanh thu theo phương thức
    const fetchPaymentMethodsData = async () => {
      try {
        const response = await getRequest("DashBoard/get-revenue-by-all-payment-methods");
        setPaymentMethodsRevenue(response.data);
      } catch (error) {
        console.error("Error fetching payment methods revenue:", error);
        setPaymentMethodsRevenue([]);
      }
    };
    
    // Fetch doanh thu theo ngày hiện tại
    const fetchDailyRevenue = async () => {
      try {
        const today = dayjs().format("YYYY-MM-DD");
        const response = await getRequest(`DashBoard/get-daily-revenue?date=${today}`);
        setDailyRevenue([response.data]);
      } catch (error) {
        console.error("Error fetching daily revenue:", error);
        setDailyRevenue([]);
      }
    };

    // Fetch doanh thu theo tháng hiện tại
    const fetchMonthlyRevenue = async () => {
      try {
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month() + 1;
        const response = await getRequest(`DashBoard/get-monthly-revenue?month=${currentMonth}&year=${currentYear}`);
        setMonthlyRevenue([response.data]);
      } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        setMonthlyRevenue([]);
      }
    };

    // Fetch doanh thu theo năm hiện tại
    const fetchYearlyRevenue = async () => {
      try {
        const currentYear = dayjs().year();
        const response = await getRequest(`DashBoard/get-yearly-revenue?year=${currentYear}`);
        setYearlyRevenue([response.data]);
      } catch (error) {
        console.error("Error fetching yearly revenue:", error);
        setYearlyRevenue([]);
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
    fetchTotalRevenue();
    
    // New fetches
    fetchPaymentMethodsData();
    fetchDailyRevenue();
    fetchMonthlyRevenue();
    fetchYearlyRevenue();
  }, [selectedDate, selectedWeekDate]);

  // Fetch doanh thu theo thời gian dựa vào mode
  useEffect(() => {
    const fetchRevenueByTime = async () => {
      setTimeChartLoading(true);
      try {
        let finalRevenue = 0;
        if (revenueTimeMode === "daily") {
          const today = dayjs().format("YYYY-MM-DD");
          const response = await getRequest(`DashBoard/get-daily-revenue?date=${today}`);
          finalRevenue = response.data.revenue || 0;
        } else if (revenueTimeMode === "monthly") {
          const currentYear = dayjs().year();
          const currentMonth = dayjs().month() + 1;
          const response = await getRequest(`DashBoard/get-monthly-revenue?month=${currentMonth}&year=${currentYear}`);
          finalRevenue = response.data.revenue || 0;
        } else if (revenueTimeMode === "yearly") {
          const currentYear = dayjs().year();
          const response = await getRequest(`DashBoard/get-yearly-revenue?year=${currentYear}`);
          finalRevenue = response.data.revenue || 0;
        }
        
        // Tạo dữ liệu tăng dần từ 0 đến finalRevenue cho biểu đồ thời gian
        const createGrowingData = (finalValue) => {
          const result = [0];
          const pointCount = 10;
          
          for (let i = 1; i < pointCount - 1; i++) {
            const factor = Math.pow(i / (pointCount - 1), 1.5);
            result.push(Math.round(finalValue * factor));
          }
          
          result.push(finalValue);
          return result;
        };
        
        setTimeChartData(createGrowingData(finalRevenue));
      } catch (error) {
        console.error(`Error fetching ${revenueTimeMode} revenue:`, error);
        setTimeChartData([]);
      }
      setTimeChartLoading(false);
    };

    fetchRevenueByTime();
  }, [revenueTimeMode]);

  // Fetch chi tiết doanh thu khi thay đổi khoảng thời gian
  useEffect(() => {
    const fetchRevenueDetail = async () => {
      if (!revenueDateRange[0] || !revenueDateRange[1]) return;
      
      setDateRangeChartLoading(true);
      try {
        const startDate = revenueDateRange[0].format("YYYY-MM-DD");
        const endDate = revenueDateRange[1].format("YYYY-MM-DD");
        
        const response = await getRequest(
          `DashBoard/get-revenue-detail?startDate=${startDate}&endDate=${endDate}&paymentMethodId=783fe21c-a440-40a6-b374-04d408f665d7`
        );
        setDateRangeChartData(response.data.revenueByDate || {});
      } catch (error) {
        console.error("Error fetching revenue detail:", error);
        setDateRangeChartData({});
      }
      setDateRangeChartLoading(false);
    };

    fetchRevenueDetail();
  }, [revenueDateRange]);

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
          data = results.map(res => ({
            averageStar: res.data.averageStar || 0,
            totalReviews: res.data.totalReviews || 0,
            totalRatings: res.data.totalRatings || 0,
          }));
        } else if (chartMode === "week") {
          labels = getWeekArray(chartRange[0], chartRange[1]);
          const promises = labels.map(date => getRequest(`ratings/statistics/weekly?dateInWeek=${date}`));
          const results = await Promise.all(promises);
          data = results.map(res => ({
            averageStar: res.data.averageStar || 0,
            totalReviews: res.data.totalReviews || 0,
            totalRatings: res.data.totalRatings || 0,
          }));
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
          data = results.map(res => ({
            averageStar: res.data.averageStar || 0,
            totalReviews: res.data.totalReviews || 0,
            totalRatings: res.data.totalRatings || 0,
          }));
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

  // Thêm hàm để lấy chi tiết phương thức thanh toán
  const fetchPaymentMethodDetails = async () => {
    setPaymentDetailLoading(true);
    try {
      const response = await getRequest(`DashBoard/get-all-payment-methods?activeOnly=true`);
      if (response.data && response.data.length > 0) {
        // Lưu toàn bộ dữ liệu từ API
        setPaymentDetails(response.data);
        setSelectedPaymentMethod(null); // Không cần select method cụ thể nữa
      }
    } catch (error) {
      console.error("Error fetching payment method details:", error);
      message.error("Không thể lấy thông tin chi tiết phương thức thanh toán");
      setPaymentDetails([]);
      setSelectedPaymentMethod(null);
    }
    setPaymentDetailLoading(false);
  };

  // Hàm xử lý khi nhấp vào nút chi tiết
  const handleViewPaymentDetails = () => {
    fetchPaymentMethodDetails();
    setIsPaymentDetailModalOpen(true);
  };

  // Memoize dữ liệu cho biểu đồ doanh thu theo thời gian để tránh re-render không cần thiết
  const { revenueTimeData, revenueTimeTitle } = useMemo(() => {
    let label = "";
    let title = "";

    if (revenueTimeMode === "daily") {
      label = dayjs().format('DD/MM/YYYY');
      title = "Doanh thu hôm nay";
    } else if (revenueTimeMode === "monthly") {
      label = dayjs().format('MM/YYYY');
      title = "Doanh thu tháng này";
    } else if (revenueTimeMode === "yearly") {
      label = dayjs().format('YYYY');
      title = "Doanh thu năm này";
    }

    // Đặt nhãn thời gian ở giữa biểu đồ (vị trí thứ 5 trong mảng 10 phần tử)
    const labels = ["", "", "", "", label, "", "", "", "", ""];

    return {
      revenueTimeData: {
        labels,
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: timeChartData,
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 4,
            tension: 0.4,
            fill: true,
            pointRadius: 0
          }
        ]
      },
      revenueTimeTitle: title
    };
  }, [revenueTimeMode, timeChartData]); // Chỉ re-calculate khi revenueTimeMode hoặc timeChartData thay đổi
  
  // Memoize dữ liệu cho biểu đồ phương thức thanh toán
  const paymentMethodPieData = useMemo(() => {
    if (!paymentMethodsRevenue || paymentMethodsRevenue.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      };
    }
    
    // Thay đổi tên hiển thị của các phương thức thanh toán
    const labels = paymentMethodsRevenue.map(item => {
      if (item.name === 'Cash') return 'Tiền mặt';
      if (item.name === 'PayOS') return 'Thanh toán online';
      return item.name || 'Không xác định';
    });
    const data = paymentMethodsRevenue.map(item => item.totalRevenue || 0);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, index) => colors[index % colors.length]),
          borderWidth: 1,
          hoverOffset: 4
        }
      ]
    };
  }, [paymentMethodsRevenue]);

  // Memoize dữ liệu cho biểu đồ doanh thu theo ngày để tránh re-render không cần thiết
  const revenueByDateData = useMemo(() => {
    const labels = Object.keys(dateRangeChartData).sort();
    
    // Tạo dữ liệu tăng dần từ 0 đến các giá trị doanh thu
    let data = [];
    if (labels.length > 0) {
      data = [0]; // Bắt đầu từ 0
      const values = labels.map(date => dateRangeChartData[date]);
      const maxRevenue = Math.max(...values);
      const step = maxRevenue / (labels.length);
      
      for (let i = 0; i < labels.length - 1; i++) {
        // Sử dụng index thay vì Math.random để tránh thay đổi liên tục
        const factor = 0.85 + (i % 3) * 0.1; // Tạo biến động có quy luật thay vì random
        data.push(Math.round(step * (i + 1) * factor));
      }
      
      data.push(maxRevenue); // Kết thúc với giá trị cao nhất
    }
    
    return {
      labels: labels.map(date => dayjs(date).format('DD/MM/YYYY')),
      datasets: [
        {
          label: 'Doanh thu theo ngày (VNĐ)',
          data,
          borderColor: 'rgba(46, 204, 113, 1)',
          backgroundColor: 'rgba(46, 204, 113, 0.2)',
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
  }, [dateRangeChartData]); // Chỉ re-calculate khi dateRangeChartData thay đổi

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

  // Tính max cho cả 2 trục (lấy max của 5 và các giá trị lớn nhất của totalReviews, totalRatings)
  const maxY = Math.max(
    5,
    ...chartData.map(d => d.totalReviews || 0),
    ...chartData.map(d => d.totalRatings || 0)
  );

  return (
    <motion.div // Bọc toàn bộ dashboard để có thể áp dụng stagger cho children
      ref={dashboardRef} 
      style={{ padding: "20px", backgroundColor: "#f8f9fa", position: "relative" }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Cards Row */}
      <Row gutter={[20, 20]}>
        {/* Total Revenue Card - full width */}
        <Col xs={24}>
          <motion.div 
            variants={cardItemVariants}
            whileHover={cardHoverVariants}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px 0 32px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(255,99,132,0.08)",
              marginBottom: 24,
              width: "100%"
            }}
          >
            <motion.div // Wrapper cho icon
              style={{
                backgroundColor: "rgba(255, 99, 132, 0.12)",
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "18px"
              }}
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <motion.img // Icon với animation pulse
                src={revenueImage}
                alt="Total-Revenue"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                }}
                animate="pulse"
                variants={iconVariants}
              />
            </motion.div>
            <p style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#FF6384",
              marginBottom: "12px",
              textAlign: "center"
            }}>
              Tổng doanh thu
            </p>
            <motion.h3
              style={{
                fontSize: "38px",
                fontWeight: "800",
                margin: 0,
                textAlign: "center",
                color: "#222"
              }}
              variants={numberVariants}
              initial="initial"
              animate="animate"
            >
              <CountUp start={0} end={totalRevenue} duration={2} separator="," /> vnđ
            </motion.h3>
          </motion.div>
        </Col>
      </Row>

      {/* Row cho 4 card ngay dưới tổng doanh thu */}
      <Row gutter={[20, 20]} style={{ marginBottom: "24px" }}>
        {/* Customer Card */}
        <Col xs={24} sm={12} md={6}>
          <motion.div 
            variants={cardItemVariants}
            whileHover={cardHoverVariants}
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
            <motion.div
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
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <motion.img
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
            <motion.h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants}
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
            variants={cardItemVariants}
            whileHover={cardHoverVariants}
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
            <motion.div
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
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <motion.img
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
            <motion.h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants}
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
            variants={cardItemVariants}
            whileHover={cardHoverVariants}
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
            <motion.div
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
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <motion.img
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
            <motion.h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants}
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
            variants={cardItemVariants}
            whileHover={cardHoverVariants}
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
            <motion.div
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
              variants={iconVariants}
              initial="initial"
              animate="animate"
            >
              <motion.img
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
            <motion.h3
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                textAlign: "center"
              }}
              variants={numberVariants}
              initial="initial"
              animate="animate"
            >
              <CountUp start={0} end={numberOfExtra} duration={2} separator="," />
            </motion.h3>
          </motion.div>
        </Col>
      </Row>
      
      {/* Revenue Charts Row - Biểu đồ doanh thu theo phương thức thanh toán và doanh thu theo thời gian */}
      <Row gutter={[20, 20]} style={{ marginBottom: "24px" }}>
        {/* Payment Method Chart */}
        <Col xs={24} lg={12}>
          <AnimatedChart
            ChartComponent={Pie}
            data={paymentMethodPieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 15,
                    padding: 10,
                    font: { size: 12 }
                  }
                },
                title: {
                  display: true,
                  text: 'Doanh thu theo phương thức thanh toán',
                  font: { size: 16, weight: 'bold' }
                }
              }
            }}
            footerContent={
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="primary" 
                  onClick={handleViewPaymentDetails} 
                  style={{ backgroundColor: '#FF6384', borderColor: '#FF6384', width: '100%', borderRadius: 20 }}
                >
                  Chi tiết
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <BiMoney style={{ marginRight: 10, color: '#FF6384' }} />
              <span style={{ fontWeight: 600 }}>Theo phương thức thanh toán</span>
            </div>
          </AnimatedChart>
        </Col>
        
        {/* Revenue by Time Chart */}
        <Col xs={24} lg={12}>
          <AnimatedChart
            ChartComponent={Line}
            data={revenueTimeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: revenueTimeTitle,
                  font: { size: 16, weight: 'bold' }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Doanh thu (VNĐ)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      weight: 'bold',
                      size: 16
                    },
                    color: '#2e7d32', // Màu xanh lá cây đậm cho nhãn
                    maxRotation: 0, // Không xoay nhãn, để nằm ngang
                    minRotation: 0
                  }
                }
              }
            }}
          >
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Radio.Group 
                value={revenueTimeMode} 
                onChange={e => setRevenueTimeMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="daily">
                  <BsCalendarDay style={{ marginRight: 6 }} />
                  Ngày
                </Radio.Button>
                <Radio.Button value="monthly">
                  <BsCalendarMonth style={{ marginRight: 6 }} />
                  Tháng
                </Radio.Button>
                <Radio.Button value="yearly">
                  <BsCalendar style={{ marginRight: 6 }} />
                  Năm
                </Radio.Button>
              </Radio.Group>
              {timeChartLoading && <Spin size="small" style={{ marginLeft: 12 }} />}
            </div>
          </AnimatedChart>
        </Col>
      </Row>
      
      {/* Revenue by Date Range Chart - Biểu đồ doanh thu theo khoảng ngày */}
      <Row gutter={[20, 20]} style={{ marginBottom: "24px" }}>
        <Col xs={24}>
          <AnimatedChart
            ChartComponent={Line}
            data={revenueByDateData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  display: true,
                  position: 'top'
                },
                title: {
                  display: true,
                  text: 'Doanh thu theo khoảng thời gian',
                  font: { size: 16, weight: 'bold' }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Doanh thu (VNĐ)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }}
          >
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <DatePicker.RangePicker
                value={revenueDateRange}
                onChange={range => setRevenueDateRange(range || [dayjs().subtract(7, 'day'), dayjs()])}
                allowClear={false}
                format="DD-MM-YYYY"
                style={{ width: 300 }}
              />
              {dateRangeChartLoading && <Spin size="small" style={{ marginLeft: 12 }} />}
            </div>
          </AnimatedChart>
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

      {/* Card Đánh giá khách hàng + Biểu đồ điểm trung bình đánh giá (tổng quan ở trên, biểu đồ kéo dài bên dưới) */}
      <div style={{ marginBottom: 32 }}>
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "24px 12px 20px 12px",
            background: "#fff",
            border: "none",
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          bodyStyle={{ padding: 0, width: '100%' }}
          title={<div style={{ fontSize: 20, fontWeight: 700, color: "#222", textAlign: "center" }}>Đánh giá khách hàng</div>}
        >
          {/* Tổng quan */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Rate disabled allowHalf value={ratingStats.averageStar} style={{ fontSize: 28, color: "#FFD700" }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: "8px 0 0 0" }}>{ratingStats.averageStar}/5</div>
            <div style={{ color: "#888", fontSize: 15, margin: "8px 0 0 0" }}>
              Tổng số nhận xét: <b style={{ color: "#222" }}>{ratingStats.totalReviews}</b> <br/>
              Số lượng đánh giá: <b style={{ color: "#222" }}>{ratingStats.totalRatings}</b>
            </div>
            <Button
              type="primary"
              style={{
                margin: '24px auto 0 auto',
                display: 'block',
                width: 180,
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                background: "#1677ff",
                boxShadow: "0 2px 8px rgba(22,119,255,0.08)"
              }}
              onClick={() => {
                setRatingListMode('day');
                setIsRatingModalOpen(true);
              }}
            >
              Chi tiết
            </Button>
          </div>
          {/* Biểu đồ */}
          <div style={{ width: '100%' }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
                      data: chartData.map(d => d.averageStar),
                      borderColor: '#36A2EB',
                      backgroundColor: 'rgba(54,162,235,0.2)',
                      tension: 0.4,
                      fill: true,
                      yAxisID: 'y',
                    },
                    {
                      label: 'Tổng số đánh giá',
                      data: chartData.map(d => d.totalReviews),
                      borderColor: '#FF6384',
                      backgroundColor: 'rgba(255,99,132,0.2)',
                      tension: 0.4,
                      fill: false,
                      yAxisID: 'y1',
                    },
                    {
                      label: 'Tổng số rating',
                      data: chartData.map(d => d.totalRatings),
                      borderColor: '#4BC0C0',
                      backgroundColor: 'rgba(75,192,192,0.2)',
                      tension: 0.4,
                      fill: false,
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: 'top' },
                  },
                  scales: {
                    y: { beginAtZero: true, max: maxY, position: 'left', title: { display: true, text: 'Số lượng' } },
                    y1: { beginAtZero: true, max: maxY, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Số lượng' } },
                    x: {
                      ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                }}
                height={80}
              />
            }
          </div>
        </Card>
      </div>

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

      {/* Modal hiển thị chi tiết phương thức thanh toán */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            Chi tiết tất cả phương thức thanh toán
          </div>
        }
        open={isPaymentDetailModalOpen}
        onCancel={() => setIsPaymentDetailModalOpen(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        {paymentDetailLoading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {paymentDetails.map((paymentMethod, index) => (
              <div key={paymentMethod.paymentMethodId} style={{ marginBottom: 32 }}>
                {/* Header cho mỗi phương thức thanh toán */}
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '16px 20px', 
                  borderRadius: '8px',
                  marginBottom: 16,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>
                        {paymentMethod.name === 'Cash' ? 'Tiền mặt' : 
                         paymentMethod.name === 'PayOS' ? 'Thanh toán online' : 
                         paymentMethod.name}
                      </h3>
                      <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 14 }}>
                        {paymentMethod.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#1890ff' }}>
                          {paymentMethod.orderCount}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>Đơn hàng</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#52c41a' }}>
                          {paymentMethod.totalRevenue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>VNĐ</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Tag color={paymentMethod.isActive ? 'green' : 'red'}>
                          {paymentMethod.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bảng chi tiết đơn hàng */}
                <Table
                  dataSource={paymentMethod.orderDetails}
                  rowKey="orderId"
                  size="small"
                  pagination={{ 
                    pageSize: 5,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    showTotal: (total) => `Tổng ${total} đơn hàng`
                  }}
                  columns={[
                    { 
                      title: 'Mã đơn hàng', 
                      dataIndex: 'orderId', 
                      key: 'orderId',
                      width: 130,
                      render: (text) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>
                    },
                    { 
                      title: 'Khách hàng', 
                      dataIndex: 'customerName', 
                      key: 'customerName',
                      width: 150
                    },
                    { 
                      title: 'SĐT', 
                      dataIndex: 'customerPhone', 
                      key: 'customerPhone',
                      width: 120
                    },
                    { 
                      title: 'Số tiền', 
                      dataIndex: 'amount', 
                      key: 'amount',
                      width: 120,
                      render: (amount) => (
                        <span style={{ fontWeight: 600, color: '#52c41a' }}>
                          {amount.toLocaleString()} VNĐ
                        </span>
                      )
                    },
                    { 
                      title: 'Trạng thái TT', 
                      dataIndex: 'paymentStatus', 
                      key: 'paymentStatus',
                      width: 120,
                      render: (status) => (
                        <Tag color={status === 'PAID' ? 'green' : 'orange'}>
                          {status === 'PAID' ? 'Đã thanh toán' : status}
                        </Tag>
                      )
                    },
                    { 
                      title: 'Trạng thái đơn', 
                      dataIndex: 'orderStatus', 
                      key: 'orderStatus',
                      width: 120,
                      render: (status) => {
                        const statusColors = {
                          'COMPLETED': 'green',
                          'DELIVERED': 'blue', 
                          'COMPLAINT': 'red',
                          'PROCESSING': 'orange',
                          'CANCELLED': 'red'
                        };
                        const statusTexts = {
                          'COMPLETED': 'Hoàn thành',
                          'DELIVERED': 'Đã giao',
                          'COMPLAINT': 'Khiếu nại',
                          'PROCESSING': 'Đang xử lý',
                          'CANCELLED': 'Đã hủy'
                        };
                        return (
                          <Tag color={statusColors[status] || 'default'}>
                            {statusTexts[status] || status}
                          </Tag>
                        );
                      }
                    },
                    { 
                      title: 'Ngày thanh toán', 
                      dataIndex: 'paymentDate', 
                      key: 'paymentDate',
                      width: 150,
                      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
                    }
                  ]}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </motion.div> // Kết thúc motion.div bọc toàn bộ dashboard
  );
}

export default DashBoard;
