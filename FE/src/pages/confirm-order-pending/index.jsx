import { getRequestParams, postRequest } from "@services/api";
import React, { useEffect, useRef, useState } from "react";
import OrderDetailDrawer from "./component/OrderDetailDrawer";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import { 
  Input, 
  message, 
  Modal, 
  Spin, 
  Card, 
  Table, 
  Tag, 
  Button, 
  DatePicker, 
  Select, 
  Space, 
  Form, 
  Row, 
  Col,
  Typography,
  Badge,
  Tooltip,
  Empty
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { GrFormRefresh } from "react-icons/gr";
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  FormOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  StopOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

function ConfirmOrderPending() {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [pageSize, setPageSize] = useState(10); // Số bản ghi trên mỗi trang
  const [totalRecords, setTotalRecords] = useState(0); // Tổng số bản ghi
  const [orderId, setOrderId] = useState(null); // ID đơn hàng được chọn để xem
  const [dropdownVisible, setDropdownVisible] = useState(null); // Quản lý dropdown hiển thị
  const dropdownRef = useRef(null); // Tham chiếu đến dropdown
  const [assignmentId, setAssignmentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [note, setNote] = useState(""); // Trạng thái để lưu ghi chú
  const [currentAction, setCurrentAction] = useState(""); // Lưu hành động hiện tại
  const [modalConfig, setModalConfig] = useState({
    title: "",
    content: "",
    onOk: () => {},
  });
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [filters, setFilters] = useState({
    orderName: "",
    orderStatus: "",
    dateRange: [],
  });
  const [sortedInfo, setSortedInfo] = useState({});

  console.log("note", note);

  const showModal = (title, content, onOk, action) => {
    setModalConfig({ title, content, onOk });
    setCurrentAction(action); // Lưu hành động hiện tại
    setIsModalOpen(true);
  };
  const handleOk = () => {
    if (currentAction === "confirm") {
      handleConfirmOrderSuccess(orderId);
    } else if (currentAction === "cancelOrder") {
      handleCancelOrder(orderId);
    } else if (currentAction === "rejectOrder") {
      handleRejectOrder(orderId);
    }

    setIsModalOpen(false);
    setNote(""); // Đặt lại ghi chú khi đóng modal
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setNote(""); // Đặt lại ghi chú khi đóng modal
  };

  useEffect(() => {
    fetchPendingOrder();
  }, [currentPage, pageSize]); // Gọi lại khi currentPage hoặc pageSize thay đổi

  const fetchPendingOrder = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
      };
      
      // Add search parameters
      if (filters.orderName) {
        params.search = filters.orderName;  // Changed from orderName to search
      }
      
      if (filters.orderStatus) {
        params.orderStatus = filters.orderStatus;
      }
      
      if (filters.dateRange && filters.dateRange.length === 2) {
        params.fromDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.toDate = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      console.log("Search params:", params);
      
      const response = await getRequestParams(
        "/customer-staff/pending-orders",
        params
      );

      if (response.data) {
        setOrders(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      message.error("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi bộ lọc và sắp xếp
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('Table parameters changed:', { pagination, filters, sorter });
    
    // Lưu thông tin về sắp xếp
    setSortedInfo(sorter);
    
    // Cập nhật trang hiện tại
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    // Fetch data with new parameters if needed
    if (JSON.stringify(sorter) !== JSON.stringify(sortedInfo)) {
      fetchPendingOrder();
    }
  };

  // Xử lý reset bộ lọc
  const clearFilters = () => {
    setFilters({
      orderName: "",
      orderStatus: "",
      dateRange: [],
    });
    setSortedInfo({});
    setCurrentPage(1);
    setTimeout(() => {
      fetchPendingOrder();
    }, 100);
  };

  // Xử lý tìm kiếm
  const handleSearch = (selectedKeys, confirm) => {
    confirm();
    const searchText = selectedKeys[0] || '';
    setFilters(prev => ({
      ...prev,
      orderName: searchText
    }));
    setCurrentPage(1);
    fetchPendingOrder();
  };

  const postProcessOrder = async (orderId) => {
    const response = await axiosClientVer2.post(
      `/customer-staff/process-order/${orderId}`
    );
    console.log("Response:", response); // Kiểm tra phản hồi từ API

    if (response.data) {
      setAssignmentId(response.data.assignmentId); // Lưu assignmentId để xử lý sau này
      message.success(response.data.message);
    }
  };

  console.log("Assignment ID:", assignmentId); // Kiểm tra giá trị của assignmentId

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
    postProcessOrder(orderId); // Gọi hàm xử lý đơn hàng
    console.log("Nhận xử lý đơn hàng:", orderId);
    // Thêm logic xử lý nhận đơn hàng ở đây
  };

  const handleConfirmOrderSuccess = async (orderId) => {
    const response = await postRequest(
      `/customer-staff/confirm-order?orderId=${orderId}&note=${note}`
    );
    if (response.data) {
      message.success(response.data.message);
    }
    console.log("check response", response); // Kiểm tra phản hồi từ API
  };
  const handleCancelOrder = async () => {
    const response = await postRequest(
      `/customer-staff/cancel-order?assignmentId=${assignmentId}&notes=${note}`
    );
    if (response.data) {
      message.success(response.data.message);
    }
  };

  const handleRejectOrder = async () => {
    const response = await postRequest(
      `/customer-staff/cancel-processing?assignmentId=${assignmentId}&note=${note}`
    );
    if (response.data) {
      message.success(response.data.message);
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const onClose = () => {
    setDrawerVisible(false);
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1 + (currentPage - 1) * pageSize,
    },
    {
      title: 'Tên đơn hàng',
      dataIndex: 'orderName',
      key: 'orderName',
      width: '25%',
      filteredValue: filters.orderName ? [filters.orderName] : null,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 16, width: 300 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <SearchOutlined 
              style={{ 
                position: 'absolute', 
                left: 11, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#bfbfbf' 
              }}
            />
            <Input
              placeholder="Tìm kiếm tên đơn hàng"
              value={selectedKeys[0]}
              onChange={e => {
                const value = e.target.value;
                setSelectedKeys(value ? [value] : []);
              }}
              onPressEnter={() => {
                handleSearch(selectedKeys, confirm);
              }}
              style={{ 
                paddingLeft: 30, 
                width: '100%', 
                height: 40,
                borderRadius: 4
              }}
              allowClear
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm)}
              style={{ 
                width: '48%', 
                borderRadius: 4,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SearchOutlined /> Tìm kiếm
            </Button>
            <Button
              onClick={() => handleReset(clearFilters)}
              style={{ 
                width: '48%', 
                borderRadius: 4,
                height: 40
              }}
            >
              Xóa
            </Button>
          </div>
        </div>
      ),
      filterIcon: filtered => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        return record.orderName
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      },
    },
    {
      title: 'Tổng giá',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      sortOrder: sortedInfo.columnKey === 'totalPrice' && sortedInfo.order,
      render: (totalPrice) => (
        <Text strong>{totalPrice?.toLocaleString('vi-VN')} VND</Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      align: 'center',
      filters: [
        { text: 'PENDING', value: 'PENDING' },
        { text: 'PROCESSING', value: 'PROCESSING' },
      ],
      onFilter: (value, record) => record.orderStatus === value,
      render: (status) => {
        let color = 'blue';
        if (status === 'PENDING') color = 'orange';
        
        return (
          <Tag color={color} key={status}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderedDate',
      key: 'orderedDate',
      sorter: (a, b) => new Date(a.orderedDate) - new Date(b.orderedDate),
      sortOrder: sortedInfo.columnKey === 'orderedDate' && sortedInfo.order,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: <Space><Badge count={1} style={{ backgroundColor: '#1890ff' }} /> Bước 1: Xem chi tiết</Space>,
      key: 'viewDetails',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Tooltip title="Bước 1: Xem thông tin chi tiết đơn hàng">
          <Button
            type="default"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.orderId)}
          >
            Xem chi tiết
          </Button>
        </Tooltip>
      ),
    },
    {
      title: <Space><Badge count={2} style={{ backgroundColor: '#52c41a' }} /> Bước 2: Nhận xử lý</Space>,
      key: 'acceptOrder',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Tooltip title="Bước 2: Nhận xử lý và gọi điện thoại cho khách hàng">
          <Button
            type="primary"
            ghost
            icon={<FormOutlined />}
            style={{ borderColor: '#52c41a', color: '#52c41a' }}
            onClick={() => handleAcceptOrder(record.orderId)}
          >
            Nhận xử lý
          </Button>
        </Tooltip>
      ),
    },
    {
      title: <Space><Badge count={3} style={{ backgroundColor: '#faad14' }} /> Bước 3: Kết quả</Space>,
      key: 'actions',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            style={{ 
              backgroundColor: '#52c41a', 
              borderColor: '#52c41a', 
              width: '100%',
              position: 'relative'
            }}
            onClick={() => {
              showModal(
                "Xác nhận đơn hàng thành công",
                "Vui lòng nhập ghi chú xác nhận (nếu có):",
                () => {
                  console.log("Xác nhận đơn hàng thành công");
                  setIsModalOpen(false);
                },
                "confirm"
              );
              setOrderId(record.orderId);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Badge count={3} style={{ backgroundColor: '#faad14', marginRight: 5 }} />
              Xác nhận thành công
            </div>
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            style={{ width: '100%' }}
            onClick={() =>
              showModal(
                "Xác nhận hủy đơn hàng",
                "Vui lòng nhập lý do hủy đơn hàng:",
                () => {
                  console.log("Xác nhận hủy đơn hàng thành công");
                  setIsModalOpen(false);
                },
                "rejectOrder"
              )
            }
          >
            Xác nhận hủy đơn
          </Button>
          <Button
            danger
            ghost
            icon={<StopOutlined />}
            style={{ width: '100%' }}
            onClick={() =>
              showModal(
                "Hủy nhận đơn hàng",
                "Vui lòng nhập lý do hủy nhận đơn hàng:",
                () => {
                  console.log("Hủy nhận đơn hàng");
                  setIsModalOpen(false);
                },
                "cancelOrder"
              )
            }
          >
            Hủy nhận đơn hàng
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ overflow: "hidden" }}>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ 
            backgroundColor: "#1890ff", 
            width: "6px", 
            height: "28px", 
            marginRight: "12px",
            borderRadius: "3px" 
          }}></div>
          <h2 style={{ 
            margin: 0, 
            fontSize: "24px",
            fontWeight: "600",
            background: "linear-gradient(90deg, #1890ff, #52c41a)", 
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}>Quản lý đơn hàng chờ xử lý</h2>
        </div>
      </div>
      
      {/* Hiển thị loading */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <div
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 150px)",
            background: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.03)"
          }}
        >
          <div style={{ marginBottom: "20px", backgroundColor: "#e6f7ff", padding: "15px", borderRadius: "8px", border: "1px solid #91d5ff" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#1890ff" }}>Hướng dẫn sử dụng</h3>
            
            {/* Thanh tiến trình quy trình xử lý */}
            <div style={{ marginBottom: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", marginBottom: "10px", marginTop: "15px" }}>
                {/* Dòng kẻ xuyên suốt */}
                <div style={{ position: "absolute", top: "50%", left: "0", right: "0", height: "2px", backgroundColor: "#e8e8e8", zIndex: 1 }}></div>
                
                {/* Các bước */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#1890ff", color: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", fontWeight: "bold" }}>1</div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#1890ff", textAlign: "center" }}>Xem chi tiết <br/>đơn hàng</div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#52c41a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", fontWeight: "bold" }}>2</div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#52c41a", textAlign: "center" }}>Nhận xử lý <br/>+ Gọi điện</div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#faad14", color: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", fontWeight: "bold" }}>3</div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#faad14", textAlign: "center" }}>Ghi nhận <br/>kết quả</div>
                </div>
              </div>
            </div>
            
            {/* Thêm card cho tìm kiếm và lọc */}
          
            
            <ol style={{ margin: 0, paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Bước 1:</strong> Nhấn <span style={{ backgroundColor: "#f5f5f5", padding: "2px 5px", borderRadius: "3px" }}>Xem chi tiết</span> để kiểm tra thông tin đơn hàng.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Bước 2:</strong> Nhấn <span style={{ backgroundColor: "#f6ffed", padding: "2px 5px", borderRadius: "3px", color: "#52c41a" }}>Nhận xử lý</span> để xác nhận bạn sẽ phụ trách đơn hàng này và gọi điện cho khách hàng.
              </li>
              <li style={{ marginBottom: "0" }}>
                <strong>Bước 3:</strong> Sau khi liên hệ khách hàng, chọn một trong các kết quả:
                <ul style={{ marginTop: "5px" }}>
                  <li><span style={{ backgroundColor: "#f6ffed", padding: "2px 5px", borderRadius: "3px", color: "#52c41a" }}>Xác nhận thành công</span> - Khi khách hàng đồng ý đơn hàng</li>
                  <li><span style={{ backgroundColor: "#fff2f0", padding: "2px 5px", borderRadius: "3px", color: "#ff4d4f" }}>Xác nhận hủy đơn</span> - Khi khách hàng muốn hủy đơn</li>
                  <li><span style={{ backgroundColor: "#fff", padding: "2px 5px", borderRadius: "3px", color: "#ff4d4f", border: "1px solid #ffccc7" }}>Hủy nhận đơn hàng</span> - Khi bạn không thể xử lý tiếp đơn này</li>
                </ul>
              </li>
            </ol>
          </div>
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFilters({
                    orderName: "",
                    orderStatus: "",
                    dateRange: [],
                  });
                  setSortedInfo({});
                  setCurrentPage(1);
                  fetchPendingOrder();
                }}
                style={{ marginLeft: 8 }}
              >
                Làm mới dữ liệu
              </Button>
            </div>
            
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="orderId"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalRecords,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                },
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              onChange={handleTableChange}
              loading={loading}
              size="middle"
              bordered
              scroll={{ x: 1200 }}
              locale={{
                emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có đơn hàng nào cần xử lý" />
              }}
            />
          </Card>
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </div>
      )}
      <OrderDetailDrawer
        orderId={orderId}
        visible={drawerVisible}
        onClose={onClose}
      />
      <Modal
        title={modalConfig.title}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          // <Button key="cancel" onClick={handleCancel}>
          //   Hủy
          // </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <p>{modalConfig.content}</p>
        <div style={{ marginTop: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Ghi chú:</label>
          <TextArea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
            }}
            placeholder="Nhập ghi chú..."
            rows={4}
            style={{ width: "100%", borderRadius: "4px" }}
          />
        </div>
      </Modal>
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
     
    </div>
  );
}

export default ConfirmOrderPending;
