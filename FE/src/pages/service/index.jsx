import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Button,
  Input,
  message,
  Spin,
  Form,
  Modal,
  Tooltip,
} from "antd";
import { IoIosRefresh } from "react-icons/io";
import {
  fetchServices,
  addService,
  deleteService,
  updateService,
} from "../../redux/features/serviceReducer/serviceSlice"; // Import Thunks
import moment from "moment";
import { IoIosAdd } from "react-icons/io";
import { RxUpdate } from "react-icons/rx";
import { FcViewDetails } from "react-icons/fc";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import "./index.css";
import { ServicesDetail } from "./components/ServicesDetail";

const { Search } = Input;

function Services() {
  const dispatch = useDispatch();
  const { services, isLoading, error } = useSelector((state) => state.service); // Lấy dữ liệu từ Redux store
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [editingService, setEditingService] = useState(null); // State để lưu dịch vụ đang chỉnh sửa
  const [openDrawerDetail, setOpenDrawerDetail] = useState(false);
  const [servicesDetail, setServicesDetail] = useState(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleIconChange = (e) => {
    setIcon(e.target.files[0]); // Set file icon khi người dùng chọn file
  };

  const handleSubmit = () => {
    if (!name || !icon) {
      message.error("Please provide both name and icon.");
      return;
    }

    const newService = {
      name: name,
      icon: icon,
    };

    dispatch(addService(newService)) // Gọi API POST để thêm dịch vụ
      .then(() => {
        dispatch(fetchServices());
        setIsModalVisible(false); // Đóng Modal sau khi thêm dịch vụ
        setName(""); // Reset form
        setIcon(null); // Reset file input
      })
      .catch((error) => {
        message.error("Failed to add service");
      });
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service); // Nếu chỉnh sửa, đặt dịch vụ vào form
      setName(service.name);
    } else {
      setEditingService(null);
      setName("");
      setIcon(null);
    }
    setIsModalVisible(true); // Mở Modal khi bấm nút "Thêm Dịch Vụ"
  };

  const handleCancelModal = () => {
    setIsModalVisible(false); // Đóng Modal khi bấm nút "Cancel"
  };

  const handleSaveService = () => {
    if (!name) {
      message.error("Tên dịch vụ là bắt buộc.");
      return;
    }

    dispatch(updateService({ id: editingService.categoryId, updatedService }))
      .then(() => {
        setIsModalVisible(false); // Đóng Modal sau khi cập nhật
        dispatch(fetchServices()); // Gọi lại API sau khi cập nhật thành công
        setName("");
        setIcon(null);
      })
      .catch((error) => {
        message.error("Failed to update service");
      });
  };

  const handleDeleteService = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa dịch vụ này?",
      onOk: () => {
        dispatch(deleteService(id)).then(() => {
          dispatch(fetchServices());
        }); // Gọi API DELETE để xóa dịch vụ
      },
    });
  };

  const handleViewDetail = (record) => {
    setServicesDetail(record);
    showDrawer();
    console.log(record);
  };

  const showDrawer = () => {
    setOpenDrawerDetail(true);
  };

  var updatedService = {
    name: name,
    icon: icon || editingService?.icon, // Giữ nguyên icon cũ nếu không chọn mới
  };

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
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex" }}>
          <Button
            onClick={() => handleOpenModal(record)} // Chỉnh sửa dịch vụ
            style={{ border: "none", background: "none" }}
          >
            <Tooltip placement="left" title="Cập nhập dịch vụ">
              <RxUpdate
                style={{ color: "orange", width: "20px", height: "20px" }}
              />
            </Tooltip>
          </Button>
          <Button
            style={{ border: "none", background: "none" }}
            onClick={() => handleViewDetail(record)}
          >
            <Tooltip placement="top" title="Xem chi tiết dịch vụ">
              <FcViewDetails style={{ width: "20px", height: "20px" }} />
            </Tooltip>
          </Button>
          <Button
            type="danger"
            onClick={() => handleDeleteService(record.categoryId)} // Xóa dịch vụ
            style={{ border: "none", background: "none" }}
          >
            <Tooltip placement="right" title="Xóa dịch vụ">
              <MdOutlineDeleteOutline
                style={{ color: "red", width: "20px", height: "20px" }}
              />
            </Tooltip>
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="centered-spin">
        <Spin tip="Loading services..." />
      </div>
    );

  if (error) {
    message.error(error?.message || "Failed to fetch services");
  }

  return (
    <div>
      <ServicesDetail
        openDrawerDetail={openDrawerDetail}
        setOpenDrawerDetail={setOpenDrawerDetail}
        showDrawer={showDrawer}
        servicesDetail={servicesDetail}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Search
          placeholder="Tìm kiếm dịch vụ"
          enterButton={<FaSearch />}
          size="large"
          style={{ width: "50%" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            onClick={() => dispatch(fetchServices())}
            style={{ marginLeft: 10 }}
          >
            <Tooltip placement="left" title="Refresh">
              <IoIosRefresh />
            </Tooltip>
          </Button>
          <Button type="primary" onClick={() => handleOpenModal()}>
            <Tooltip placement="right" title="Thêm Dịch Vụ">
              <IoIosAdd />
            </Tooltip>
          </Button>
        </div>
      </div>
      <br />

      {/* Modal Form */}
      <Modal
        title={editingService ? "Chỉnh sửa Dịch Vụ" : "Thêm Dịch Vụ"}
        visible={isModalVisible}
        onOk={editingService ? handleSaveService : handleSubmit}
        onCancel={handleCancelModal}
        okText={editingService ? "Lưu" : "Thêm"}
        cancelText="Hủy"
        maskClosable={false}
      >
        <Form layout="vertical">
          <Form.Item label="Tên Dịch Vụ">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên dịch vụ"
            />
          </Form.Item>

          <Form.Item label="Hình Ảnh">
            <input type="file" onChange={handleIconChange} accept="image/*" />
          </Form.Item>
        </Form>
      </Modal>

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
