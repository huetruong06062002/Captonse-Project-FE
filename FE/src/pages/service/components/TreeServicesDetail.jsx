import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Tree,
  Dropdown,
  Menu,
  Tooltip,
  Popconfirm,
  Upload,
  Space,
  Typography,
  Card,
  Divider,
  Avatar,
  Tag,
  Spin,
  Empty,
} from "antd";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  ToolOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { MdUpdate } from "react-icons/md";
import { LuDelete } from "react-icons/lu";
import { RiSettings4Fill } from "react-icons/ri";
import { MdOutlinePlaylistRemove } from "react-icons/md";

const { Title, Text } = Typography;

const TreeServicesDetail = ({
  serviceDetailFull,
  onSelectSubCategory,
  setAddSubCategoryModalVisible,
  selectedSubCategoryId,
  getServiceDetail,
  setIsOpenUpdateServiceLevel1,
  onSelectSubCategoryToUpdate,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);

  const [editingService, setEditingService] = useState({});
  const [form] = Form.useForm(); // Thêm hook useForm
  const [uploadedFile, setUploadedFile] = useState(null);
  const [viewServiceDetails, setViewServiceDetails] = useState(null);

  const [extraCategories, setExtraCategories] = useState([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState([]);
  const [isAddExtraModalVisible, setIsAddExtraModalVisible] = useState(false);
  const [isEditExtrasModalVisible, setIsEditExtrasModalVisible] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [submittingExtras, setSubmittingExtras] = useState(false);
  const [currentServiceExtras, setCurrentServiceExtras] = useState([]);

  // Thêm useEffect để cập nhật form khi editingService thay đổi
  useEffect(() => {
    if (editingService && Object.keys(editingService).length > 0) {
      form.setFieldsValue({
        name: editingService.name,
        price: editingService.price,
        description: editingService.description,
        imageUrl: editingService.imageUrl,
      });
    }
  }, [editingService, form]);

  const handleDelete = async () => {
    try {
      const response = await axiosClientVer2.delete(
        `/subcategories/${selectedSubCategoryId}`
      );
      message.success("Xóa danh mục con thành công");
      getServiceDetail(); // Lấy lại thông tin sau khi xóa
    } catch (err) {
      console.error("Error during delete:", err);
      message.error("Không thể xóa danh mục con");
    }
  };

  const getSetviceInServiceDetail = async (serviceId) => {
    try {
      const response = await axiosClientVer2.get(
        `/service-details/${serviceId}`
      );
      console.log("check response", response.data);
      return response.data;
    } catch (err) {
      console.error("Error during get service in service detail:", err);
    }
  };

  const handleCancelDelete = (e) => {
    console.log(e);
    message.error("Click on No");
  };
  const handleEditServicesInServiceDetail = async (serviceId) => {
    console.log("check serviceId", serviceId);
    const serviceToEdit = await getSetviceInServiceDetail(serviceId);

    console.log("check serviceToEdit", serviceToEdit);
    setEditingService(serviceToEdit);
    setUploadedFile(null); // Reset uploaded file khi mở modal
    setIsEditModalVisible(true); // Show the modal
  };

  console.log("check editingService", editingService);
  const handleUpdateService = async (values) => {
    try {
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      const { name, price, description } = values;

      // Thêm các trường dữ liệu vào FormData
      formData.append("ServiceId", editingService.serviceId);
      formData.append("Name", name);
      formData.append("Price", price);
      formData.append("Description", description || "");
      
      // Sử dụng uploadedFile state thay vì imageUrl từ values
      if (uploadedFile) {
        formData.append("Image", uploadedFile);
      } else if (editingService?.imageUrl) {
        // Nếu không có file mới, giữ nguyên URL cũ
        formData.append("ImageUrl", editingService.imageUrl);
      }

      // Gửi request với FormData
      const response = await axiosClientVer2.put(`/service-details`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Cập nhật dịch vụ thành công");
      setIsEditModalVisible(false); // Đóng modal
      setUploadedFile(null); // Reset file đã upload
      getServiceDetail(); // Làm mới dữ liệu
    } catch (err) {
      // console.error("Error during update:", err);
      // message.error("Không thể cập nhật dịch vụ");
    }
  };

  const handleDeleteServiceInServiceDetail = async (serviceId) => {
    try {
      const response = await axiosClientVer2.delete(`/service-details/${serviceId}`);
      message.success("Xóa dịch vụ thành công");
      getServiceDetail(); // Lấy lại thông tin sau khi xóa
    } catch (err) {
      console.error("Error during delete:", err);
      message.error("Không thể xóa dịch vụ");
    }
  }

  const renderTreeData = (subCategories) => {
    return subCategories.map((subCategory) => ({
      title: (
        <Space className="tree-category-node">
          <FolderOpenOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text strong className="category-name">{subCategory.name}</Text>
          <Space size={4}>
            <Tooltip title="Thêm dịch vụ">
              <Tag 
                color="success" 
                style={{ cursor: "pointer" }}
                onClick={() => {
                  onSelectSubCategory([subCategory.subCategoryId], {
                    selected: true,
                    node: { key: subCategory.subCategoryId },
                  });
                  setAddSubCategoryModalVisible(true);
                }}
              >
                + Thêm
              </Tag>
            </Tooltip>
            <Tooltip title="Cập nhật dịch vụ">
              <Tag 
                color="warning" 
                style={{ cursor: "pointer" }}
                onClick={() => {
                  onSelectSubCategoryToUpdate([subCategory], {
                    selected: true,
                    node: { item: subCategory },
                  });
                  setIsOpenUpdateServiceLevel1(true);
                }}
              >
                <MdUpdate />
              </Tag>
            </Tooltip>
            <Tooltip title="Xóa dịch vụ">
              <Popconfirm
                title="Xóa dịch vụ"
                description="Bạn muốn xóa dịch vụ này?"
                onConfirm={handleDelete}
                onCancel={handleCancelDelete}
                okText="Đồng ý"
                cancelText="Không"
              >
                <Tag color="error" style={{ cursor: "pointer" }}>
                  <LuDelete />
                </Tag>
              </Popconfirm>
            </Tooltip>
          </Space>
        </Space>
      ),
      key: subCategory.subCategoryId,
      children: subCategory.serviceDetails.map((service) => ({
        title: (
          <Card 
            className="service-tree-item" 
            size="small" 
            style={{ 
              marginBottom: "8px",
              width: "100%",
              maxWidth: "100%"
            }}
            hoverable
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "flex-start",
              width: "100%"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                width: "calc(100% - 40px)",
                overflow: "hidden"
              }}>
                <Avatar 
                  src={service.imageUrl} 
                  shape="square" 
                  size={40} 
                  alt={service.name} 
                  style={{ 
                    objectFit: "contain", 
                    backgroundColor: "#f0f0f0",
                    flexShrink: 0,
                    marginRight: "8px"
                  }}
                />
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  width: "calc(100% - 48px)",
                  overflow: "hidden"
                }}>
                  <Text 
                    strong 
                    ellipsis={{ tooltip: service.name }}
                    style={{ width: "100%" }}
                  >
                    {service.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {service.price.toLocaleString("vi-VN")} VND
                  </Text>
                </div>
              </div>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="update"
                      icon={<EyeOutlined style={{ color: '#1890ff' }} />}
                      className="menu-item-view"
                      onClick={() => handleViewDetailService(service.serviceId)}
                      style={{ color: '#1890ff' }}
                    >
                      Xem chi tiết
                    </Menu.Item>
                    <Menu.Item
                      key="view"
                      icon={<EditOutlined style={{ color: '#52c41a' }} />}
                      className="menu-item-edit"
                      onClick={() =>
                        handleEditServicesInServiceDetail(service.serviceId)
                      }
                      style={{ color: '#52c41a' }}
                    >
                      Chỉnh sửa
                    </Menu.Item>
                    <Menu.Item
                      key="add-additional"
                      icon={<PlusCircleOutlined style={{ color: '#722ed1' }} />}
                      className="menu-item-add"
                      onClick={() => handleAddAdditionalService(service.serviceId)}
                      style={{ color: '#722ed1' }}
                    >
                      Thêm dịch vụ đi kèm
                    </Menu.Item>
                    <Menu.Item
                      key="edit-additional"
                      icon={<RiSettings4Fill style={{ color: '#faad14' }} />}
                      className="menu-item-edit-extras"
                      onClick={() => handleEditExtras(service.serviceId)}
                      style={{ color: '#faad14' }}
                    >
                      Chỉnh sửa dịch vụ đi kèm
                    </Menu.Item>
                    <Menu.Item
                      key="remove-all-extras"
                      icon={<MdOutlinePlaylistRemove style={{ color: '#ff4d4f' }} />}
                      className="menu-item-remove-extras"
                      onClick={() => handleRemoveAllExtras(service.serviceId)}
                      style={{ color: '#ff4d4f' }}
                    >
                      Xóa tất cả dịch vụ đi kèm
                    </Menu.Item>
                    <Menu.Item
                      key="delete"
                      icon={<DeleteOutlined />}
                      danger
                      className="menu-item-delete"
                      onClick={() => {
                        console.log("check serviceId", service.serviceId);
                        handleDeleteServiceInServiceDetail(service.serviceId);
                      }}
                    >
                      Xóa dịch vụ này
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button 
                  type="text" 
                  icon={<MoreOutlined />} 
                  size="small"
                  className="action-button"
                  onClick={(e) => e.stopPropagation()}
                  style={{ flexShrink: 0 }}
                />
              </Dropdown>
            </div>
            {service.description && (
              <div style={{ 
                marginTop: "8px", 
                width: "100%",
                paddingRight: "24px"
              }}>
                <Text 
                  type="secondary" 
                  style={{ fontSize: "12px", width: "100%" }}
                >
                  {service.description.substring(0, 10)}
                  {service.description.length > 10 && '...'}
                  {service.description.length > 10 && (
                    <Tooltip title={service.description}>
                      <Text
                        type="link"
                        style={{ fontSize: "12px", cursor: "pointer", marginLeft: "4px" }}
                      >
                        xem thêm
                      </Text>
                    </Tooltip>
                  )}
                </Text>
              </div>
            )}
          </Card>
        ),
        key: service.serviceId,
      })),
    }));
  };

  const treeData = renderTreeData(serviceDetailFull?.subCategories || []);

  const handleViewDetailService = async (serviceId) => {
    try {
      // Set loading state
      setIsViewModalVisible(true);
      
      // Fetch service details
      const response = await axiosClientVer2.get(`/service-details/${serviceId}`);
      const serviceDetails = response.data;
      console.log("Service details:", serviceDetails);
      
      // Set the data for view modal
      setViewServiceDetails(serviceDetails);
    } catch (error) {
      console.error("Error fetching service details:", error);
      message.error("Không thể tải thông tin chi tiết dịch vụ");
    }
  };

  const fetchExtraCategories = async () => {
    try {
      setLoadingExtras(true);
      const response = await axiosClientVer2.get('/extra-categories');
      setExtraCategories(response.data);
      console.log("Extra categories:", response.data);
    } catch (error) {
      console.error("Error fetching extra categories:", error);
      message.error("Không thể tải danh sách dịch vụ đi kèm");
    } finally {
      setLoadingExtras(false);
    }
  };

  const handleAddAdditionalService = (serviceId) => {
    console.log("Adding additional service for serviceId:", serviceId);
    setCurrentServiceId(serviceId);
    setSelectedExtraIds([]);
    setIsAddExtraModalVisible(true);
    fetchExtraCategories();
  };

  const handleExtraCheckboxChange = (extraId) => {
    setSelectedExtraIds(prevSelected => {
      if (prevSelected.includes(extraId)) {
        return prevSelected.filter(id => id !== extraId);
      } else {
        return [...prevSelected, extraId];
      }
    });
  };

  const handleSubmitExtras = async () => {
    if (selectedExtraIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một dịch vụ đi kèm");
      return;
    }

    try {
      setSubmittingExtras(true);
      const payload = {
        serviceId: currentServiceId,
        extraIds: selectedExtraIds
      };

      const response = await axiosClientVer2.post('/service-details/add-extras', payload);
      console.log("Add extras response:", response.data);
      
      const { successCount, failedCount } = response.data;
      
      if (failedCount === 0) {
        if (successCount > 0) {
          message.success(`Đã thêm thành công ${successCount} dịch vụ đi kèm`);
        }
      } else {
        message.error(`Thêm thất bại ${failedCount} dịch vụ đi kèm`);
      }
      
      setIsAddExtraModalVisible(false);
      getServiceDetail(); // Refresh service details
    } catch (error) {
      console.error("Error adding extras:", error);
      message.error("Không thể thêm dịch vụ đi kèm");
    } finally {
      setSubmittingExtras(false);
    }
  };

  const handleEditExtras = async (serviceId) => {
    try {
      setCurrentServiceId(serviceId);
      setLoadingExtras(true);
      setIsEditExtrasModalVisible(true);
      
      // Fetch service details to get current extras
      const response = await axiosClientVer2.get(`/service-details/${serviceId}`);
      const serviceDetails = response.data;
      
      // Extract current extras IDs from all categories
      let currentExtras = [];
      if (serviceDetails.extraCategories && serviceDetails.extraCategories.length > 0) {
        serviceDetails.extraCategories.forEach(category => {
          if (category.extras && category.extras.length > 0) {
            currentExtras = [...currentExtras, ...category.extras.map(extra => extra.extraId)];
          }
        });
      }
      
      setCurrentServiceExtras(serviceDetails.extraCategories || []);
      setSelectedExtraIds(currentExtras);
      
      // Fetch all available extras
      await fetchExtraCategories();
    } catch (error) {
      console.error("Error fetching service extras:", error);
      message.error("Không thể tải thông tin dịch vụ đi kèm");
      setIsEditExtrasModalVisible(false);
    } finally {
      setLoadingExtras(false);
    }
  };

  const handleUpdateExtras = async () => {
    try {
      setSubmittingExtras(true);
      
      const payload = {
        serviceId: currentServiceId,
        extraIds: selectedExtraIds
      };
      
      // Use the update-extras endpoint to update extras
      const response = await axiosClientVer2.put('/service-details/update-extras', payload);
      
      message.success("Cập nhật dịch vụ đi kèm thành công");
      setIsEditExtrasModalVisible(false);
      getServiceDetail(); // Refresh service details
    } catch (error) {
      console.error("Error updating extras:", error);
      message.error("Không thể cập nhật dịch vụ đi kèm");
    } finally {
      setSubmittingExtras(false);
    }
  };

  const handleRemoveAllExtras = (serviceId) => {
    Modal.confirm({
      title: 'Xác nhận xóa tất cả dịch vụ đi kèm',
      content: 'Bạn có chắc chắn muốn xóa tất cả dịch vụ đi kèm của dịch vụ này?',
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axiosClientVer2.delete(`/service-details/remove-extras/${serviceId}`);
          message.success("Đã xóa tất cả dịch vụ đi kèm");
          getServiceDetail(); // Refresh service details
        } catch (error) {
          console.error("Error removing all extras:", error);
          message.error("Không thể xóa dịch vụ đi kèm");
        }
      }
    });
  };
  
  return (
    <div className="tree-services-container">
      <Card bordered={false} className="tree-card">
        <Tree
          treeData={treeData}
          showLine={{ showLeafIcon: false }}
          defaultExpandAll
          onSelect={onSelectSubCategory}
          className="services-tree"
        />
      </Card>

      {/* Modal for editing service */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Chỉnh sửa dịch vụ</span>
          </Space>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        className="edit-service-modal"
        width={600}
        centered
      >
        <Divider style={{ margin: "12px 0" }} />
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: editingService?.name,
            price: editingService?.price,
            description: editingService?.description,
            imageUrl: editingService?.imageUrl,
          }}
          onFinish={handleUpdateService}
        >
          <Form.Item
            label="Tên dịch vụ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>

          <Form.Item
            label="Giá dịch vụ"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ!" }]}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá dịch vụ"
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} placeholder="Nhập mô tả dịch vụ" />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            tooltip={{ title: "Tải lên hình ảnh cho dịch vụ", icon: <InfoCircleOutlined /> }}
          >
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={(file) => {
                setUploadedFile(file);
                return false; // Ngăn upload tự động
              }}
              onRemove={() => {
                setUploadedFile(null);
              }}
              fileList={uploadedFile ? [
                {
                  uid: '-1',
                  name: uploadedFile.name,
                  status: 'done',
                  originFileObj: uploadedFile,
                }
              ] : []}
              listType="picture-card"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              {!uploadedFile && (
                <div>
                  <UploadOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div style={{ marginTop: 8, color: '#666' }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* Thêm phần xem trước hình ảnh */}
          {(editingService?.imageUrl && !uploadedFile) && (
            <Form.Item label="Hình ảnh hiện tại">
              <div style={{ marginTop: "10px" }}>
                <img
                  src={editingService?.imageUrl}
                  alt="Xem trước"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    display: "block",
                    margin: "0 auto",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                    padding: "4px",
                  }}
                />
              </div>
            </Form.Item>
          )}

          <Divider style={{ margin: "12px 0 20px" }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for viewing service details */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <span>Chi tiết dịch vụ</span>
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setViewServiceDetails(null);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setIsViewModalVisible(false);
              setViewServiceDetails(null);
            }}
          >
            Đóng
          </Button>
        ]}
        width={700}
        centered
      >
        {viewServiceDetails ? (
          <div className="service-detail-container">
            <Card bordered={false}>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: '0 0 200px' }}>
                  <img 
                    src={viewServiceDetails.imageUrl} 
                    alt={viewServiceDetails.name}
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px', 
                      objectFit: 'cover',
                      border: '1px solid #f0f0f0'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Title level={4}>{viewServiceDetails.name}</Title>
                  <Divider style={{ margin: '12px 0' }} />
                  <p><strong>Giá:</strong> {viewServiceDetails.price.toLocaleString('vi-VN')} VND</p>
                  {viewServiceDetails.description && (
                    <p><strong>Mô tả:</strong> {viewServiceDetails.description}</p>
                  )}
                  <p><strong>Ngày tạo:</strong> {new Date(viewServiceDetails.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {viewServiceDetails.extraCategories && viewServiceDetails.extraCategories.length > 0 && (
                <>
                  <Divider orientation="left">Dịch vụ đi kèm</Divider>
                  {viewServiceDetails.extraCategories.map(category => (
                    <div key={category.extraCategoryId} style={{ marginBottom: '16px' }}>
                      <Title level={5} style={{ color: '#722ed1' }}>
                        {category.categoryName}
                      </Title>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {category.extras.map(extra => (
                          <Card 
                            key={extra.extraId} 
                            size="small" 
                            style={{ 
                              width: 200, 
                              marginBottom: '8px',
                              borderRadius: '8px' 
                            }}
                            hoverable
                          >
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                              <img 
                                src={extra.imageUrl} 
                                alt={extra.name}
                                style={{ 
                                  height: '100px', 
                                  maxWidth: '100%', 
                                  objectFit: 'contain',
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                            <div>
                              <Text strong>{extra.name}</Text>
                              <div>
                                <Tag color="green">{extra.price.toLocaleString('vi-VN')} VND</Tag>
                              </div>
                              {extra.description && (
                                <Text type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '12px' }}>
                                  {extra.description}
                                </Text>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </Card>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Đang tải thông tin..." />
          </div>
        )}
      </Modal>

      {/* Modal for adding extras to a service */}
      <Modal
        title={
          <Space>
            <PlusCircleOutlined style={{ color: '#722ed1' }} />
            <span>Thêm dịch vụ đi kèm</span>
          </Space>
        }
        open={isAddExtraModalVisible}
        onCancel={() => setIsAddExtraModalVisible(false)}
        width={800}
        centered
        footer={[
          <Button 
            key="submit" 
            type="primary"
            onClick={handleSubmitExtras}
            loading={submittingExtras}
            disabled={selectedExtraIds.length === 0}
          >
            Thêm dịch vụ đi kèm ({selectedExtraIds.length})
          </Button>
        ]}
      >
        {loadingExtras ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin tip="Đang tải danh sách dịch vụ đi kèm..." />
          </div>
        ) : (
          <div className="extra-categories-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {extraCategories.map(category => (
              <div key={category.extraCategoryId} style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ color: '#722ed1', marginBottom: '16px' }}>
                  {category.name}
                </Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {category.extras && category.extras.length > 0 ? (
                    category.extras.map(extra => (
                      <Card
                        key={extra.extraId}
                        hoverable
                        style={{ 
                          width: 230, 
                          marginBottom: '12px',
                          position: 'relative',
                          border: selectedExtraIds.includes(extra.extraId) 
                            ? '2px solid #722ed1' 
                            : '1px solid #f0f0f0'
                        }}
                        onClick={() => handleExtraCheckboxChange(extra.extraId)}
                      >
                        {selectedExtraIds.includes(extra.extraId) && (
                          <div 
                            style={{ 
                              position: 'absolute', 
                              top: '-10px', 
                              right: '-10px', 
                              backgroundColor: '#722ed1', 
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 1
                            }}
                          >
                            <CheckOutlined />
                          </div>
                        )}
                        <div style={{ padding: '8px', textAlign: 'center' }}>
                          <img 
                            src={extra.imageUrl} 
                            alt={extra.name}
                            style={{ 
                              height: '120px', 
                              maxWidth: '100%', 
                              objectFit: 'contain',
                              marginBottom: '8px'
                            }}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                              {extra.name}
                            </Text>
                            <Tag color="green" style={{ marginBottom: '8px' }}>
                              {extra.price.toLocaleString('vi-VN')} VND
                            </Tag>
                            {extra.description && (
                              <Text type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '12px', display: 'block' }}>
                                {extra.description}
                              </Text>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Empty description="Không có dịch vụ đi kèm trong danh mục này" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal for editing extras */}
      <Modal
        title={
          <Space>
            <RiSettings4Fill style={{ color: '#faad14' }} />
            <span>Chỉnh sửa dịch vụ đi kèm</span>
          </Space>
        }
        open={isEditExtrasModalVisible}
        onCancel={() => setIsEditExtrasModalVisible(false)}
        width={800}
        centered
        footer={[
          <Button 
            key="submit" 
            type="primary"
            onClick={handleUpdateExtras}
            loading={submittingExtras}
          >
            Lưu thay đổi
          </Button>
        ]}
      >
        {loadingExtras ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin tip="Đang tải danh sách dịch vụ đi kèm..." />
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <Title level={5}>Dịch vụ đi kèm hiện tại</Title>
              {currentServiceExtras.length > 0 ? (
                currentServiceExtras.map(category => (
                  <div key={`current-${category.extraCategoryId}`} style={{ marginBottom: '16px' }}>
                    <Text strong style={{ color: '#722ed1' }}>{category.categoryName}</Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {category.extras.map(extra => (
                        <Tag key={`current-extra-${extra.extraId}`} color="blue">
                          {extra.name} ({extra.price.toLocaleString('vi-VN')} VND)
                        </Tag>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <Empty description="Không có dịch vụ đi kèm" />
              )}
            </div>
            
            <Divider>Chọn dịch vụ đi kèm mới</Divider>
            
            <div className="extra-categories-container" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {extraCategories.map(category => (
                <div key={category.extraCategoryId} style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ color: '#722ed1', marginBottom: '16px' }}>
                    {category.name}
                  </Title>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {category.extras && category.extras.length > 0 ? (
                      category.extras.map(extra => (
                        <Card
                          key={extra.extraId}
                          hoverable
                          style={{ 
                            width: 230, 
                            marginBottom: '12px',
                            position: 'relative',
                            border: selectedExtraIds.includes(extra.extraId) 
                              ? '2px solid #722ed1' 
                              : '1px solid #f0f0f0'
                          }}
                          onClick={() => handleExtraCheckboxChange(extra.extraId)}
                        >
                          {selectedExtraIds.includes(extra.extraId) && (
                            <div 
                              style={{ 
                                position: 'absolute', 
                                top: '-10px', 
                                right: '-10px', 
                                backgroundColor: '#722ed1', 
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1
                              }}
                            >
                              <CheckOutlined />
                            </div>
                          )}
                          <div style={{ padding: '8px', textAlign: 'center' }}>
                            <img 
                              src={extra.imageUrl} 
                              alt={extra.name}
                              style={{ 
                                height: '120px', 
                                maxWidth: '100%', 
                                objectFit: 'contain',
                                marginBottom: '8px'
                              }}
                            />
                            <div style={{ marginTop: '8px' }}>
                              <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                                {extra.name}
                              </Text>
                              <Tag color="green" style={{ marginBottom: '8px' }}>
                                {extra.price.toLocaleString('vi-VN')} VND
                              </Tag>
                              {extra.description && (
                                <Text type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: '12px', display: 'block' }}>
                                  {extra.description}
                                </Text>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <Empty description="Không có dịch vụ đi kèm trong danh mục này" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TreeServicesDetail;
