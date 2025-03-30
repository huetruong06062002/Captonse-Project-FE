import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Pagination,
  Tag,
  Image,
  message,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import { GrDocumentUpdate } from "react-icons/gr";
import { MdAutoDelete } from "react-icons/md";
import moment from "moment";
import ButtonExportExcelUser from '@components/button-export-excel/ButtonExportExcelUser';

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] =
    useState(false); // State modal tạo user mới
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      const response = await axiosClientVer2.get("/users", {
        params: { page: currentPage, pageSize },
      });
      setUsers(response.data.data);
      setTotalRecords(response.data.totalRecords);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "green";
    if (status === "Deleted") return "red";
    return "blue";
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => <Image src={avatar} width={"3rem"} />,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (email ? email : "Not Provided"),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div>
          <Button         
            style={{ marginRight: 8 ,backgroundColor:"orange", color:"white" }}
            onClick={() => handleEditUser(record)}
          >
            <GrDocumentUpdate style={{color:"#dfe6e9"}} />
          </Button>
          <Button
            type="danger"
            onClick={() => handleDeleteUser(record.userId)}
            style={{ color: "white", background: "red" }}
          >
            <MdAutoDelete style={{color:"#dfe6e9"}} />
          </Button>
        </div>
      ),
    },
  ];

  const handleEditUser = (record) => {
    setSelectedUser(record); // Store the selected user data
    form.setFieldsValue({
      userId: record.userId,
      fullName: record.fullName,
      email: record.email,
      avatar: record.avatar,
      dob: moment(record.dob),
      gender: record.gender,
    });
    setIsModalVisible(true); // Open the modal
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("UserId", values.userId);
      formData.append("FullName", values.fullName);
      formData.append("Email", values.email);
      formData.append("Avatar", values.avatar ? values.avatar.file : null); // Handle avatar upload
      formData.append("Dob", values.dob.format("YYYY-MM-DD"));
      formData.append("Gender", values.gender);

      await axiosClientVer2.put("/users/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Cập nhật user thành công");
      await fetchUsers();

      setIsModalVisible(false); // Close the modal
      setCurrentPage(1); // Reload the first page
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteUser = (userId) => {
    // Show confirmation modal before deleting
    Modal.confirm({
      title: "Xóa user",
      content: "Bạn có muốn xóa user này không?",
      onOk: async () => {
        try {
          await axiosClientVer2.delete(`/users/${userId}`);
          fetchUsers(); // Refresh the user list after deletion
        } catch (error) {
          message.error("Error deleting user");
          console.error("Error deleting user:", error);
        }
      },
    });
  };

  const handleCreateUser = async (values) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("FullName", values.fullName);
      formData.append("Email", values.email);
      formData.append("Password", values.password);
      formData.append("Role", values.role);
      formData.append("Dob", values.dob.format("YYYY-MM-DD"));
      formData.append("Gender", values.gender);
      formData.append("PhoneNumber", values.phoneNumber);
      formData.append("RewardPoints", values.rewardPoints);
      if (values.avatar?.file) {
        formData.append("Avatar", values.avatar.file); // Upload ảnh
      }

      await axiosClientVer2.post("users/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Tạo user thành công!");
      setIsCreateUserModalVisible(false);
      fetchUsers(); // Refresh danh sách users
    } catch (error) {
      // Kiểm tra lỗi trả về từ API
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;

        console.log("check errors", errors);
        // Kiểm tra xem errors có phải là đối tượng và có key nào không
        if (typeof errors === "object") {
          // Lấy thông báo lỗi từ từng key
          Object.keys(errors).forEach((key) => {
            // Gọi message.error() cho từng lỗi liên quan đến key
            message.error(`${key}: ${errors[key].join(", ")}`);
          });
        } else {
          // Nếu errors không phải là mảng, xử lý theo cách khác (ví dụ: hiển thị một lỗi chung)
          message.error("Có lỗi xảy ra trong quá trình tạo user");
        }
      } else {
        message.error("Không thể tạo user mới");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ButtonExportExcelUser/>
      <Button style={{display:"float", float:"right", marginBottom:"1rem"}} type="primary" onClick={() => setIsCreateUserModalVisible(true)}>
        Tạo Người dùng
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={isLoading}
        pagination={false}
        rowClassName={(record, index) =>
          index % 2 === 0 ? "ant-table-row-light" : "ant-table-row-dark"
        }
      />
      <Pagination
        current={currentPage}
        total={totalRecords}
        pageSize={pageSize}
        onChange={handlePaginationChange}
        showSizeChanger={false}
        style={{ marginTop: "1rem", float: "right" }}
      />

      {/* Modal for editing user */}
      <Modal
        title="Update User"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item name="userId" label="User ID" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar" valuePropName="file">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="dob"
            label="Date of Birth"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" isLoading={isLoading}>
              {isLoading ? "Cập nhật" : "Đang cập nhật"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for creating user */}
      <Modal
        title="Tạo User Mới"
        visible={isCreateUserModalVisible}
        onCancel={() => setIsCreateUserModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateUser} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="User">User</Select.Option>
              <Select.Option value="Staff">Staff</Select.Option>
              <Select.Option value="Driver">Driver</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Male">Nam</Select.Option>
              <Select.Option value="Female">Nữ</Select.Option>
              <Select.Option value="Other">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="rewardPoints" label="Điểm thưởng">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="avatar" label="Avatar">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" isLoading={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Users;
