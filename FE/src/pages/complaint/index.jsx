import { Tabs, Table, Modal, Button, message, Spin, Descriptions, Tag, Form, Input } from "antd";
import { useState, useEffect } from "react";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
const { TabPane } = Tabs;
const { TextArea } = Input;
import "./index.css";
import { Helmet } from "react-helmet";
import { getRequest, postRequest } from "@services/api";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import 'moment/locale/vi';

moment.locale('vi');

const Complaint = () => {
  const [complaintPending, setComplaintPending] = useState([]);
  const [compaintInProgress, setComplaintInProgress] = useState([]);
  const [complaintResolved, setComplaintResolved] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [currentComplaintId, setCurrentComplaintId] = useState(null);
  const [resolveForm] = Form.useForm();

  const getComplaintPending = async () => {
    try {
      const response = await getRequest("/complaints/pending");
      if (response && response.data) {
        // Đảm bảo dữ liệu là mảng
        const data = Array.isArray(response.data) ? response.data : [];
        setComplaintPending(data);
      }
    } catch (error) {
      console.error("Error fetching pending complaints:", error);
    }
  };

  const getComplaintInProgress = async () => {
    try {
      const response = await getRequest("/complaints/in-progress");
      if (response && response.data) {
        // Đảm bảo dữ liệu là mảng
        const data = Array.isArray(response.data) ? response.data : [];
        setComplaintInProgress(data);
      }
    } catch (error) {
      console.error("Error fetching in-progress complaints:", error);
    }
  };

  const getComplaintResolved = async () => {
    try {
      const response = await getRequest("/complaints/resolved");
      if (response && response.data) {
        // Đảm bảo dữ liệu là mảng
        const data = Array.isArray(response.data) ? response.data : [];
        setComplaintResolved(data);
      }
    } catch (error) {
      console.error("Error fetching resolved complaints:", error);
    }
  };

  const handleCreateComplaint = async () => {
    const token = localStorage.getItem("accessToken");
    const data = {
      complaintDescription: "Đơn hàng cần khiếu nại",
      complaintType: "Sai dịch vụ",
    };

    try {
      await axios.post(
        `http://localhost:5239/api/complaints/250414E1TVAS/admin-customerstaff`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      message.success("Tạo khiếu nại thành công!");
    } catch (err) {
      message.error("Tạo khiếu nại thất bại!");
      console.error(err);
    }
  };

  // Hàm lấy chi tiết khiếu nại
  const getComplaintDetail = async (complaintId) => {
    setDetailLoading(true);
    try {
      const response = await getRequest(`/complaints/${complaintId}/detail`);
      setDetail(response.data);
    } catch (error) {
      console.error("Error fetching complaint detail:", error);
      message.error("Không thể tải chi tiết khiếu nại");
    } finally {
      setDetailLoading(false);
    }
  };

  // Xử lý khi nhấn vào nút Chi tiết
  const handleViewDetail = (record) => {
    setModalVisible(true);
    getComplaintDetail(record.complaintId);
  };

  // Thêm 2 hàm xử lý mới 
  const handleTakeComplaint = async (complaintId) => {
    try {
      setLoading(true);
      await postRequest(`/complaints/${complaintId}/accept`, {});
      message.success("Đã nhận xử lý khiếu nại!");
      
      // Refresh data trong try-catch riêng để tránh lỗi ảnh hưởng đến UI
      try {
        await getComplaintPending();
        await getComplaintInProgress();
      } catch (refreshError) {
        console.error("Error refreshing data:", refreshError);
      }
    } catch (error) {
      console.error("Error taking complaint:", error);
      message.error("Không thể nhận xử lý khiếu nại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý hoàn thành khiếu nại
  const handleResolveComplaint = (complaintId) => {
    setCurrentComplaintId(complaintId);
    // Reset form và đặt giá trị mặc định
    resolveForm.resetFields();
    resolveForm.setFieldsValue({
      resolutionDetails: "Đã xử lý và giải quyết khiếu nại"
    });
    setResolveModalVisible(true);
  };

  // Hàm xử lý khi click nút Xác nhận trong modal
  const handleResolveConfirm = async () => {
    try {
      // Validate và lấy giá trị form
      const values = await resolveForm.validateFields();
      
      setLoading(true);
      setResolveModalVisible(false);
      await postRequest(`/complaints/${currentComplaintId}/complete`, 
        values.resolutionDetails
      );
      message.success("Đã hoàn thành xử lý khiếu nại!");
      
      // Refresh data trong try-catch riêng để tránh lỗi ảnh hưởng đến UI
      try {
        await getComplaintPending();
        await getComplaintInProgress();
        await getComplaintResolved();
      } catch (refreshError) {
        console.error("Error refreshing data:", refreshError);
      }
    } catch (error) {
      if (error.errorFields) {
        return; // Form validation error
      }
      console.error("Error resolving complaint:", error);
      message.error("Không thể hoàn thành xử lý khiếu nại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getComplaintPending();
    getComplaintInProgress();
    getComplaintResolved();
    // 1. Tạo connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://laundry.vuhai.me/complaintHub") // Đúng endpoint hub backend của bạn
      .withAutomaticReconnect()
      .build();

    // 2. Lắng nghe sự kiện ReceiveComplaintUpdate
    connection.on("ReceiveComplaintUpdate", (pendingComplaints) => {
      // pendingComplaints là dữ liệu backend gửi về
      // Cập nhật state cho tab pending

      console.log("pendingComplaints", pendingComplaints);

      // Đảm bảo dữ liệu là mảng
      const data = Array.isArray(pendingComplaints) ? pendingComplaints : [];
      setComplaintPending(data);
    });

    // 3. Kết nối tới hub
    connection
      .start()
      .then(() => console.log("SignalR connected!"))
      .catch((err) => console.error("SignalR Connection Error: ", err));

    // 4. Cleanup khi unmount
    return () => {
      connection.stop();
    };
  }, []);

  // Table columns

  // Định nghĩa các cột cho bảng
  const columnPending = [
    { title: "Mã đơn hàng", dataIndex: "orderId", key: "orderId" },
    { title: "Người tạo", dataIndex: "fullName", key: "fullName" },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let className = "";
        let text = "";
        let color = "";
        switch (status) {
          case "IN_PROGRESS":
            className = "complaint-status-in-progress";
            color = "#1890ff";
            text = "Đang xử lý";
            break;
          case "PENDING":
            className = "complaint-status-pending";
            color = "#faad14";
            text = "Chờ xử lý";
            break;
          case "RESOLVED":
            className = "complaint-status-resolved";
            color = "#52c41a";
            text = "Đã giải quyết";
            break;
          default:
            className = "complaint-status-default";
            color = "#d9d9d9";
            text = status;
        }

        return (
          <span style={{ color, fontWeight: "500" }}>
            <motion.div
              style={{
                display: "inline-block",
                position: "relative",
                width: "6px",
                height: "6px",
                marginRight: "8px",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            {text}
          </span>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("vi-VN"), // Định dạng ngày giờ
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons-container">
          {record.status === "PENDING" && (
            <motion.div whileHover={{ scale: 1.05 }} className="action-button-wrapper">
              <Button
                type="primary"
                size="small"
                onClick={() => handleTakeComplaint(record.complaintId)}
                loading={loading}
                className="action-button btn-take"
              >
                Nhận xử lý
              </Button>
            </motion.div>
          )}
        
          
          <motion.div whileHover={{ scale: 1.05 }} className="action-button-wrapper">
            <Button
              type="link"
              size="small"
              onClick={() => handleViewDetail(record)}
            >
              Chi tiết
            </Button>
          </motion.div>
        </div>
      ),
    },
  ];

  const columnInProgress = [
    { title: "Mã đơn hàng", dataIndex: "orderId", key: "orderId" },
    { title: "Người tạo", dataIndex: "fullName", key: "fullName" },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";
        switch (status) {
          case "IN_PROGRESS":
            color = "#1890ff";
            text = "Đang xử lý";
            break;
          case "PENDING":
            color = "#faad14";
            text = "Chờ xử lý";
            break;
          case "RESOLVED":
            color = "#52c41a";
            text = "Đã giải quyết";
            break;
          default:
            color = "#d9d9d9";
            text = status;
        }
        return (
          <span style={{ color, fontWeight: "500" }}>
            <motion.div
              style={{
                display: "inline-block",
                position: "relative",
                width: "6px",
                height: "6px",
                marginRight: "8px",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            {text}
          </span>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("vi-VN"), // Định dạng ngày giờ
    },
    {
      title: "Người xử lý",
      dataIndex: "handlerName",
      key: "handlerName",
      render: (text) => text || "Chưa phân công",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons-container">
          {record.status === "IN_PROGRESS" && (
            <motion.div whileHover={{ scale: 1.05 }} className="action-button-wrapper">
              <Button
                type="primary"
                size="small"
                onClick={() => handleResolveComplaint(record.complaintId)}
                loading={loading}
                className="action-button btn-resolve"
              >
                Hoàn thành
              </Button>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} className="action-button-wrapper">
            <Button
              type="link"
              size="small"
              onClick={() => handleViewDetail(record)}
            >
              Chi tiết
            </Button>
          </motion.div>
        </div>
      ),
    },
  ];

  const columnResolved = [
    { title: "Mã đơn hàng", dataIndex: "orderId", key: "orderId" },
    { title: "Người tạo", dataIndex: "fullName", key: "fullName" },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let text = "";

        switch (status) {
          case "IN_PROGRESS":
            color = "#1890ff";
            text = "Đang xử lý";
            break;
          case "PENDING":
            color = "#faad14";
            text = "Chờ xử lý";
            break;
          case "RESOLVED":
            color = "#52c41a";
            text = "Đã giải quyết";
            break;
          default:
            color = "#d9d9d9";
            text = status;
        }

        return (
          <span style={{ color, fontWeight: "500" }}>
            <motion.div
              style={{
                display: "inline-block",
                position: "relative",
                width: "6px",
                height: "6px",
                marginRight: "8px",
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: color,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            {text}
          </span>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString("vi-VN"), // Định dạng ngày giờ
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <motion.div whileHover={{ scale: 1.05 }}>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </motion.div>
      ),
    },
  ];

  // Hàm format thời gian
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "Chưa có";
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Render nội dung modal
  const renderModalContent = () => {
    if (detailLoading) {
      return (
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (!detail) {
      return <p>Không có dữ liệu</p>;
    }

    return (
      <div className="complaint-detail-scroll">
        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          labelStyle={{ fontWeight: "bold" }}
          className="complaint-detail-descriptions"
          size="middle"
        >
          <Descriptions.Item label="Mã đơn hàng" span={1}>
            <span className="detail-order-id">{detail.orderId}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian tạo đơn" span={1}>
            {formatDate(detail.orderCreatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo khiếu nại" span={1}>
            {detail.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại" span={1}>
            {detail.phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ lấy hàng" span={2}>
            {detail.pickupAddressDetail}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
            {detail.deliveryAddressDetail}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: "bold" }}
          className="complaint-detail-descriptions complaint-info-section"
          size="middle"
          title={
            <div className="complaint-section-title">
              <span>Thông tin khiếu nại</span>
            </div>
          }
        >
          <Descriptions.Item label="Loại khiếu nại">
            <Tag color="blue">{detail.complaintType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nội dung khiếu nại">
            {detail.complaintDescription}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian tạo khiếu nại">
            {formatDate(detail.createdAt)}
          </Descriptions.Item>
        </Descriptions>

        <Descriptions
          bordered
          column={1}
          labelStyle={{ fontWeight: "bold" }}
          className="complaint-detail-descriptions complaint-status-section"
          size="middle"
          title={
            <div className="complaint-section-title">
              <span>Thông tin xử lý</span>
            </div>
          }
        >
          <Descriptions.Item label="Người xử lý">
            {detail.handlerName || "Chưa phân công"}
          </Descriptions.Item>
          <Descriptions.Item label="Chi tiết xử lý">
            {detail.resolutionDetails || "Chưa có"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian giải quyết">
            {formatDate(detail.resolvedAt)}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  return (
    <motion.div 
      className="complaint-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          type="primary"
          onClick={handleCreateComplaint}
          style={{ width: "160px", height: "44px", fontSize: "15px" }}
          className="complaint-create-btn"
        >
          Tạo khiếu nại
        </Button>
      </motion.div>
      
      <Tabs defaultActiveKey="pending" className="complaint-tabs">
        <TabPane tab={<span style={{ fontSize: "15px" }}>Đang chờ xử lý</span>} key="pending">
          <AnimatePresence>
            <motion.div 
              className="complaint-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={columnPending}
                dataSource={complaintPending}
                rowKey="complaintId"
                pagination={false}
                scroll={{ x: "max-content" }}
                components={{
                  body: {
                    row: ({ children, ...props }) => (
                      <motion.tr
                        {...props}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ backgroundColor: "#f0f7ff" }}
                      >
                        {children}
                      </motion.tr>
                    )
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </TabPane>
        <TabPane tab={<span style={{ fontSize: "15px" }}>Đang xử lý</span>} key="in-progress">
          <AnimatePresence>
            <motion.div 
              className="complaint-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={columnInProgress}
                dataSource={compaintInProgress}
                loading={loading}
                rowKey="complaintId"
                pagination={false}
                scroll={{ x: "max-content" }}
                components={{
                  body: {
                    row: ({ children, ...props }) => (
                      <motion.tr
                        {...props}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ backgroundColor: "#f0f7ff" }}
                      >
                        {children}
                      </motion.tr>
                    )
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </TabPane>
        <TabPane tab={<span style={{ fontSize: "15px" }}>Đã hoàn thành</span>} key="resolved">
          <AnimatePresence>
            <motion.div 
              className="complaint-table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Table
                columns={columnResolved}
                dataSource={complaintResolved}
                loading={loading}
                rowKey="complaintId"
                pagination={false}
                scroll={{ x: "max-content" }}
                components={{
                  body: {
                    row: ({ children, ...props }) => (
                      <motion.tr
                        {...props}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ backgroundColor: "#f0f7ff" }}
                      >
                        {children}
                      </motion.tr>
                    )
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </TabPane>
      </Tabs>
      <Modal
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setDetail(null);
        }}
        footer={[
          <Button 
            key="back" 
            onClick={() => {
              setModalVisible(false);
              setDetail(null);
            }}
          >
            Đóng
          </Button>
        ]}
        title={
          <div className="complaint-modal-title">
            <span>Chi tiết khiếu nại</span>
            {detail && detail.status && (
              <Tag 
                color={
                  detail.status === "RESOLVED" 
                    ? "success" 
                    : detail.status === "IN_PROGRESS" 
                      ? "processing" 
                      : "warning"
                }
                className="complaint-status-tag"
              >
                {detail.status === "RESOLVED" 
                  ? "Đã giải quyết" 
                  : detail.status === "IN_PROGRESS" 
                    ? "Đang xử lý" 
                    : "Chờ xử lý"}
              </Tag>
            )}
          </div>
        }
        className="complaint-modal"
        width={800}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto', padding: '20px' }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderModalContent()}
          </motion.div>
        </AnimatePresence>
      </Modal>
      <Modal
        open={resolveModalVisible}
        onCancel={() => {
          setResolveModalVisible(false);
        }}
        footer={[
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleResolveConfirm}
            loading={loading}
          >
            Xác nhận
          </Button>
        ]}
        title="Nhập thông tin giải quyết"
        className="complaint-modal"
        width={600}
        maskClosable={false}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={resolveForm}
          layout="vertical"
          initialValues={{ resolutionDetails: "Đã xử lý và giải quyết khiếu nại" }}
        >
          <Form.Item
            name="resolutionDetails"
            label="Chi tiết giải quyết"
            rules={[{ required: true, message: 'Vui lòng nhập chi tiết giải quyết' }]}
          >
            <TextArea
              placeholder="Nhập chi tiết giải quyết"
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default Complaint;
