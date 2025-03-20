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
} from "antd";
import { useState, useEffect } from "react";
import TreeServicesDetail from "./TreeServicesDetail";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";

export const ServicesDetail = (props) => {
  const { openDrawerDetail, setOpenDrawerDetail, servicesDetail } = props;

  const [serviceDetailFull, setServiceDetailFull] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddSubCategoryModalVisible, setAddSubCategoryModalVisible] =
    useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [form] = Form.useForm();

  const [isOpenCreateServiceLevel1, setIsOpenCreateServiceLevel1] =
    useState(false);

  const handleUpdateServiceLevel1 = () => {
    setAddSubCategoryModalVisible(false);
    setIsOpenCreateServiceLevel1(true);
  };

  // Hàm đóng Drawer
  const onClose = () => {
    setOpenDrawerDetail(false);
  };
  console.log("servicesDetail", servicesDetail);

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
      console.log("check node id ", node.key);
      setSelectedSubCategoryId(node.key); // Lưu ID của subcategory đã chọn
      // setAddSubCategoryModalVisible(true); // Mở modal để thêm thông tin dịch vụ cho danh mục con
    }
  };

  // Hàm xử lý việc thêm dịch vụ mới cho danh mục con đã chọn
  const handleAddSubCategory = async (values) => {
    const { Name, Description, Price, Image } = values;
    const formData = new FormData();

    // Thêm dữ liệu vào FormData
    formData.append("SubCategoryId", selectedSubCategoryId);
    formData.append("Name", Name);
    formData.append("Description", Description);
    formData.append("Price", +Price);

    // Kiểm tra nếu có ảnh được chọn
    if (Image && Image.file) {
      formData.append("Image", Image.file); // Image là đối tượng file khi sử dụng Upload của Ant Design
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
      getServiceDetail(); // Lấy lại thông tin chi tiết để cập nhật
    } catch (err) {
      message.error("Không thể thêm dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateServies = async (values) => {
    const { name } = values;
    console.log("values", values);
    try {
      setIsLoading(true);
      const response = await axiosClientVer2.post("/subcategories", {
        categoryId: servicesDetail.categoryId,
        name: name,
      });
  
      message.success("Dịch vụ đã được tạo thành công!");
      console.log(response.data);
  
      setIsOpenCreateServiceLevel1(false); // Đóng modal sau khi tạo dịch vụ
      getServiceDetail(); // Lấy lại chi tiết dịch vụ
    } catch (error) {
      message.error("Đã xảy ra lỗi khi tạo dịch vụ");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Drawer
        title={
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <strong>Xem chi tiết dịch vụ</strong>
            <p style={{ color: "green" }}>{servicesDetail?.name}</p>
            <img src={servicesDetail?.icon} width={25} alt="" />
          </div>
        }
        placement={"right"}
        onClose={onClose}
        open={openDrawerDetail}
        width={1200}
        extra={
          <Space>
            <Button
              type="primary"
              onClick={() => setIsOpenCreateServiceLevel1(true)}
            >
              Thêm dịch vụ con cho danh mục
            </Button>
            <Button
              style={{ background: "red", color: "white" }}
              onClick={onClose}
            >
              Đóng
            </Button>
          </Space>
        }
      >
        {isLoading ? (
          <Spin tip="Đang xử lý dữ liệu" />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <TreeServicesDetail
            serviceDetailFull={serviceDetailFull}
            onSelectSubCategory={onSelectSubCategory}
            handleAddSubCategory={handleAddSubCategory}
            handleUpdateServiceLevel1={handleUpdateServiceLevel1}
            setAddSubCategoryModalVisible={setAddSubCategoryModalVisible}
            selectedSubCategoryId={selectedSubCategoryId}
            getServiceDetail={getServiceDetail}
          />
        )}
      </Drawer>

      {/*Modal tạo services cấp 1  */}
      <Modal
        title="Tạo Dịch Vụ"
        open={isOpenCreateServiceLevel1}
        onCancel={() => {
          setIsOpenCreateServiceLevel1(false);
        }}
        footer={null} // Ẩn footer mặc định
      >
        <Form
          form={form} // Liên kết với form
          name="service-form"
          onFinish={handleCreateServies} // Đảm bảo chỉ sử dụng onFinish
        >
          <Form.Item
            label="Tên Dịch Vụ"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit" // Chỉ cần sử dụng htmlType="submit"
              loading={isLoading}
              style={{ marginLeft: "70%" }}
            >
              Tạo Dịch Vụ
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm dịch vụ vào danh mục con */}
      <Modal
        title="Thêm dịch vụ cho danh mục con"
        visible={isAddSubCategoryModalVisible}
        onCancel={() => setAddSubCategoryModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleAddSubCategory}>
          <Form.Item
            name="Name"
            label="Tên dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="Description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="Price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="Image"
            label="Hình ảnh"
            rules={[{ required: true, message: "Vui lòng tải hình ảnh" }]}
          >
            <Upload
              action="/upload" // API upload ảnh của bạn
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false} // Giới hạn không cho upload ngay
              maxCount={1} // Giới hạn chỉ chọn 1 file
            >
              <Button>Chọn hình ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
