import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Upload, Pagination, Tag, Image, message, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import moment from "moment";

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
            type="primary"
            style={{ marginRight: 8 }}
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button
            type="danger"
            onClick={() => handleDeleteUser(record.userId)}
            style={{color:"white", background:"red"}}
          >
            Delete
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
          message.success("User deleted successfully");
          fetchUsers(); // Refresh the user list after deletion
        } catch (error) {
          message.error("Error deleting user");
          console.error("Error deleting user:", error);
        }
      },
    });
  };

  return (
    <div>
      <h2>Users</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={isLoading}
        pagination={false}
        rowClassName={(record, index) => (index % 2 === 0 ? "ant-table-row-light" : "ant-table-row-dark")}
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
          <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
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
          <Form.Item name="dob" label="Date of Birth" rules={[{ required: true }]}>
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
    </div>
  );
}

export default Users;
