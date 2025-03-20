import React from 'react';
import { Tree } from 'antd';

const TreeServicesDetail = ({ serviceDetailFull }) => {
  // Chuyển đổi dữ liệu thành dạng treeData
  const renderTreeData = (subCategories) => {
    return subCategories.map((subCategory) => ({
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {subCategory.name}       
        </div>
      ),
      key: subCategory.subCategoryId,
      children: subCategory.serviceDetails.map((service) => ({
        title: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Hiển thị hình ảnh của dịch vụ */}
            <img
              src={service.imageUrl} // Hiển thị ảnh dịch vụ
              alt={service.name}
              style={{ width: 30, height: 30, marginRight: 10 }} // Điều chỉnh kích thước ảnh
            />
            {/* Hiển thị tên dịch vụ và giá đã được định dạng */}
            {`${service.name} - ${service.price.toLocaleString('de-DE')} VND`}
          </div>
        ),
        key: service.serviceId,
        description: service.description || "No description",
        imageUrl: service.imageUrl,
      })),
    }));
  };

  // Chuyển đổi dữ liệu dịch vụ thành dữ liệu cho Tree
  const treeData = renderTreeData(serviceDetailFull?.subCategories || []);

  return (
    <Tree
      treeData={treeData} // Dữ liệu cây
      showLine
      defaultExpandAll
    />
  );
};

export default TreeServicesDetail;
