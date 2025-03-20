import React from "react";
import { Tree } from "antd";
import { MdUpdate } from "react-icons/md";

const TreeServicesDetail = ({ serviceDetailFull, onSelectSubCategory }) => {
  const renderTreeData = (subCategories) => {
    return subCategories.map((subCategory) => ({
      title: (
        <div style={{ display: "flex", alignItems: "center" }}>
          <p
            style={{
              color: "#2ecc71",
              cursor: "pointer", // Thêm con trỏ chuột để cho thấy đây là một phần có thể click
            }}
            onClick={() => onSelectSubCategory([subCategory.subCategoryId], { selected: true, node: { key: subCategory.subCategoryId } })}
          >
            {subCategory.name}
          </p>
          {/* Biểu tượng update không có sự kiện onClick */}
          <p
            style={{
              paddingTop: "4px",
              fontSize: "1rem",
              color: "orange",
              cursor: "pointer",
            }}
          >
            <MdUpdate />
          </p>
        </div>
      ),
      key: subCategory.subCategoryId,
      children: subCategory.serviceDetails.map((service) => ({
        title: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={service.imageUrl}
              alt={service.name}
              style={{ width: 30, height: 30, marginRight: 10 }}
            />
            {`${service.name} - ${service.price.toLocaleString("de-DE")} VND`}
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
