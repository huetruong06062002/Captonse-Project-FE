import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, Collapse, Button, Pagination, Row, Col, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getExtraCategories } from '@redux/features/extraCategoryReducer/extraCategoryReducer';

const { Panel } = Collapse;

function ExtraCategories() {
  const dispatch = useDispatch();
  const { categories, isLoading, error } = useSelector(
    (state) => state.extraCategories
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    dispatch(getExtraCategories());
  }, [dispatch]);

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const renderExtras = (extras) => {
    return extras.map((extra) => (
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
              <p style={{marginLeft:"1rem"}}>{extra.name}</p>
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

  return (
    <div style={{ margin: "20px" }}>
      <div
        className="extra-categories-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          overflowY: "auto", // Cho phép cuộn dọc khi vượt quá chiều cao
          maxHeight: "80vh", // Giới hạn chiều cao
        }}
      >
        {categories.map((category) => (
          <div
            key={category.extraCategoryId}
            style={{
              flex: "1 1 21%", // Đảm bảo mỗi mục chiếm 21% chiều rộng
              maxWidth: "300px", // Giới hạn chiều rộng của mỗi mục
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
                <p style={{color:"#27ae60"}}>{category.name}</p> 
                <Button icon={<PlusOutlined />} style={{ marginTop: "8px" }} />
              </h3>
              <p style={{margin: "1rem 0px"}}>Ngày tạo: {new Date(category.createdAt).toLocaleString()}</p>
              {renderExtras(category.extras)}
              
            </div>
          </div>
        ))}
      </div>

      <Pagination
        current={currentPage}
        total={totalRecords}
        pageSize={pageSize}
        onChange={handlePaginationChange}
        showSizeChanger={false}
        style={{ marginTop: "1rem", float: "right" }}
      />
    </div>
  );
}

export default ExtraCategories;
