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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  MoreOutlined,
  EditOutlined,
  UploadOutlined,
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

const { Panel } = Collapse;

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
  const [imageFile, setImageFile] = useState(null); // State để lưu hình ảnh khi người dùng chọn
  const [isAddServiceModalVisible, setIsAddServiceModalVisible] =
    useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });

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

  const handleDeleteCategory = (extraCategoryId) => {
    dispatch(deleteExtraCategory(extraCategoryId)).then(() =>
      dispatch(getExtraCategories())
    ); // Gọi API xóa extra category
    // Fetch lại danh sách sau khi xóa
  };

  const handleEditExtra = (extra) => {
    setEditingExtra(extra); // Lưu thông tin của Extra đang được chỉnh sửa
    setIsEditModalVisible(true); // Mở modal chỉnh sửa
  };

  const handleDeleteExtra = (extraId) => {
    dispatch(deleteExtra(extraId)).then(() => {
      dispatch(getExtraCategories());
    });
  };
  const handleUpdateExtra = async () => {
    if (!editingExtra || !editingExtra.name) {
      message.error("Please provide extra name!");
      return;
    }

    setLoading(true); // Bật trạng thái loading
    try {
      dispatch(updateExtra(editingExtra));
      dispatch(getExtraCategories()); // Fetch lại danh sách sau khi cập nhật
      message.success("Cập nhật thành công!");
      setIsEditModalVisible(false); // Đóng modal sau khi cập nhật
    } catch (error) {
      message.error("Cập nhật thất bại!");
    } finally {
      setLoading(false); // Tắt trạng thái loading
    }
  };
  const renderExtras = (extras) => {
    return extras?.map((extra) => (
      <Collapse key={extra.extraId}>
        <Panel
          header={
            <div style={{ display: "flex", alignItems: "center" }}>
              <Image
                src={extra.imageUrl}
                alt={extra.name}
                width={50}
                height={50}
                style={{ marginRight: "8px", borderRadius: "4px" }}
              />
              <p style={{ marginLeft: "1rem" }}>{extra.name}</p>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        handleEditExtra(extra);
                      }} // Sửa dịch vụ
                    >
                      Cập nhật
                    </Menu.Item>
                    <Menu.Item
                      key="delete"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteExtra(extra.extraId)} // Xóa dịch vụ
                      style={{ color: "red" }}
                    >
                      Xóa
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button
                  icon={<MoreOutlined />}
                  style={{ marginLeft: "auto" }}
                  onClick={(e) => e.stopPropagation()} // Ngừng sự kiện bùng phát
                />
              </Dropdown>
            </div>
          }
          key={extra.extraId}
        >
          <p>{extra.description || "No description available."}</p>
          <p>Price: {extra.price} VND</p>
        </Panel>
      </Collapse>
    ));
  };

  const handleCreateExtraCategory = () => {
    if (!newCategoryName) {
      message.error("Please enter a category name");
      return;
    }
    dispatch(createExtraCategory(newCategoryName)); // Gọi API tạo extra category
    setIsModalVisible(false);
    setNewCategoryName(""); // Reset input
  };

  // Dropdown menu for category actions (edit, delete, etc.)
  const menu = (extraCategoryId) => (
    <Menu>
      <Menu.Item
        key="add"
        icon={<PlusOutlined />}
        style={{
          marginTop: "10px",
          color: "white",
          background: "blue",
        }}
        onClick={() => handleAddService(extraCategoryId)}
      >
        Thêm dịch vụ
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleDeleteCategory(extraCategoryId)}
        style={{
          marginTop: "2px",
          color: "white",
          background: "red",
        }}
      >
        Xóa dịch vụ
      </Menu.Item>
    </Menu>
  );

  // Hàm xử lý khi người dùng chọn ảnh mới
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Lấy tệp người dùng chọn
    if (file) {
      setImageFile(file); // Lưu tệp vào state
      setEditingExtra({ ...editingExtra, imageUrl: file }); // Cập nhật thông tin hình ảnh trong editingExtra
    }
  };

  const handleOk = () => {
    if (!editingExtra?.name || !editingExtra?.price) {
      message.error("Please fill in all required fields.");
      return;
    }
    handleUpdateExtra(); // Gọi hàm update khi nhấn OK
    setIsEditModalVisible(false); // Đóng modal sau khi cập nhật
  };

  const handleAddService = (extraCategoryId) => {
    // Hiển thị modal hoặc thực hiện logic thêm dịch vụ
    console.log(`Thêm dịch vụ cho danh mục ID: ${extraCategoryId}`);

    setNewService({ ...newService, extraCategoryId }); // Lưu ID của danh mục dịch vụ
    setIsAddServiceModalVisible(true); // Hiển thị modal tạo dịch vụ
  };

  const handleCreateService = async () => {
    if (!newService.name || !newService.price || !newService.image) {
      message.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const formData = new FormData();
    formData.append("ExtraCategoryId", newService.extraCategoryId);
    formData.append("Name", newService.name);
    formData.append("Description", newService.description || "");
    formData.append("Price", newService.price);
    formData.append("Image", newService.image);

    try {
      await dispatch(createExtra(formData)); // Gọi API tạo dịch vụ
      message.success("Thêm dịch vụ thành công!");
      setIsAddServiceModalVisible(false); // Đóng modal
      setNewService({ name: "", description: "", price: "", image: null }); // Reset form
      dispatch(getExtraCategories()); // Fetch lại danh sách
    } catch (error) {
      message.error("Thêm dịch vụ thất bại!");
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button
          type="primary"
          style={{ marginLeft: "80%" }}
          onClick={() => {
            dispatch(getExtraCategories());
          }}
        >
          Refresh
        </Button>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Tạo dịch vụ thêm
        </Button>
      </div>
      <div
        className="extra-categories-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          overflowY: "auto",
          maxHeight: "80vh",
        }}
      >
        {filteredCategories?.map((category) => (
          <div
            key={category.extraCategoryId}
            style={{
              flex: "1 1 21%",
              maxWidth: "300px",
            }}
          >
            <div
              className="category-card"
              style={{
                padding: "1rem",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                backgroundColor: "#fff",
              }}
            >
              <h3 style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ color: "#27ae60" }}>{category.name}</p>
                <Dropdown
                  overlay={menu(category.extraCategoryId)}
                  trigger={["click"]}
                >
                  <Button
                    icon={<MoreOutlined />}
                    style={{
                      marginTop: "10px",
                      color: "white",
                      background: "#b2bec3",
                      border: "none",
                    }}
                  />
                </Dropdown>
              </h3>

              <p style={{ margin: "1rem 0px" }}>
                Ngày tạo: {new Date(category.createdAt).toLocaleString()}
              </p>
              {renderExtras(category.extras)}
            </div>
          </div>
        ))}

        <Pagination
          current={currentPage}
          total={categories.length}
          pageSize={pageSize}
          onChange={handlePaginationChange}
          showSizeChanger={false}
          style={{ marginTop: "1rem", float: "right", position: "absolute", bottom: "1.5rem", right: "1rem", zIndex:1 }}
        />
      </div>

      <Modal
        title="Tạo dịch vụ thêm"
        visible={isModalVisible}
        onOk={handleCreateExtraCategory}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Enter category name"
        />
      </Modal>

      <Modal
        title="Chỉnh sửa dịch vụ"
        visible={isEditModalVisible}
        onOk={handleUpdateExtra}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Input
          value={editingExtra?.name || ""}
          onChange={(e) =>
            setEditingExtra({ ...editingExtra, name: e.target.value })
          }
          placeholder="Enter extra name"
        />
        <Input
          value={editingExtra?.description || ""}
          onChange={(e) =>
            setEditingExtra({ ...editingExtra, description: e.target.value })
          }
          placeholder="Enter extra description"
          style={{ marginTop: "10px" }}
        />
        <Input
          value={editingExtra?.price || ""}
          onChange={(e) =>
            setEditingExtra({ ...editingExtra, price: e.target.value })
          }
          placeholder="Enter extra price"
          type="number"
          style={{ marginTop: "10px" }}
        />

        <Upload
          customRequest={(options) => {
            const { file, onSuccess, onError } = options;
            try {
              // Tạo đối tượng FormData để gửi file
              const formData = new FormData();
              formData.append("file", file); // Gửi file thực tế (binary)

              // Cập nhật ảnh mới vào state (imageUrl sẽ là URL của ảnh khi upload thành công)
              setEditingExtra({
                ...editingExtra,
                imageUrl: file, // Sử dụng URL tạm thời để hiển thị ảnh trên giao diện
              });

              setImageFile(file); // Lưu file vào state
            } catch (error) {
              onError(error); // Nếu có lỗi, thông báo lỗi
            }
          }}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
              message.error("Chỉ được chọn ảnh!");
            }
            return isImage; // Nếu là ảnh mới cho phép upload
          }}
          showUploadList={false} // Không hiển thị danh sách ảnh đã upload
        >
          <Button style={{ marginTop: "1rem" }} icon={<UploadOutlined />}>
            Chọn ảnh
          </Button>
        </Upload>

        {editingExtra?.imageUrl && (
          <div style={{ marginTop: "10px" }}>
            <p>Ảnh hiện tại:</p>
            <Image
              src={
                editingExtra?.imageUrl instanceof File
                  ? URL.createObjectURL(editingExtra?.imageUrl)
                  : editingExtra?.imageUrl // Use the URL directly if it's not a File
              }
              width={50}
              height={50}
              preview={false}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="Thêm dịch vụ"
        visible={isAddServiceModalVisible}
        onOk={handleCreateService} // Gọi hàm tạo dịch vụ
        onCancel={() => setIsAddServiceModalVisible(false)} // Đóng modal
        okText="Tạo"
        cancelText="Hủy"
      >
        <Input
          value={newService.name}
          onChange={(e) =>
            setNewService({ ...newService, name: e.target.value })
          }
          placeholder="Tên dịch vụ"
          style={{ marginBottom: "10px" }}
        />
        <Input
          value={newService.description}
          onChange={(e) =>
            setNewService({ ...newService, description: e.target.value })
          }
          placeholder="Mô tả dịch vụ"
          style={{ marginBottom: "10px" }}
        />
        <Input
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: e.target.value })
          }
          placeholder="Giá dịch vụ"
          type="number"
          style={{ marginBottom: "10px" }}
        />
        <Upload
          beforeUpload={(file) => {
            setNewService({ ...newService, image: file }); // Lưu file vào state
            return false; // Ngăn upload tự động
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
        {newService.image && (
          <div style={{ marginTop: "10px" }}>
            <p>Ảnh đã chọn:</p>
            <Image
              src={URL.createObjectURL(newService.image)}
              width={100}
              height={100}
              preview={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ExtraCategories;
