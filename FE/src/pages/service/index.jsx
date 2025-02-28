import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Button, message, Spin } from "antd";
import { IoIosRefresh } from "react-icons/io";
import { fetchServices } from "../../redux/features/serviceReducer/serviceSlice"; // Import Thunk
import moment from 'moment';

function Services() {
  const dispatch = useDispatch();
  const { services, isLoading, error } = useSelector((state) => state.service); // Lấy dữ liệu từ Redux store
  useEffect(() => {
    // Gọi API khi component mount
    dispatch(fetchServices());
  }, [dispatch]);

  const columns = [
    {
      title: "Tên Dịch Vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hình Ảnh",
      dataIndex: "icon",
      key: "icon",
      render: (icon) => (
        <img src={icon} alt="icon" style={{ width: 30, height: 30 }} />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdat",
      key: "createdAt",
      render: (text) => moment(text).format("HH:mm:ss | DD/MM/YYYY"), 
    },
  ];
  useEffect(() => {
    // Gọi API khi component mount
    dispatch(fetchServices());
  }, [dispatch]);
  // Hiển thị khi dữ liệu đang tải
  if (isLoading) return <Spin tip="Loading services..." />;

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    message.error(error?.message || "Failed to fetch services");
  }
  return (
    <div>
      <Button type="primary" onClick={() => dispatch(fetchServices())}>
        <IoIosRefresh />
      </Button>
      <Table
        columns={columns}
        dataSource={services}
        rowKey="categoryId"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}

export default Services;
