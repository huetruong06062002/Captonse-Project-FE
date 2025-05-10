import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Input,
  message,
  Spin,
  Form,
  Modal,
  Tooltip,
  Card,
  Typography,
  Space,
  Avatar,
  Tag,
  Row,
  Col,
  Divider,
  Breadcrumb,
} from "antd";
import { IoIosRefresh } from "react-icons/io";
import {
  fetchServices,
  addService,
  deleteService,
  updateService,
} from "../../redux/features/serviceReducer/serviceSlice"; // Import Thunks
import moment from "moment";
import { IoIosAdd } from "react-icons/io";
import { RxUpdate } from "react-icons/rx";
import { FcViewDetails } from "react-icons/fc";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { HomeOutlined, AppstoreOutlined, PictureOutlined, FileImageOutlined, InfoCircleOutlined } from "@ant-design/icons";
import "./index.css";
import { ServicesDetail } from "./components/ServicesDetail";
import ButtonExportExcelService from '@components/button-export-excel/ButtonExportExcelService';

const { Search } = Input;
const { Title, Text } = Typography;

function Services() {
  const dispatch = useDispatch();
  const { services, isLoading, error } = useSelector((state) => state.service); // Lấy dữ liệu từ Redux store
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [editingService, setEditingService] = useState(null); // State để lưu dịch vụ đang chỉnh sửa
  const [openDrawerDetail, setOpenDrawerDetail] = useState(false);
  const [servicesDetail, setServicesDetail] = useState(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleIconChange = (e) => {
    setIcon(e.target.files[0]); // Set file icon khi người dùng chọn file
  };

  const handleSubmit = () => {
    if (!name || !icon) {
      message.error("Please provide both name and icon.");
      return;
    }

    // Create FormData to properly handle file uploads
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Icon", icon);

    dispatch(addService(formData)) // Gọi API POST để thêm dịch vụ
      .then(() => {
        dispatch(fetchServices());
        setIsModalVisible(false); // Đóng Modal sau khi thêm dịch vụ
        setName(""); // Reset form
        setIcon(null); // Reset file input
        message.success("Service added successfully");
      })
      .catch((error) => {
        message.error("Failed to add service");
      });
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service); // Nếu chỉnh sửa, đặt dịch vụ vào form
      setName(service.name);
    } else {
      setEditingService(null);
      setName("");
      setIcon(null);
    }
    setIsModalVisible(true); // Mở Modal khi bấm nút "Thêm Dịch Vụ"
  };

  const handleCancelModal = () => {
    setIsModalVisible(false); // Đóng Modal khi bấm nút "Cancel"
  };

  const handleSaveService = () => {
    if (!name) {
      message.error("Tên dịch vụ là bắt buộc.");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("Name", name);
    
    // Only append a new icon if it exists
    if (icon) {
      formData.append("Icon", icon);
    }

    dispatch(updateService({ id: editingService.categoryId, data: formData }))
      .then(() => {
        setIsModalVisible(false); // Đóng Modal sau khi cập nhật
        dispatch(fetchServices()); // Gọi lại API sau khi cập nhật thành công
        setName("");
        setIcon(null);
        message.success("Service updated successfully");
      })
      .catch((error) => {
        message.error("Failed to update service");
      });
  };

  const handleDeleteService = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa dịch vụ này?",
      content: "Hành động này không thể hoàn tác",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        dispatch(deleteService(id)).then(() => {
          dispatch(fetchServices());
          message.success("Service deleted successfully");
        }); // Gọi API DELETE để xóa dịch vụ
      },
    });
  };

  const handleViewDetail = (record) => {
    setServicesDetail(record);
    showDrawer();
  };

  const showDrawer = () => {
    setOpenDrawerDetail(true);
  };

  const columns = [
    {
      title: "Tên Dịch Vụ",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Hình Ảnh",
      dataIndex: "icon",
      key: "icon",
      width: 100,
      render: (icon) => (
        <Avatar 
          src={icon} 
          alt="icon" 
          size={40}
          shape="square"
          style={{ objectFit: 'cover' }} 
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdat",
      key: "createdAt",
      render: (text) => (
        <Tag color="blue">
          {moment(text).format("HH:mm:ss | DD/MM/YYYY")}
        </Tag>
      ),
    },
    {
      title: (
        <span>
          Thao tác
          <Tooltip title="Cập nhật, xem chi tiết hoặc xóa dịch vụ">
            <InfoCircleOutlined style={{ marginLeft: 8, cursor: 'pointer' }} />
          </Tooltip>
        </span>
      ),
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Cập nhật dịch vụ">
            <Button
              onClick={() => handleOpenModal(record)}
              type="primary"
              icon={<RxUpdate />}
              size="middle"
              className="action-button-update"
              aria-label="Cập nhật"
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết dịch vụ">
            <Button
              onClick={() => handleViewDetail(record)}
              type="primary"
              icon={<FcViewDetails style={{ color: "white" }} />}
              size="middle"
              className="action-button-view"
              aria-label="Chi tiết"
            />
          </Tooltip>
          <Tooltip title="Xóa dịch vụ">
            <Button
              onClick={() => handleDeleteService(record.categoryId)}
              danger
              type="primary"
              icon={<MdOutlineDeleteOutline />}
              size="middle"
              className="action-button-delete"
              aria-label="Xóa"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="centered-spin">
        <Spin size="large" tip="Loading services..." />
      </div>
    );

  if (error) {
    message.error(error?.message || "Failed to fetch services");
  }

  return (
    <div className="service-page-container">
      <ServicesDetail
        openDrawerDetail={openDrawerDetail}
        setOpenDrawerDetail={setOpenDrawerDetail}
        showDrawer={showDrawer}
        servicesDetail={servicesDetail}
      />
      
      <Card className="service-page-card">
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>Trang chủ</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <AppstoreOutlined />
            <span>Quản lý dịch vụ</span>
          </Breadcrumb.Item>
        </Breadcrumb>
      
        <Title level={4} style={{ marginBottom: 24 }}>
          <AppstoreOutlined /> Danh sách dịch vụ
        </Title>
        
        <Row gutter={[16, 24]} align="middle" justify="space-between" style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={12} lg={12}>
            <Search
              placeholder="Tìm kiếm dịch vụ"
              allowClear
              enterButton={<Button type="primary" icon={<FaSearch />}>Tìm kiếm</Button>}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<IoIosRefresh />}
                onClick={() => dispatch(fetchServices())}
                size="large"
              >
                Refresh
              </Button>
              <ButtonExportExcelService />
              <Button
                type="primary"
                icon={<IoIosAdd />}
                onClick={() => handleOpenModal()}
                size="large"
              >
                Thêm dịch vụ
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        <div className="action-buttons-legend" style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <Text strong style={{ marginRight: 16 }}>Thao tác:</Text>
          <Space>
            <Button type="primary" size="small" className="action-button-update" icon={<RxUpdate />} disabled />
            <Text>Cập nhật</Text>
          </Space>
          <Space style={{ marginLeft: 8 }}>
            <Button type="primary" size="small" className="action-button-view" icon={<FcViewDetails style={{ color: "white" }} />} disabled />
            <Text>Xem chi tiết</Text>
          </Space>
          <Space style={{ marginLeft: 8 }}>
            <Button type="primary" size="small" className="action-button-delete" danger icon={<MdOutlineDeleteOutline />} disabled />
            <Text>Xóa</Text>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={services}
          rowKey="categoryId"
          pagination={{ 
            pageSize: 5,
            showTotal: (total) => `Tổng ${total} dịch vụ`,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
          }}
          bordered
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          <div>
            <PictureOutlined style={{ marginRight: 8 }} />
            {editingService ? "Chỉnh sửa Dịch Vụ" : "Thêm Dịch Vụ"}
          </div>
        }
        open={isModalVisible}
        onOk={editingService ? handleSaveService : handleSubmit}
        onCancel={handleCancelModal}
        okText={editingService ? "Lưu" : "Thêm"}
        cancelButtonProps={{ style: { display: 'none' } }}
        maskClosable={false}
        centered
      >
        <Form layout="vertical">
          <Form.Item 
            label="Tên Dịch Vụ" 
            required
            tooltip="Tên dịch vụ được hiển thị cho khách hàng"
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên dịch vụ"
              prefix={<AppstoreOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Form.Item 
            label="Hình Ảnh" 
            required
            tooltip="Hình ảnh đại diện cho dịch vụ"
          >
            <div className="upload-container">
              <input 
                type="file" 
                onChange={handleIconChange} 
                accept="image/*" 
                id="icon-upload"
                style={{ display: 'none' }}
              />
              <Button 
                onClick={() => document.getElementById('icon-upload').click()}
                icon={<FileImageOutlined />} 
                style={{ marginRight: 8 }}
                type="primary"
              >
                Chọn ảnh
              </Button>
              <Text type="secondary">
                {icon ? icon.name : editingService?.icon ? 'Giữ nguyên ảnh hiện tại' : 'Chưa chọn ảnh'}
              </Text>
            </div>
            
            {(icon || editingService?.icon) && (
              <div className="image-preview">
                <Avatar 
                  src={icon ? URL.createObjectURL(icon) : editingService?.icon} 
                  alt="Preview" 
                  shape="square"
                  size={100} 
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Hình ảnh xem trước</Text>
                </div>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Services;
