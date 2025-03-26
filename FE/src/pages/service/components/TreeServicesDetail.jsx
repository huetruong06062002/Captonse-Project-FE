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
} from "antd";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { MdUpdate } from "react-icons/md";
import { LuDelete } from "react-icons/lu";
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
        const response = await axiosClientVer2.put(
          `/service-details`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        
        message.success("Cập nhật dịch vụ thành công");
        setIsEditModalVisible(false); // Đóng modal
        setUploadedFile(null); // Reset file đã upload
        getServiceDetail(); // Làm mới dữ liệu
    } catch (err) {
      // console.error("Error during update:", err);
      // message.error("Không thể cập nhật dịch vụ");
    }
  };

  const renderTreeData = (subCategories) => {
    return subCategories.map((subCategory) => ({
      title: (
        <div style={{ display: "flex", gap: "0.25rem", fontSize: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <p
              style={{
                color: "#2ecc71",
                cursor: "pointer", // Thêm con trỏ chuột để cho thấy đây là một phần có thể click
              }}
              onClick={() => {
                onSelectSubCategory([subCategory.subCategoryId], {
                  selected: true,
                  node: { key: subCategory.subCategoryId },
                });
                setAddSubCategoryModalVisible(true);
              }}
            >
              <Tooltip
                placement="right"
                title={"Thêm dịch vụ"}
                style={{ marginTop: "2rem" }}
              >
                {subCategory.name}
              </Tooltip>
            </p>
          </div>
          {/* Biểu tượng update chỉ có sự kiện onClick */}
          <div>
            <p
              style={{
                color: "orange",
                cursor: "pointer",
              }}
              onClick={() => {
                onSelectSubCategoryToUpdate([subCategory], {
                  selected: true,
                  node: { item: subCategory },
                });
              }}
            >
              <Tooltip placement="topLeft" title={"Cập nhật dịch vụ"}>
                <MdUpdate onClick={() => setIsOpenUpdateServiceLevel1(true)} />
              </Tooltip>
            </p>
          </div>
          <div>
            <Tooltip placement="topLeft" title={"Xóa dịch vụ"}>
              <Popconfirm
                title="Xóa dịch vụ"
                description="Bạn muốn xóa dịch vụ này"
                onConfirm={handleDelete}
                onCancel={handleCancelDelete}
                okText="Đồng ý"
                cancelText="Không"
              >
                <LuDelete style={{ color: "red" }} />
              </Popconfirm>
            </Tooltip>
          </div>
        </div>
      ),
      key: subCategory.subCategoryId,
      children: subCategory.serviceDetails.map((service) => ({
        title: (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={service.imageUrl}
                alt={service.name}
                style={{ width: 30, height: 30, marginRight: 10 }}
              />
              {`${service.name} - ${service.price.toLocaleString("de-DE")} VND`}
            </div>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="update"
                    icon={<EyeOutlined />}
                    style={{ backgroundColor: "#fff8e1", color: "#fa8c16" }}
                    onClick={() => setIsEditModalVisible(true)}
                  >
                    Xem chi tiết
                  </Menu.Item>
                  <Menu.Item
                    key="view"
                    icon={<EditOutlined />}
                    style={{ backgroundColor: "#e3f2fd", color: "#1890ff" }}
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
                    style={{ backgroundColor: "#ffebee" }}
                    onClick={() =>
                      onSelectSubCategoryToUpdate(subCategory.subCategoryId)
                    }
                  >
                    Xóa
                  </Menu.Item>
                </Menu>
              }
            >
              <MoreOutlined
                style={{
                  cursor: "pointer",
                  backgroundColor: "#ecf0f1",
                  marginLeft: "1rem",
                  padding: "0.25rem",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        ),
        key: service.serviceId,
      })),
    }));
  };

  const treeData = renderTreeData(serviceDetailFull?.subCategories || []);

  return (
    <div>
      <Tree
        treeData={treeData}
        showLine
        defaultExpandAll
        onSelect={onSelectSubCategory}
      />

      {/* Modal for editing service */}
      <Modal
        title="Chỉnh sửa dịch vụ"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
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
            <Input />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="URL hình ảnh" name="imageUrl">
            <Input />
          </Form.Item>
          {/* Thêm chức năng upload ảnh */}
          <Form.Item label="Upload ảnh mới">
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                // Kiểm tra loại file
                const isImage = file.type.startsWith("image/");
                if (!isImage) {
                  message.error("Bạn chỉ có thể upload file hình ảnh!");
                  return Upload.LIST_IGNORE;
                }

                // Giới hạn kích thước file (2MB)
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("Hình ảnh phải nhỏ hơn 2MB!");
                  return Upload.LIST_IGNORE;
                }

                // Xử lý upload
                const formData = new FormData();
                formData.append("file", file);

                // Thực hiện upload và cập nhật URL
                axiosClientVer2
                  .post("/upload", formData)
                  .then((response) => {
                    const imageUrl = response.data.url; // URL từ server sau khi upload
                    form.setFieldsValue({ imageUrl });
                    message.success("Upload ảnh thành công");
                  })
                  .catch((error) => {
                    console.error("Upload failed:", error);
                    message.error("Upload ảnh thất bại");
                  });

                return false; // Ngăn upload tự động của antd
              }}
            >
              <div>
                <div style={{ marginTop: 8 }}>
                  <Button>Upload ảnh</Button>
                </div>
              </div>
            </Upload>
          </Form.Item>

          {/* Thêm phần xem trước hình ảnh */}
          <Form.Item label="Xem trước hình ảnh">
            {editingService?.imageUrl && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={
                    form.getFieldValue("imageUrl") || editingService?.imageUrl
                  }
                  alt="Xem trước"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    display: "block",
                    margin: "0 auto",
                    border: "1px solid #d9d9d9",
                    borderRadius: "2px",
                    padding: "5px",
                  }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Cập nhật dịch vụ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TreeServicesDetail;
