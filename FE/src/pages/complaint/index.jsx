import { Tabs, Table, Modal, Button, message, Spin, Descriptions, Tag, Form, Input, Space, Select, DatePicker } from "antd";
import { useState, useEffect } from "react";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
import "./index.css";
import { Helmet } from "react-helmet";
import { getRequest, postRequest } from "@services/api";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import 'moment/locale/vi';

moment.locale('vi');

const Complaint = () => {
  const [searchText, setSearchText] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const [filterStatus, setFilterStatus] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [orderIdInput, setOrderIdInput] = useState("");

  // Define complaint types array
  const complaintTypes = [
    { label: "Hàng bị hư hỏng", value: "DAMAGED_ITEM" },
    { label: "Sai đơn hàng", value: "WRONG_ITEM" },
    { label: "Chất lượng kém", value: "POOR_QUALITY" },
    { label: "Khác", value: "OTHER" },
  ];

  // Create mapping from complaint types array
  const complaintTypeMap = complaintTypes.reduce((acc, type) => {
    acc[type.value] = type.label;
    return acc;
  }, {});

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

  const handleCreateComplaint = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreateConfirm = async () => {
    try {
      const values = await createForm.validateFields();
      setLoading(true);

      try {
        await postRequest(
          `complaints/${values.orderId}/admin-customerstaff`,
          {
            complaintDescription: values.complaintDescription,
            complaintType: values.complaintType
          },
        );

        message.success("Tạo khiếu nại thành công!");
        setCreateModalVisible(false);
        // Refresh data
        try {
          await getComplaintPending();
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
        }
      } catch (error) {
        console.error("Error creating complaint:", error);
        // Kiểm tra các trường hợp lỗi cụ thể
        if (error.response) {
          if (error.response.status === 400) {
            message.error("Mã đơn hàng không hợp lệ hoặc không tồn tại!");
          } else if (error.response.status === 401 || error.response.status === 403) {
            message.error("Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại!");
          } else {
            message.error("Tạo khiếu nại thất bại! Vui lòng thử lại.");
          }
        } else {
          message.error("Tạo khiếu nại thất bại! Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    } catch (validationError) {
      // Form validation failed
      console.log("Validation failed:", validationError);
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

  // Hàm tìm kiếm
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Hàm xử lý thay đổi phân trang
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Cấu hình chung cho phân trang
  const paginationConfig = {
    showSizeChanger: true,
    pageSizeOptions: ["5", "10", "20", "50"],
    current: currentPage,
    pageSize: pageSize,
    onChange: handlePaginationChange,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  };

  // Hàm lọc dữ liệu theo từ khóa tìm kiếm
  const filterDataBySearch = (data) => {
    if (!searchText) return data;

    return data.filter(item => {
      const searchFields = [
        item.orderId,
        item.fullName,
        item.complaintType,
        item.handlerName
      ].filter(Boolean); // Loại bỏ undefined/null

      return searchFields.some(
        field => field.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  // Cấu hình cột có thể tìm kiếm và sắp xếp
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Tìm ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="middle"
            style={{ flex: 1, height: '32px' }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="middle"
            style={{ flex: 1, height: '32px' }}
          >
            Xóa
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    sorter: (a, b) => {
      if (!a[dataIndex] && !b[dataIndex]) return 0;
      if (!a[dataIndex]) return -1;
      if (!b[dataIndex]) return 1;
      return a[dataIndex].localeCompare(b[dataIndex]);
    },
  });

  // Định nghĩa lại cột cho bảng với tìm kiếm và sắp xếp
  const columnPending = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      ...getColumnSearchProps('orderId', 'mã đơn hàng'),
      width: 150,
    },
    {
      title: "Người tạo",
      dataIndex: "fullName",
      key: "fullName",
      ...getColumnSearchProps('fullName', 'người tạo'),
    },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
      ...getColumnSearchProps('complaintType', 'loại khiếu nại'),
      filters: complaintTypes.map(type => ({ text: type.label, value: type.value })),
      onFilter: (value, record) => record.complaintType === value,
      render: (text) => complaintTypeMap[text] || text,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Chờ xử lý', value: 'PENDING' },
        { text: 'Đang xử lý', value: 'IN_PROGRESS' },
        { text: 'Đã giải quyết', value: 'RESOLVED' },
      ],
      onFilter: (value, record) => record.status === value,
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (text) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <div className="action-buttons-container">
          {record.status === "PENDING" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleTakeComplaint(record.complaintId)}
              loading={loading}
              className="action-button btn-take"
              style={{ background: "orange!important" }}
            >
              Nhận xử lý
            </Button>
          )}

          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  // Cập nhật cột cho bảng Đang xử lý
  const columnInProgress = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      ...getColumnSearchProps('orderId', 'mã đơn hàng'),
      width: 150,
    },
    {
      title: "Người tạo",
      dataIndex: "fullName",
      key: "fullName",
      ...getColumnSearchProps('fullName', 'người tạo'),
    },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
      ...getColumnSearchProps('complaintType', 'loại khiếu nại'),
      filters: complaintTypes.map(type => ({ text: type.label, value: type.value })),
      onFilter: (value, record) => record.complaintType === value,
      render: (text) => complaintTypeMap[text] || text,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Chờ xử lý', value: 'PENDING' },
        { text: 'Đang xử lý', value: 'IN_PROGRESS' },
        { text: 'Đã giải quyết', value: 'RESOLVED' },
      ],
      onFilter: (value, record) => record.status === value,
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (text) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Người xử lý",
      dataIndex: "handlerName",
      key: "handlerName",
      ...getColumnSearchProps('handlerName', 'người xử lý'),
      render: (text) => text || "Chưa phân công",
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <div className="action-buttons-container">
          {record.status === "IN_PROGRESS" && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleViewDetail(record)}
              >
                Chi tiết
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => handleResolveComplaint(record.complaintId)}
                loading={loading}
                className="action-button btn-resolve"
              >
                Hoàn thành
              </Button>

            </>
          )}

        </div>
      ),
    },
  ];

  // Cập nhật cột cho bảng Đã hoàn thành
  const columnResolved = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      ...getColumnSearchProps('orderId', 'mã đơn hàng'),
      width: 150,
    },
    {
      title: "Người tạo",
      dataIndex: "fullName",
      key: "fullName",
      ...getColumnSearchProps('fullName', 'người tạo'),
    },
    {
      title: "Loại khiếu nại",
      dataIndex: "complaintType",
      key: "complaintType",
      ...getColumnSearchProps('complaintType', 'loại khiếu nại'),
      filters: complaintTypes.map(type => ({ text: type.label, value: type.value })),
      onFilter: (value, record) => record.complaintType === value,
      render: (text) => complaintTypeMap[text] || text,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Chờ xử lý', value: 'PENDING' },
        { text: 'Đang xử lý', value: 'IN_PROGRESS' },
        { text: 'Đã giải quyết', value: 'RESOLVED' },
      ],
      onFilter: (value, record) => record.status === value,
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (text) => new Date(text).toLocaleString("vi-VN"),
    },
    {
      title: "Người xử lý",
      dataIndex: "handlerName",
      key: "handlerName",
      ...getColumnSearchProps('handlerName', 'người xử lý'),
      render: (text) => text || "Chưa phân công",
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
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

      <div className="complaint-header">
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

        <div className="complaint-search">
          <Input.Search
            placeholder="Tìm kiếm theo mã đơn"
            allowClear
            enterButton
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />
        </div>
      </div>

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
                dataSource={filterDataBySearch(complaintPending)}
                rowKey="complaintId"
                pagination={paginationConfig}
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
                dataSource={filterDataBySearch(compaintInProgress)}
                loading={loading}
                rowKey="complaintId"
                pagination={paginationConfig}
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
                dataSource={filterDataBySearch(complaintResolved)}
                loading={loading}
                rowKey="complaintId"
                pagination={paginationConfig}
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
      <Modal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        title="Tạo khiếu nại"
        footer={null}
        width={600}
        maskClosable={false}
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            complaintType: "Sai dịch vụ",
            complaintDescription: "Đơn hàng cần khiếu nại"
          }}
        >
          <Form.Item
            name="orderId"
            label="Mã đơn hàng"
            rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng!' }]}
          >
            <Input placeholder="Nhập mã đơn hàng cần khiếu nại" />
          </Form.Item>

          <Form.Item
            name="complaintType"
            label="Loại khiếu nại"
            rules={[{ required: true, message: 'Vui lòng chọn loại khiếu nại!' }]}
          >
            <Select placeholder="Chọn loại khiếu nại">
              {complaintTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="complaintDescription"
            label="Mô tả khiếu nại"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả khiếu nại!' }]}
          >
            <TextArea
              placeholder="Nhập chi tiết khiếu nại"
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleCreateConfirm}
              loading={loading}
              style={{ width: '100%', height: '40px', borderRadius: '4px' }}
            >
              Tạo khiếu nại
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default Complaint;
