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
} from "@ant-design/icons";
import { MdUpdate } from "react-icons/md";
import { LuDelete } from "react-icons/lu";

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
  const [editingService, setEditingService] = useState({});
  const [form] = Form.useForm(); // Thêm hook useForm
  const [uploadedFile, setUploadedFile] = useState(null);



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
    setIsEditModalVisible(true); // Show the modal
  };

  console.log("check editingService", editingService);
  const handleUpdateService = async (values) => {
    try {
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      const { name, price, description, imageUrl } = values;

      // Thêm các trường dữ liệu vào FormData
      formData.append("ServiceId", editingService.serviceId);
      formData.append("Name", name);
      formData.append("Price", price);
      formData.append("Description", description || "");
      formData.append("Image", imageUrl);

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
            style={{ marginBottom: "8px" }}
            hoverable
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space align="center">
                <Avatar 
                  src={service.imageUrl} 
                  shape="square" 
                  size={40} 
                  alt={service.name} 
                  style={{ objectFit: "contain", backgroundColor: "#f0f0f0" }}
                />
                <Space direction="vertical" size={0}>
                  <Text strong>{service.name}</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {service.price.toLocaleString("vi-VN")} VND
                  </Text>
                </Space>
              </Space>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="update"
                      icon={<EyeOutlined />}
                      className="menu-item-view"
                      onClick={() => setIsEditModalVisible(true)}
                    >
                      Xem chi tiết
                    </Menu.Item>
                    <Menu.Item
                      key="view"
                      icon={<EditOutlined />}
                      className="menu-item-edit"
                      onClick={() =>
                        handleEditServicesInServiceDetail(service.serviceId)
                      }
                    >
                      Chỉnh sửa
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
                      Xóa
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
                />
              </Dropdown>
            </div>
            {service.description && (
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" ellipsis={{ rows: 2 }}>
                  {service.description}
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
            name="imageUrl"
            valuePropName="file"
            tooltip={{ title: "Tải lên hình ảnh cho dịch vụ", icon: <InfoCircleOutlined /> }}
          >
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={(file) => {
                setUploadedFile(file);
                return false;
              }}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
              listType="picture-card"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              <div>
                <UploadOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div style={{ marginTop: 8, color: '#666' }}>Tải ảnh</div>
              </div>
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
                Hủy bỏ
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật dịch vụ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TreeServicesDetail;
