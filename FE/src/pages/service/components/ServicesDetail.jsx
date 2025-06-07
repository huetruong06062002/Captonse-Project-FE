import {
  Button,
  Modal,
  Space,
  Spin,
  message,
  Form,
  Input,
  Drawer,
  Upload,
  Tooltip,
  Divider,
  Typography,
  Tag,
  Card,
  Empty,
  Badge,
  InputNumber,
  Alert
} from "antd";
import { useState, useEffect, useRef } from "react";
import TreeServicesDetail from "./TreeServicesDetail";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import { IoIosRefresh } from 'react-icons/io';
import {
  PlusOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  PictureOutlined,
  FileImageOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export const ServicesDetail = (props) => {
  const { openDrawerDetail, setOpenDrawerDetail, servicesDetail } = props;

  const [serviceDetailFull, setServiceDetailFull] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddSubCategoryModalVisible, setAddSubCategoryModalVisible] =
    useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [selectedServicesUpdate, setSelectedServicesUpdate] = useState("");
  const [selectedServicesUpdateId, setSelectedServicesUpdateId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const firstRender = useRef(true);

  const [form] = Form.useForm();

  const [isOpenCreateServiceLevel1, setIsOpenCreateServiceLevel1] =
    useState(false);

  const [isOpenUpdateServiceLevel1, setIsOpenUpdateServiceLevel1] =
    useState(false);

  const handleCreateServiceLevel1 = () => {
    setAddSubCategoryModalVisible(false);
    setIsOpenCreateServiceLevel1(true);
  };

  // Hàm đóng Drawer
  const onClose = () => {
    setOpenDrawerDetail(false);
  };

  // Hàm lấy dữ liệu chi tiết dịch vụ từ API
  const getServiceDetail = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClientVer2.get(
        `categories/${servicesDetail.categoryId}`
      );
      setServiceDetailFull(response.data);
    } catch (err) {
      setError("Failed to load service details");
      message.error("Failed to load service details");
    } finally {
      setIsLoading(false);
    }
  };

  // Khi mở Drawer, gọi API để lấy chi tiết dịch vụ
  useEffect(() => {
    if (openDrawerDetail) {
      getServiceDetail();
    }
  }, [openDrawerDetail]);

  // Hàm xử lý khi người dùng chọn một subcategory trong Tree
  const onSelectSubCategory = (selectedKeys, { selected, node }) => {
    if (selected) {
      setSelectedSubCategoryId(node.key);
    }
  };

  useEffect(() => {
    if (selectedServicesUpdate) {
      form.setFieldsValue({ name: selectedServicesUpdate });
    }
  }, [selectedServicesUpdate, form]); // Update form mỗi khi selectedServicesUpdate thay đổi

  const onSelectSubCategoryToUpdate = (selectedKeys, { selected, node }) => {
    if (selected) {
      setSelectedServicesUpdate(node.item.name);
      setSelectedServicesUpdateId(node.item.subCategoryId);
      setIsOpenUpdateServiceLevel1(true); // Mở modal sau khi giá trị đã được set
    }
  };

  const handleCancelUpdate = () => {
    setIsOpenUpdateServiceLevel1(false);
    form.resetFields();
    setSelectedServicesUpdate(""); // Reset selectedServicesUpdate sau khi đóng modal
  };

  // Hàm xử lý việc thêm dịch vụ mới cho danh mục con đã chọn
  const handleAddSubCategory = async (values) => {
    const { Name, Description, Price, Image } = values;
    const formData = new FormData();

    // Thêm dữ liệu vào FormData
    formData.append("SubCategoryId", selectedSubCategoryId);
    formData.append("Name", Name);
    formData.append("Description", Description || "");
    formData.append("Price", +Price);

    // Kiểm tra nếu có ảnh được chọn - sử dụng selectedImage state
    if (selectedImage) {
      formData.append("Image", selectedImage);
    }

    // Debug: Kiểm tra dữ liệu FormData
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      setIsLoading(true);
      // Gửi FormData tới API
      const response = await axiosClientVer2.post(
        "/service-details",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Đảm bảo content type là multipart/form-data
          },
        }
      );
      message.success("Dịch vụ đã được thêm thành công");
      setAddSubCategoryModalVisible(false); // Đóng modal sau khi thêm
      form.resetFields(); // Reset form fields
      setSelectedImage(null); // Reset selected image
      await getServiceDetail(); // Lấy lại thông tin chi tiết để cập nhật
    } catch (err) {
      message.error("Không thể thêm dịch vụ");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateServies = async (values) => {
    const { name } = values;
    try {
      setIsLoading(true);
      const response = await axiosClientVer2.post("/subcategories", {
        categoryId: servicesDetail.categoryId,
        name: name,
      });

      message.success("Dịch vụ đã được tạo thành công!");
      setIsOpenCreateServiceLevel1(false); // Đóng modal sau khi tạo dịch vụ
      getServiceDetail(); // Lấy lại chi tiết dịch vụ
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tạo dịch vụ");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateServices = (values) => {
    const { name } = values;
    try {
      setIsLoading(true);
      const response = axiosClientVer2.put(
        `/subcategories/${selectedServicesUpdateId}`,
        {
          name: name,
        }
      );

      message.success("Dịch vụ đã được cập nhật thành công!");
      setIsOpenUpdateServiceLevel1(false); // Đóng modal sau khi tạo dịch vụ
    } catch (error) {
      message.error("Đã xảy ra lỗi khi cập nhật dịch vụ");
      console.error(error);
    } finally {
      getServiceDetail(); // Lấy lại chi tiết dịch vụ// Lấy lại chi tiết dịch vụ
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer
        title={
          <Space align="center">
            <Badge color="#108ee9" dot={true} />
            <Text strong style={{ fontSize: '16px' }}>Chi tiết dịch vụ: </Text>
            <Tag color="green" style={{ fontSize: '14px' }}>{servicesDetail?.name}</Tag>
            {servicesDetail?.icon && (
              <img src={servicesDetail?.icon} style={{ width: 25, height: 25, borderRadius: '4px' }} alt="" />
            )}
          </Space>
        }
        placement="right"
        onClose={onClose}
        open={openDrawerDetail}
        width={1200}
        headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
        bodyStyle={{ padding: '24px', background: '#f9fafb' }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Đóng
            </Button>
          </div>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              onClick={() => getServiceDetail()}
              icon={<IoIosRefresh />}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              onClick={() => setIsOpenCreateServiceLevel1(true)}
              icon={<PlusOutlined />}
            >
              Thêm dịch vụ con
            </Button>
          </Space>
        }
      >
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <Spin tip="Đang xử lý dữ liệu..." size="large" />
          </div>
        ) : error ? (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
          />
        ) : (
          <Card bordered={false} className="service-detail-card">
            {serviceDetailFull && serviceDetailFull.subCategories && serviceDetailFull.subCategories.length > 0 ? (
              <TreeServicesDetail
                serviceDetailFull={serviceDetailFull}
                onSelectSubCategory={onSelectSubCategory}
                handleAddSubCategory={handleAddSubCategory}
                handleCreateServiceLevel1={handleCreateServiceLevel1}
                setAddSubCategoryModalVisible={setAddSubCategoryModalVisible}
                selectedSubCategoryId={selectedSubCategoryId}
                getServiceDetail={getServiceDetail}
                setSelectedServicesUpdate={setSelectedServicesUpdate}
                setIsOpenUpdateServiceLevel1={setIsOpenUpdateServiceLevel1}
                onSelectSubCategoryToUpdate={onSelectSubCategoryToUpdate}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text type="secondary">Chưa có dịch vụ con nào trong danh mục này</Text>
                }
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setIsOpenCreateServiceLevel1(true)}
                >
                  Tạo dịch vụ con
                </Button>
              </Empty>
            )}
          </Card>
        )}
      </Drawer>

      {/*Modal tạo services cấp 1  */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined />
            <span>Tạo Dịch Vụ Con</span>
          </Space>
        }
        open={isOpenCreateServiceLevel1}
        onCancel={() => {
          setIsOpenCreateServiceLevel1(false);
          form.resetFields();
        }}
        footer={null} // Ẩn footer mặc định
        centered
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form} // Liên kết với form
          name="service-form"
          onFinish={handleCreateServies} // Đảm bảo chỉ sử dụng onFinish
          layout="vertical"
          initialValues={{ name: '' }}
        >
          <Form.Item
            label="Tên Dịch Vụ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
            tooltip="Tên dịch vụ con hiển thị cho khách hàng"
          >
            <Input placeholder="Nhập tên dịch vụ" prefix={<AppstoreOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
          </Form.Item>

          <Divider />
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsOpenCreateServiceLevel1(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit" // Chỉ cần sử dụng htmlType="submit"
                loading={isLoading}
              >
                Tạo Dịch Vụ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/*Modal update services cấp 1  */}
      <Modal
        title={
          <Space>
            <AppstoreOutlined />
            <span>Cập Nhật Dịch Vụ</span>
          </Space>
        }
        open={isOpenUpdateServiceLevel1}
        onCancel={handleCancelUpdate}
        footer={null} // Ẩn footer mặc định
        centered
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form} // Liên kết với form
          name="service-update-form"
          onFinish={handleUpdateServices} // Đảm bảo chỉ sử dụng onFinish
          layout="vertical"
          initialValues={{ name: selectedServicesUpdate }}
        >
          <Form.Item
            label="Tên Dịch Vụ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
            tooltip="Tên dịch vụ hiển thị cho khách hàng"
          >
            <Input 
              placeholder="Nhập tên dịch vụ" 
              prefix={<AppstoreOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
          </Form.Item>

          <Divider />
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelUpdate}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit" // Chỉ cần sử dụng htmlType="submit"
                loading={isLoading}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm dịch vụ vào danh mục con */}
      <Modal
        title={
          <Space>
            <PictureOutlined />
            <span>Thêm dịch vụ cho danh mục con</span>
          </Space>
        }
        open={isAddSubCategoryModalVisible}
        onCancel={() => {
          setAddSubCategoryModalVisible(false);
          form.resetFields();
          setSelectedImage(null);
        }}
        footer={null}
        width={600}
        centered
        maskClosable={false}
        destroyOnClose
      >
        <Form 
          form={form} 
          onFinish={handleAddSubCategory}
          layout="vertical"
        >
          <Form.Item
            name="Name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
            tooltip="Tên dịch vụ hiển thị cho khách hàng"
          >
            <Input placeholder="Nhập tên dịch vụ" />
          </Form.Item>
          <Form.Item 
            name="Description" 
            label="Mô tả"
            tooltip="Mô tả về dịch vụ, thông tin chi tiết"
          >
            <Input.TextArea 
              placeholder="Nhập mô tả cho dịch vụ"
              rows={3}
              maxLength={500}
              style={{ resize: 'none' }}
            />
          </Form.Item>
          <Form.Item
            name="Price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ" }]}
            tooltip="Giá dịch vụ (VND)"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập giá dịch vụ" 
              addonAfter="VND"
            />
          </Form.Item>
          <Form.Item
            name="Image"
            label="Hình ảnh"
            rules={[
              { 
                required: true, 
                validator: () => {
                  if (!selectedImage) {
                    return Promise.reject('Vui lòng tải hình ảnh');
                  }
                  return Promise.resolve();
                }
              }
            ]}
            tooltip="Hình ảnh minh họa cho dịch vụ"
          >
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={(file) => {
                // Set file vào state
                setSelectedImage(file);
                // Trigger form validation
                form.validateFields(['Image']);
                return false; // Ngăn auto upload
              }}
              accept="image/*"
            >
              {selectedImage ? (
                <img
                  src={URL?.createObjectURL(selectedImage)}
                  alt="preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <Divider />
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setAddSubCategoryModalVisible(false);
                form.resetFields();
                setSelectedImage(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={isLoading} icon={<UploadOutlined />}>
                Thêm dịch vụ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
