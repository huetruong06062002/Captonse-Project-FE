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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  MoreOutlined,
  EditOutlined,
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
  const { categories, isLoading, error } = useSelector(
    (state) => state.extraCategories
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExtra, setEditingExtra] = useState(null);
  // State để lưu hình ảnh khi người dùng chọn
  const [imageFile, setImageFile] = useState(null);

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
    dispatch(deleteExtraCategory(extraCategoryId)); // Gọi API xóa extra category
  };

  // Extra
  const handleEditExtra = (extra) => {
    // Xử lý logic chỉnh sửa thông tin Extra, có thể mở một Modal hoặc form để người dùng cập nhật

    setEditingExtra(extra); // Lưu thông tin của Extra đang được chỉnh sửa
    setIsEditModalVisible(true); // Mở modal chỉnh sửa
  };

  const handleDeleteExtra = (extraId) => {
    // Xóa Extra
    dispatch(deleteExtra(extraId));
  };

  const handleUpdateExtra = () => {
    if (!editingExtra || !editingExtra.name) {
      message.error("Please provide extra name!");
      return;
    }
    dispatch(updateExtra(editingExtra)).then(dispatch(getExtraCategories())); // Gọi API cập nhật Extra
    setIsEditModalVisible(false); // Đóng modal sau khi cập nhật
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
                      onClick={() => handleEditExtra(extra)} // Sửa dịch vụ
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      key="delete"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteExtra(extra.extraId)} // Xóa dịch vụ
                      style={{ color: "red" }}
                    >
                      Delete
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Button
                  icon={<MoreOutlined />}
                  style={{ marginLeft: "auto" }}
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

  return (
    <div style={{ margin: "20px"}}>
      <div style={{display: "flex", gap: "1rem" }}>
        <Button
          type="primary"
          style={{ marginLeft: "80%" }}
          onClick={() => {
            dispatch(getExtraCategories());
          }}
        >
          Refresh
        </Button>
        <Button
          type="primary"
          onClick={() => setIsModalVisible(true)}
        >
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
                {/* Icon menu for extra actions (delete, etc.) */}
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
      </div>

      <Pagination
        current={currentPage}
        total={categories.length}
        pageSize={pageSize}
        onChange={handlePaginationChange}
        showSizeChanger={false}
        style={{ marginTop: "1rem", float: "right" }}
      />

      {/* Modal tạo extra category */}
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

      {/* Modal cho chỉnh sửa Extra:    */}
      <Modal
        title="Chỉnh sửa dịch vụ"
        visible={isEditModalVisible}
        onOk={handleUpdateExtra}
        onCancel={() => setIsEditModalVisible(false)}
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
        {/* Field chỉnh sửa hình ảnh imageUrl */}
        <Input
          type="file"
          onChange={handleImageChange}
          style={{ marginTop: "10px" }}
          accept="image/*" // Chỉ cho phép chọn file ảnh
        />
        {imageFile && <p>File selected: {imageFile.name}</p>}{" "}
        {/* Hiển thị tên file hình ảnh nếu đã chọn */}
        {imageFile && (
          <Image src={URL.createObjectURL(imageFile)} width={50} height={50} />
        )}{" "}
      </Modal>
    </div>
  );
}

export default ExtraCategories;
