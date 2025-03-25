import React from "react";
import {
  Dropdown,
  Menu,
  message,
  Popconfirm,
  Space,
  Tooltip,
  Tree,
} from "antd";
import { MdUpdate } from "react-icons/md";
import { LuDelete } from "react-icons/lu";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
} from "@ant-design/icons";
const TreeServicesDetail = ({
  serviceDetailFull,
  onSelectSubCategory,
  setAddSubCategoryModalVisible,
  selectedSubCategoryId,
  getServiceDetail,
  setIsOpenUpdateServiceLevel1,
  onSelectSubCategoryToUpdate,
}) => {
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

  const handleCancelDelete = (e) => {
    console.log(e);
    message.error("Click on No");
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
              width: "100%",
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
                    key="view"
                    icon={<EyeOutlined />}
                    style={{ backgroundColor: "#e3f2fd", color: "#1890ff" }}
                  >
                    Xem chi tiết
                  </Menu.Item>
                  <Menu.Item
                    key="update"
                    icon={<EditOutlined />}
                    style={{ backgroundColor: "#fff8e1", color: "#fa8c16" }}
                  >
                    Cập nhật
                  </Menu.Item>
                  <Menu.Item
                    key="delete"
                    icon={<DeleteOutlined />}
                    danger
                    style={{ backgroundColor: "#ffebee" }}
                  >
                    Xóa
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
              onClick={(e) => e.stopPropagation()} // Ngăn Tree bắt sự kiện click
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
        description: service.description || "No description",
        imageUrl: service.imageUrl,
      })),
    }));
  };

  const treeData = renderTreeData(serviceDetailFull?.subCategories || []);

  return (
    <Tree
      treeData={treeData}
      showLine
      defaultExpandAll
      onSelect={onSelectSubCategory}
    />
  );
};

export default TreeServicesDetail;
