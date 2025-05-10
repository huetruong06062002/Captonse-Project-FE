import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Tag,
  Image,
  message,
  Select,
  Card,
  Space,
  Typography,
  Avatar,
  Row,
  Col,
  Tooltip,
  Badge,
  Popconfirm,
  Spin,
  Input as AntInput,
  Empty
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { axiosClientVer2 } from "../../config/axiosInterceptor";
import { GrDocumentUpdate } from "react-icons/gr";
import { MdAutoDelete } from "react-icons/md";
import moment from "moment";
import dayjs from "dayjs";
import ButtonExportExcelUser from '@components/button-export-excel/ButtonExportExcelUser';
import './index.css';

const { Title, Text } = Typography;
const { Search } = AntInput;

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [editDob, setEditDob] = useState(null);
  const [createDob, setCreateDob] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosClientVer2.get("/users", {
        params: { page: currentPage, pageSize },
      });
      setUsers(response.data.data);
      setTotalRecords(response.data.totalRecords);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
    setSearchText('');
    setSearchedColumn('');
    fetchUsers();
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <AntInput
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      return record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>
          {text}
        </span>
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const getStatusColor = (status) => {
    if (status === "Active") return "green";
    if (status === "Deleted") return "red";
    return "blue";
  };

  const getRoleColor = (role) => {
    if (role === "Staff") return "blue";
    if (role === "Driver") return "green";
    if (role === "Customer") return "purple";
    if (role === "Admin") return "red";
    if (role === "CustomerStaff") return "orange";
    return "default";
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar, record) => (
        avatar ?
          <Avatar src={avatar} size={45} className="user-avatar" /> :
          <Avatar size={45} className="user-avatar" style={{
            backgroundColor: getRoleColor(record.role) === 'blue' ? '#1890ff' :
              getRoleColor(record.role) === 'green' ? '#52c41a' :
                '#722ed1'
          }}>
            {getInitials(record.fullName)}
          </Avatar>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      sortOrder: sortedInfo.columnKey === 'fullName' && sortedInfo.order,
      ...getColumnSearchProps('fullName'),
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.userId?.substring(0, 8)}...
          </Text>
        </Space>
      ),
    },
    {
      title: "Thông tin liên hệ",
      children: [
        {
          title: <Space><PhoneOutlined /> Số điện thoại</Space>,
          dataIndex: "phoneNumber",
          key: "phoneNumber",
          ...getColumnSearchProps('phoneNumber'),
          width: 150,
        },
        {
          title: <Space><MailOutlined /> Email</Space>,
          dataIndex: "email",
          key: "email",
          ...getColumnSearchProps('email'),
          render: (email) => email || <Text type="secondary">Chưa cung cấp</Text>,
          width: 220,
        }
      ]
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: 'Staff', value: 'Staff' },
        { text: 'Driver', value: 'Driver' },
        { text: 'Customer', value: 'Customer' },
        { text: 'CustomerStaff', value: 'CustomerStaff' },
      ],
      filteredValue: filteredInfo.role || null,
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let className = 'role-tag';
        if (role === 'Staff') className += ' role-staff';
        else if (role === 'Driver') className += ' role-driver';
        else if (role === 'Customer') className += ' role-customer';
        else if (role === 'Admin') className += ' role-admin';
        else if (role === 'CustomerStaff') className += ' role-customerstaff';

        return <span className={className}>{role}</span>;
      },
      width: 160,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Deleted', value: 'Deleted' },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const className = `status-tag ${status === 'Active' ? 'status-tag-active' : 'status-tag-deleted'}`;
        return <span className={className}>{status}</span>;
      },
      width: 120,
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: 'right',
      width: 170,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              className="action-btn action-btn-view"
              icon={<EyeOutlined />}
              onClick={() => handleViewUserDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              className="action-btn action-btn-edit"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người dùng này?"
              onConfirm={() => handleDeleteUser(record.userId)}
              okText="Xóa"
              cancelText="Hủy"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button
                className="action-btn action-btn-delete"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEditUser = (record) => {
    setSelectedUser(record);

    if (record.dob) {
      try {
        setEditDob(record.dob);
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }

    form.setFieldsValue({
      userId: record.userId,
      fullName: record.fullName,
      email: record.email,
      gender: record.gender,
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditDob(null);
  };

  const handleEditDobChange = (date, dateString) => {
    console.log(date, dateString);
    const formattedDate = dateString ? dateString.split('/').reverse().join('-') : '';
    setEditDob(formattedDate);
  };

  const handleCreateDobChange = (date, dateString) => {
    console.log(date, dateString);
    const formattedDate = dateString ? dateString.split('/').reverse().join('-') : '';
    setCreateDob(formattedDate);
  };

  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("UserId", values.userId);
      formData.append("FullName", values.fullName);
      formData.append("Email", values.email);
      formData.append("Avatar", values.avatar ? values.avatar.file : null);

      if (editDob) {
        formData.append("Dob", editDob);
      } else {
        formData.append("Dob", "");
      }

      formData.append("Gender", values.gender);

      await axiosClientVer2.put("/users/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Cập nhật user thành công");
      await fetchUsers();

      setIsModalVisible(false);
      setCurrentPage(1);
      setEditDob(null);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Không thể cập nhật người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    Modal.confirm({
      title: "Xóa user",
      content: "Bạn có muốn xóa user này không?",
      onOk: async () => {
        try {
          await axiosClientVer2.delete(`/users/${userId}`);
          fetchUsers();
          message.success("Xóa người dùng thành công");
        } catch (error) {
          message.error("Không thể xóa người dùng");
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

      if (createDob) {
        formData.append("Dob", createDob);
      } else {
        formData.append("Dob", "");
      }

      formData.append("Gender", values.gender || '');
      formData.append("PhoneNumber", values.phoneNumber || '');
      formData.append("RewardPoints", values.rewardPoints || 0);

      if (values.avatar?.file) {
        formData.append("Avatar", values.avatar.file);
      }

      await axiosClientVer2.post("users/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Tạo người dùng thành công!");
      setIsCreateUserModalVisible(false);
      createForm.resetFields();
      setCreateDob(null);
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;

        console.log("check errors", errors);
        if (typeof errors === "object") {
          Object.keys(errors).forEach((key) => {
            message.error(`${key}: ${errors[key].join(", ")}`);
          });
        } else {
          message.error("Có lỗi xảy ra trong quá trình tạo người dùng");
        }
      } else {
        message.error("Không thể tạo người dùng mới");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModalCancel = () => {
    setIsCreateUserModalVisible(false);
    createForm.resetFields();
    setCreateDob(null);
  };

  const onSearch = (value) => {
    // Implement search logic here if needed
    console.log('search:', value);
  };

  const handleViewUserDetail = (record) => {
    setDetailUser(record);
    setIsDetailModalVisible(true);
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
    setDetailUser(null);
  };

  return (
    <div className="user-page">
      <Card className="user-card">
        <div className="user-header">
          <h2>Quản lý người dùng</h2>
          <div className="action-buttons">
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={clearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  padding: "0 10px",
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  borderColor: '#d9d9d9',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#40a9ff',
                    color: '#40a9ff',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  },
                  '&:active': {
                    backgroundColor: '#e6f7ff',
                    borderColor: '#1890ff',
                    color: '#1890ff',
                    transform: 'translateY(0)',
                    boxShadow: '0 2px 0 rgba(0, 0, 0, 0.02)'
                  }
                }}
              />
            </Tooltip>
            <Tooltip title="Xuất Excel">
              <ButtonExportExcelUser type="primary" icon={<FileExcelOutlined />}>
                Xuất Excel
              </ButtonExportExcelUser>
            </Tooltip>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsCreateUserModalVisible(true)}
            >
              Tạo người dùng
            </Button>
          </div>
        </div>

        <div className="user-body">
          <div className="user-search">
            <Search
              placeholder="Tìm kiếm người dùng..."
              onSearch={onSearch}
              enterButton
            />
          </div>

          <Table
            className="user-table"
            columns={columns}
            dataSource={users}
            rowKey="userId"
            loading={isLoading}
            onChange={handleTableChange}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalRecords,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
              onShowSizeChange: (current, size) => {
                setPageSize(size);
              },
              showQuickJumper: true
            }}
            scroll={{ x: 1100 }}
            bordered
            size="middle"
            locale={{
              emptyText: <Empty description="Không có dữ liệu" />
            }}
            rowClassName={(record, index) => index % 2 === 0 ? "" : "ant-table-row-even"}
          />
        </div>
      </Card>

      {/* Modal chỉnh sửa người dùng */}
      <Modal
        title="Chỉnh sửa thông tin người dùng"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        className="user-modal"
        destroyOnClose
      >
        <Spin spinning={isLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            className="user-form"
          >
            <Form.Item name="userId" hidden>
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ type: "email", message: "Email không hợp lệ" }]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Ngày sinh
                  </label>
                  <DatePicker
                    value={
                      selectedUser?.dob && editDob === null
                        ? dayjs(selectedUser.dob, "YYYY-MM-DD")
                        : editDob
                          ? dayjs(editDob, "YYYY-MM-DD")
                          : null
                    }
                    format="DD/MM/YYYY"
                    onChange={handleEditDobChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                    }}
                    placeholder="Chọn ngày sinh"
                    allowClear={true}
                  />
                </div>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select placeholder="Chọn giới tính">
                    <Select.Option value="Male">Nam</Select.Option>
                    <Select.Option value="Female">Nữ</Select.Option>
                    <Select.Option value="Other">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="avatar" label="Ảnh đại diện">
              <Upload
                name="avatar"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                fileList={[]}
                className="avatar-uploader"
              >
                <div>
                  <p className="avatar-uploader-icon"><UploadOutlined /></p>
                  <p className="avatar-uploader-text">Tải ảnh lên</p>
                </div>
              </Upload>
              {selectedUser?.avatar && (
                <div className="avatar-preview">
                  <img src={selectedUser.avatar} className="avatar-preview-image" alt="Avatar" />
                  <span className="avatar-preview-text">Ảnh hiện tại</span>
                </div>
              )}
            </Form.Item>

            <div className="user-form-footer">
              <Button onClick={handleModalCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Cập nhật
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Modal tạo người dùng mới */}
      <Modal
        title="Tạo người dùng mới"
        visible={isCreateUserModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null}
        width={700}
        className="user-modal"
        destroyOnClose
      >
        <Spin spinning={isLoading}>
          <Form
            form={createForm}
            layout="vertical"
            onFinish={handleCreateUser}
            className="user-form"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Họ và Tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                  <Input placeholder="Nhập họ tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input placeholder="Nhập email" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="Vai trò"
                  rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                >
                  <Select placeholder="Chọn vai trò">
                    <Select.Option value="Admin">Admin</Select.Option>
                    <Select.Option value="User">User</Select.Option>
                    <Select.Option value="Staff">Staff</Select.Option>
                    <Select.Option value="Driver">Driver</Select.Option>
                    <Select.Option value="CustomerStaff">CustomerStaff</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "red" }}>*</span> Ngày sinh
                  </label>
                  <DatePicker
                    value={createDob ? dayjs(createDob, "YYYY-MM-DD") : null}
                    format="DD/MM/YYYY"
                    onChange={handleCreateDobChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                    }}
                    placeholder="Chọn ngày sinh"
                  />
                </div>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                >
                  <Select placeholder="Chọn giới tính">
                    <Select.Option value="Male">Nam</Select.Option>
                    <Select.Option value="Female">Nữ</Select.Option>
                    <Select.Option value="Other">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phoneNumber"
                  label="Số điện thoại"
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="rewardPoints" label="Điểm thưởng">
                  <Input type="number" min={0} placeholder="Nhập điểm thưởng" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="avatar" label="Ảnh đại diện">
              <Upload
                name="avatar"
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                fileList={[]}
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                </div>
              </Upload>
            </Form.Item>

            <div className="user-form-footer">
              <Button onClick={handleCreateModalCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Tạo mới
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Modal xem chi tiết người dùng */}
      <Modal
        title="Thông tin chi tiết người dùng"
        visible={isDetailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={[
          <Button key="close" onClick={handleDetailModalCancel}>
            Đóng
          </Button>
        ]}
        width={700}
        className="user-modal"
      >
        {detailUser && (
          <div className="user-detail">
            <div className="user-detail-header">
              <Avatar
                src={detailUser.avatar}
                size={100}
                className="user-detail-avatar"
                icon={!detailUser.avatar && <UserOutlined />}
              >
                {!detailUser.avatar && getInitials(detailUser.fullName)}
              </Avatar>
              <div className="user-detail-name">
                <Title level={3}>{detailUser.fullName}</Title>
                <div className="user-detail-role">
                  <span className={`role-tag role-${detailUser.role?.toLowerCase()}`}>
                    {detailUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-detail-info">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">ID người dùng:</div>
                    <div className="detail-value">{detailUser.userId}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Trạng thái:</div>
                    <div className="detail-value">
                      <span className={`status-tag status-tag-${detailUser.status === 'Active' ? 'active' : 'deleted'}`}>
                        {detailUser.status}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Email:</div>
                    <div className="detail-value">
                      <MailOutlined style={{ marginRight: 8 }} />
                      {detailUser.email || 'Chưa cung cấp'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Số điện thoại:</div>
                    <div className="detail-value">
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {detailUser.phoneNumber || 'Chưa cung cấp'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Ngày sinh:</div>
                    <div className="detail-value">
                      {detailUser.dob ? dayjs(detailUser.dob).format('DD/MM/YYYY') : 'Chưa cung cấp'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Giới tính:</div>
                    <div className="detail-value">
                      {detailUser.gender === 'Male' ? 'Nam' :
                        detailUser.gender === 'Female' ? 'Nữ' :
                          detailUser.gender === 'Other' ? 'Khác' : 'Chưa cung cấp'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Điểm thưởng:</div>
                    <div className="detail-value">
                      {detailUser.rewardPoints || 0}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Ngày tạo:</div>
                    <div className="detail-value">
                      {detailUser.dateCreated ? dayjs(detailUser.dateCreated).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="detail-item">
                    <div className="detail-label">Ngày cập nhật:</div>
                    <div className="detail-value">
                      {detailUser.dateModified ? dayjs(detailUser.dateModified).format('DD/MM/YYYY HH:mm') : 'N/A'}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Users;
