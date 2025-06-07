import { useDispatch, useSelector } from "react-redux";
import {
  Collapse,
  Button,
  Pagination,
  Image,
  message,
  Modal,
  Input,
  Popconfirm,
  Dropdown,
  Menu,
  Upload,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Tooltip,
  Tag,
  Breadcrumb,
  Avatar,
  InputNumber,
  Form,
  Empty
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  MoreOutlined,
  EditOutlined,
  UploadOutlined,
  ReloadOutlined,
  HomeOutlined,
  AppstoreOutlined,
  PictureOutlined,
  DollarOutlined,
  FileTextOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import {
  getExtraCategories,
  createExtraCategory,
  deleteExtraCategory,
} from "@redux/features/extraCategoryReducer/extraCategoryReducer";

import {
  getExtraDetails,
  deleteExtra,
  createExtra,
  updateExtra,
} from "@redux/features/extraCategoryReducer/extraReducer";

import { useEffect, useState } from "react";
import "./index.css";
import TextArea from 'antd/es/input/TextArea';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

function ExtraCategories() {
  const dispatch = useDispatch();
  const { categories, error } = useSelector((state) => state.extraCategories);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExtra, setEditingExtra] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isAddServiceModalVisible, setIsAddServiceModalVisible] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    dispatch(getExtraCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categories) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = currentPage * pageSize;
      setFilteredCategories(categories.slice(startIndex, endIndex));
    }
  }, [categories, currentPage, pageSize]);

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteCategory = async (extraCategoryId) => {
    try {
      setLoading(true);
      
      // Cập nhật UI ngay lập tức
      if (categories) {
        const updatedCategories = categories.filter(
          category => category.extraCategoryId !== extraCategoryId
        );
        
        // Cập nhật filteredCategories ngay lập tức
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = currentPage * pageSize;
        setFilteredCategories(updatedCategories.slice(startIndex, endIndex));
        
        // Reset về trang 1 nếu trang hiện tại không còn dữ liệu
        if (updatedCategories.slice(startIndex, endIndex).length === 0 && currentPage > 1) {
          setCurrentPage(1);
        }
      }
      
      // Gọi API để xóa thực sự
      await dispatch(deleteExtraCategory(extraCategoryId));
      
      // Refresh lại để đồng bộ với server
      await dispatch(getExtraCategories());
      
    } catch (error) {
      console.error("Delete category error:", error);
      // Nếu có lỗi, refresh lại để khôi phục data
      await dispatch(getExtraCategories());
    } finally {
      setLoading(false);
    }
  };

  const handleEditExtra = (extra) => {
    console.log("Editing extra:", extra);
    setEditingExtra({...extra});
    
    // Reset form first
    editForm.resetFields();
    
    // Then set values
    setTimeout(() => {
      editForm.setFieldsValue({
        name: extra.name,
        description: extra.description || '',
        price: extra.price
      });
      
      // Show modal after form is set
      setIsEditModalVisible(true);
    }, 100);
  };

  const handleDeleteExtra = async (extraId) => {
    try {
      setLoading(true);
      
      // Cập nhật UI ngay lập tức bằng cách filter local state
      if (categories) {
        const updatedCategories = categories.map(category => ({
          ...category,
          extras: category.extras?.filter(extra => extra.extraId !== extraId) || []
        }));
        
        // Cập nhật filteredCategories ngay lập tức
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = currentPage * pageSize;
        setFilteredCategories(updatedCategories.slice(startIndex, endIndex));
      }
      
      // Gọi API để xóa thực sự
      await dispatch(deleteExtra(extraId));
      
      // Refresh lại để đồng bộ với server
      await dispatch(getExtraCategories());
      
    } catch (error) {
      console.error("Delete error:", error);
      // Nếu có lỗi, refresh lại để khôi phục data
      await dispatch(getExtraCategories());
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExtra = async () => {
    try {
      const values = await editForm.validateFields();
      
      if (!values.name || !values.price) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      setLoading(true);
      const updatedExtra = {
        ...editingExtra,
        name: values.name,
        description: values.description || '',
        price: values.price
      };

      const result = await dispatch(updateExtra(updatedExtra));
      
      if (result.type.endsWith('/fulfilled')) {
        message.success("Cập nhật thành công!");
        setIsEditModalVisible(false);
        editForm.resetFields();
        // Force refresh danh sách
        await dispatch(getExtraCategories());
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const renderExtras = (extras) => {
    if (!extras || extras.length === 0) {
      return <Empty description="Chưa có dịch vụ nào" />;
    }
    
    return extras.map((extra) => (
      <Card 
        key={extra.extraId}
        className="extra-service-card"
        hoverable
        style={{ marginBottom: 16 }}
      >
        <div className="extra-service-content">
          <div className="service-header">
            <Space>
              <Avatar 
                src={extra.imageUrl}
                alt={extra.name}
                shape="square" 
                size={60}
                style={{ backgroundColor: '#f0f0f0' }}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>{extra.name}</Text>
                <div>
                  <Tag color="blue" icon={<DollarOutlined />}>
                    {extra.price.toLocaleString('vi-VN')} VND
                  </Tag>
                </div>
              </div>
            </Space>
            
            <Dropdown
              dropdownRender={() => (
                <Menu>
                  <Menu.Item
                    key="view"
                    icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                    onClick={(e) => {
                      // e.stopPropagation();
                      handleViewExtraDetail(extra.extraId);
                    }}
                    style={{ color: '#1890ff' }}
                  >
                    Xem chi tiết
                  </Menu.Item>
                  <Menu.Item
                    key="edit"
                    icon={<EditOutlined style={{ color: '#52c41a' }} />}
                    onClick={(e) => {
                      // e.stopPropagation();
                      handleEditExtra(extra);
                    }}
                    style={{ color: '#52c41a' }}
                  >
                    Cập nhật dịch vụ
                  </Menu.Item>
                  <Menu.Item key="delete" style={{ padding: 0 }}>
                                          <Popconfirm
                        title="Xóa dịch vụ"
                        description="Bạn có chắc chắn muốn xóa dịch vụ này?"
                        onConfirm={(e) => {
                          e.stopPropagation();
                          handleDeleteExtra(extra.extraId);
                        }}
                        okText="Xóa"
                        okButtonProps={{ danger: true }}
                        cancelButtonProps={{ style: { display: 'none' } }}
                      >
                      <div 
                        style={{ 
                          padding: '5px 12px', 
                          color: '#ff4d4f',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteOutlined style={{ color: '#ff4d4f' }} />
                        Xóa dịch vụ
                      </div>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              )}
              trigger={["click"]}
              destroyPopupOnHide
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                className="action-button"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
          
          <Divider style={{ margin: '12px 0' }}/>
          
          <Paragraph 
            ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}
            type="secondary"
          >
            {extra.description || "Không có mô tả."}
          </Paragraph>
        </div>
      </Card>
    ));
  };

  const handleCreateExtraCategory = async () => {
    if (!newCategoryName.trim()) {
      message.error("Vui lòng nhập tên danh mục!");
      return;
    }
    try {
      setLoading(true);
      const result = await dispatch(createExtraCategory(newCategoryName));
      
      if (result.type.endsWith('/fulfilled')) {
        setIsModalVisible(false);
        setNewCategoryName("");
        message.success("Tạo danh mục thành công!");
        // Force refresh danh sách
        await dispatch(getExtraCategories());
      } else {
        message.error("Tạo danh mục thất bại!");
      }
    } catch (error) {
      message.error("Tạo danh mục thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = (extraCategoryId) => {
    form.resetFields();
    setNewService({ 
      name: "",
      description: "",
      price: "",
      image: null,
      extraCategoryId 
    });
    setIsAddServiceModalVisible(true);
  };

  const handleCreateService = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.name || !values.price || !newService.image) {
        message.error("Vui lòng điền đầy đủ thông tin và chọn ảnh!");
        return;
      }

      const formData = new FormData();
      formData.append("ExtraCategoryId", newService.extraCategoryId);
      formData.append("Name", values.name);
      formData.append("Description", values.description || "");
      formData.append("Price", values.price);
      formData.append("Image", newService.image);

      setLoading(true);
      const result = await dispatch(createExtra(formData));
      
      if (result.type.endsWith('/fulfilled')) {
        message.success("Thêm dịch vụ thành công!");
        setIsAddServiceModalVisible(false);
        form.resetFields();
        setNewService({ name: "", description: "", price: "", image: null });
        // Force refresh danh sách
        await dispatch(getExtraCategories());
      } else {
        message.error("Thêm dịch vụ thất bại!");
      }
    } catch (error) {
      message.error("Thêm dịch vụ thất bại!");
    } finally {
      setLoading(false);
    }
  };


  console.log("check detail modal", detailModalVisible);
  const handleViewExtraDetail = async (extraId) => {


    try {
      console.log("Viewing extra detail for ID:", extraId);
      // Find the extra in the existing data to avoid an additional API call
      let foundExtra = null;
       setDetailModalVisible(true);
      
      for (const category of categories || []) {
        const extra = category.extras?.find(e => e.extraId === extraId);
        if (extra) {
          foundExtra = {...extra, categoryName: category.name};
          break;
        }
      }
      
      if (foundExtra) {
        console.log("Found extra:", foundExtra);
        setSelectedExtra(foundExtra);
       
      } else {
        console.error("Extra not found with ID:", extraId);
        message.error("Không tìm thấy thông tin dịch vụ!");
      }
    } catch (error) {
      console.error("Error viewing extra detail:", error);
      message.error("Có lỗi xảy ra khi xem chi tiết dịch vụ!");
    }
  };

  return (
    <div className="extra-categories-page">
      <Card className="extra-categories-card">
        <div className="page-header">
          <div>
            <Breadcrumb style={{ marginBottom: 16 }}>
              <Breadcrumb.Item href="/">
                <HomeOutlined />
                <span>Trang chủ</span>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <AppstoreOutlined />
                <span>Dịch vụ đi kèm</span>
              </Breadcrumb.Item>
            </Breadcrumb>
            
            <Title level={4}>
              <AppstoreOutlined /> Quản lý dịch vụ đi kèm
            </Title>
          </div>
          
          <Space>
            <Tooltip title="Làm mới danh sách">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => dispatch(getExtraCategories())}
              >
                Refresh
              </Button>
            </Tooltip>
            <Tooltip title="Thêm danh mục dịch vụ mới">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Tạo dịch vụ thêm
              </Button>
            </Tooltip>
          </Space>
        </div>

        <Divider />

        <Row gutter={[16, 16]} className="categories-grid">
          {filteredCategories?.length > 0 ? (
            filteredCategories.map((category) => (
              <Col xs={24} sm={24} md={12} lg={8} key={category.extraCategoryId}>
                <Card 
                  className="category-card"
                  title={
                    <div className="category-header">
                      <Space>
                        <Tag color="success" className="category-tag">Danh mục</Tag>
                        <Text strong>{category.name}</Text>
                      </Space>
                      <Dropdown
                        dropdownRender={() => (
                          <Menu>
                            <Menu.Item
                              key="add"
                              icon={<PlusOutlined />}
                              onClick={() => handleAddService(category.extraCategoryId)}
                            >
                              Thêm dịch vụ
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item key="delete" style={{ padding: 0 }}>
                              <Popconfirm
                                title="Xóa danh mục"
                                description="Bạn có chắc chắn muốn xóa danh mục này? Tất cả dịch vụ trong danh mục cũng sẽ bị xóa."
                                onConfirm={() => handleDeleteCategory(category.extraCategoryId)}
                                okText="Xóa"
                                okButtonProps={{ danger: true }}
                                cancelButtonProps={{ style: { display: 'none' } }}
                              >
                                <div 
                                  style={{ 
                                    padding: '5px 12px', 
                                    color: '#ff4d4f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}
                                >
                                  <DeleteOutlined />
                                  Xóa danh mục
                                </div>
                              </Popconfirm>
                            </Menu.Item>
                          </Menu>
                        )}
                        trigger={["click"]}
                      >
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          className="action-button"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  }
                  extra={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(category.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  }
                >
                  <div className="category-services">
                    {renderExtras(category.extras)}
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty 
                description="Không có dữ liệu dịch vụ đi kèm"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Col>
          )}
        </Row>

        <div className="pagination-container">
          <Pagination
            current={currentPage}
            total={categories?.length || 0}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            showSizeChanger={false}
          />
        </div>
      </Card>

      {/* Create Category Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Tạo danh mục dịch vụ đi kèm</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleCreateExtraCategory}
        onCancel={() => setIsModalVisible(false)}
        okText="Tạo danh mục"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <Form layout="vertical">
          <Form.Item 
            label="Tên danh mục"
            required
            tooltip="Tên danh mục dịch vụ đi kèm"
          >
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nhập tên danh mục dịch vụ"
              prefix={<AppstoreOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>
        </Form>
      </Modal>


       {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết dịch vụ đi kèm</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button 
            key="close" 
            onClick={() => setDetailModalVisible(false)}
            type="primary"
          >
            Đóng
          </Button>
        ]}
      >
        {selectedExtra && (
          <div>
            <div className="detail-header">
              <Space align="start">
                <Avatar 
                  src={selectedExtra.imageUrl}
                  alt={selectedExtra.name}
                  shape="square" 
                  size={80}
                  style={{ backgroundColor: '#f0f0f0' }}
                />
                <div>
                  <Text strong style={{ fontSize: 18 }}>{selectedExtra.name}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue" icon={<DollarOutlined />} style={{ fontSize: 14 }}>
                      {selectedExtra.price.toLocaleString('vi-VN')} VND
                    </Tag>
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      {selectedExtra.categoryName}
                    </Tag>
                  </div>
                </div>
              </Space>
            </div>
            
            <Divider style={{ margin: '16px 0' }}/>
            
            <div className="detail-section">
              <Title level={5}>
                <FileTextOutlined /> Mô tả dịch vụ
              </Title>
              <div className="description-content">
                {selectedExtra.description || "Không có mô tả cho dịch vụ này."}
              </div>
            </div>
            
            <div className="detail-section">
              <Title level={5}>
                <InfoCircleOutlined /> Thông tin khác
              </Title>
              <div className="detail-meta">
                <div className="detail-meta-item">
                  <InfoCircleOutlined />
                  <Text>ID: {selectedExtra.extraId}</Text>
                </div>
                {selectedExtra.createdAt && (
                  <div className="detail-meta-item">
                    <CalendarOutlined />
                    <Text>Ngày tạo: {new Date(selectedExtra.createdAt).toLocaleDateString('vi-VN')}</Text>
                  </div>
                )}
              </div>
            </div>
            
            {selectedExtra.imageUrl && (
              <div className="detail-section">
                <Title level={5}>
                  <PictureOutlined /> Hình ảnh
                </Title>
                <Image 
                  src={selectedExtra.imageUrl} 
                  alt={selectedExtra.name}
                  style={{ maxWidth: '100%', borderRadius: 8 }}
                  fallback="error-image-placeholder.png"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Chỉnh sửa dịch vụ đi kèm</span>
          </Space>
        }
        open={isEditModalVisible}
        onOk={handleUpdateExtra}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
        }}
        okText="Cập nhật"
        cancelButtonProps={{ style: { display: 'none' } }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input 
              placeholder="Nhập mô tả dịch vụ" 
              rows={3}
              showCount
              maxLength={200}
              style={{ 
                border: "1px solid #d9d9d9", 
                borderRadius: "2px", 
                boxShadow: "none",
                // background: "white"
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Giá dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ" }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá dịch vụ"
              addonAfter="VND"
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh dịch vụ"
          >
            <div className="upload-container">
              <input 
                type="file" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setEditingExtra({ ...editingExtra, imageUrl: file });
                  }
                }}
                accept="image/*" 
                id="edit-image-upload"
                style={{ display: 'none' }}
              />
              <Button 
                onClick={() => document.getElementById('edit-image-upload').click()}
                icon={<UploadOutlined />} 
                type="primary"
                ghost
              >
                Chọn ảnh
              </Button>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {imageFile ? imageFile.name : 'Giữ nguyên ảnh hiện tại'}
              </Text>
            </div>

            {editingExtra?.imageUrl && (
              <div className="image-preview">
                <img
                  src={
                    editingExtra?.imageUrl instanceof File
                      ? URL.createObjectURL(editingExtra?.imageUrl)
                      : editingExtra?.imageUrl
                  }
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '150px' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Hình ảnh hiện tại</Text>
                </div>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Service Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Thêm dịch vụ đi kèm</span>
          </Space>
        }
        open={isAddServiceModalVisible}
        onOk={handleCreateService}
        onCancel={() => {
          setIsAddServiceModalVisible(false);
          form.resetFields();
        }}
        okText="Tạo dịch vụ"
        cancelButtonProps={{ style: { display: 'none' } }}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea 
              placeholder="Nhập mô tả dịch vụ" 
              rows={3}
              showCount
              maxLength={200}
              style={{ 
                border: "1px solid #d9d9d9", 
                borderRadius: "2px", 
                boxShadow: "none",
                background: "white"
              }}
            />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Giá dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ" }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá dịch vụ"
              addonAfter="VND"
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh dịch vụ"
            required
            tooltip="Hình ảnh đại diện cho dịch vụ"
          >
            <div className="upload-container">
              <input 
                type="file" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewService({ ...newService, image: file });
                  }
                }}
                accept="image/*" 
                id="add-image-upload"
                style={{ display: 'none' }}
              />
              <Button 
                onClick={() => document.getElementById('add-image-upload').click()}
                icon={<UploadOutlined />} 
                type="primary"
                ghost
              >
                Chọn ảnh
              </Button>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {newService.image ? newService.image.name : 'Chưa chọn ảnh'}
              </Text>
            </div>

            {newService.image && (
              <div className="image-preview">
                <img
                  src={URL.createObjectURL(newService.image)}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '150px' }}
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

export default ExtraCategories;