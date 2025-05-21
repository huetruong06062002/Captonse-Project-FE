import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, Empty, Typography, Avatar, Input, Button, message, Space, Modal, Form, Select, DatePicker, Upload, Image } from 'antd';
import { getRequestParams, getRequest, postRequestMultipartFormData } from '@services/api';
import dayjs from 'dayjs';
import { SearchOutlined, UserAddOutlined, UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function UserManagementCustomerStaff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchPhone, setSearchPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!searching) fetchUsers();
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        role: 'Customer',
        page: currentPage,
        pageSize,
      };
      const response = await getRequestParams('/users', params);
      setUsers(response.data.data);
      setTotalRecords(response.data.totalRecords);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchPhone) {
      setSearching(false);
      fetchUsers();
      return;
    }
    setLoading(true);
    setSearching(true);
    try {
      const response = await getRequest(`users/search?phone=${searchPhone}`);
      if (response.data && response.data.userId) {
        setUsers([response.data]);
        setTotalRecords(1);
      } else {
        setUsers([]);
        setTotalRecords(0);
        message.info('Không tìm thấy khách hàng với số điện thoại này!');
      }
    } catch (error) {
      setUsers([]);
      setTotalRecords(0);
      message.error('Lỗi khi tìm kiếm khách hàng!');
    } finally {
      setLoading(false);
    }
  };

  const validateMessages = {
    required: '${label} là bắt buộc!',
    types: {
      email: '${label} không đúng định dạng!',
    },
  };

  const handleCreateUser = async (values) => {
    setLoading(true);
    try {
      // Validate all fields before proceeding
      await form.validateFields();
      
      const formData = new FormData();
      formData.append('FullName', values.fullName);
      formData.append('Email', values.email);
      formData.append('Password', values.password);
      formData.append('Role', 'Customer');
      
      // Format date properly in YYYY-MM-DD format for the backend
      formData.append('Dob', values.dob ? values.dob.format('YYYY-MM-DD') : '');
      
      formData.append('Gender', values.gender);
      formData.append('PhoneNumber', values.phoneNumber);
      formData.append('RewardPoints', values.rewardPoints || 0);
      
      if (avatarFile) {
        formData.append('Avatar', avatarFile);
      }
      
      const response = await postRequestMultipartFormData('/users/create', formData);
      message.success('Tạo khách hàng thành công!');
      setIsModalVisible(false);
      setAvatarFile(null);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      // Better error handling with detailed messages
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Display each validation error
          Object.entries(errorData.errors).forEach(([key, value]) => {
            message.error(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
          });
        } else if (errorData.message) {
          message.error(errorData.message);
        } else {
          message.error('Tạo khách hàng thất bại! Vui lòng kiểm tra lại các thông tin.');
        }
      } else if (error.errorFields) {
        // Form validation errors from antd
        error.errorFields.forEach(field => {
          message.error(field.errors[0]);
        });
      } else {
        message.error('Tạo khách hàng thất bại! Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar, record) =>
        avatar ? (
          <Avatar src={avatar} />
        ) : (
          <Avatar>{record.fullName ? record.fullName.charAt(0).toUpperCase() : '?'}</Avatar>
        ),
      width: 60,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name) => name || <span style={{ color: '#aaa' }}>Chưa cung cấp</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || <span style={{ color: '#aaa' }}>Chưa cung cấp</span>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone || <span style={{ color: '#aaa' }}>Chưa cung cấp</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 'Active' ? <span style={{ color: '#52c41a' }}>Active</span> : <span style={{ color: '#ff4d4f' }}>Deleted</span>,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      render: (dob) => dob ? dayjs(dob).format('DD/MM/YYYY') : <span style={{ color: '#aaa' }}>Chưa cung cấp</span>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => {
        if (!gender) return <span style={{ color: '#aaa' }}>Chưa cung cấp</span>;
        if (gender === 'Male') return 'Nam';
        if (gender === 'Female') return 'Nữ';
        return 'Khác';
      },
    },
    {
      title: 'Điểm thưởng',
      dataIndex: 'rewardPoints',
      key: 'rewardPoints',
      render: (point) => point ?? 0,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : <span style={{ color: '#aaa' }}>Chưa cung cấp</span>,
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'dateModified',
      key: 'dateModified',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : <span style={{ color: '#aaa' }}>Chưa cung cấp</span>,
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      <Title level={3} style={{ marginBottom: 16 }}>Danh sách khách hàng</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo số điện thoại"
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 220 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
        >
          Tìm kiếm
        </Button>
        {searchPhone && (
          <Button onClick={() => { setSearchPhone(''); setSearching(false); fetchUsers(); }}>Xóa tìm kiếm</Button>
        )}
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Tạo khách hàng
        </Button>
      </Space>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="userId"
          pagination={searching ? false : {
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showTotal: (total) => `Tổng cộng ${total} khách hàng`,
          }}
          locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
          scroll={{ x: 1200 }}
        />
      </Spin>
      <Modal
        title="Tạo khách hàng mới"
        open={isModalVisible}
        width={800}
        onCancel={() => { setIsModalVisible(false); setAvatarFile(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          validateMessages={validateMessages}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}> 
                <Input /> 
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}> 
                <Input /> 
              </Form.Item>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}> 
                <Input.Password /> 
              </Form.Item>
              <Form.Item name="dob" label="Ngày sinh"> 
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="DD-MM-YYYY"
                  getPopupContainer={triggerNode => triggerNode.parentElement}
                  allowClear
                  inputReadOnly={false}
                  onChange={(date, dateString) => {
                    // This ensures the date is stored correctly even if user directly types in the input
                    if (date) {
                      form.setFieldsValue({ dob: date });
                    }
                  }}
                /> 
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}> 
                <Select placeholder="Chọn giới tính"> 
                  <Select.Option value="Male">Nam</Select.Option> 
                  <Select.Option value="Female">Nữ</Select.Option> 
                  <Select.Option value="Other">Khác</Select.Option> 
                </Select> 
              </Form.Item>
              <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}> 
                <Input /> 
              </Form.Item>
              <Form.Item name="rewardPoints" label="Điểm thưởng"> 
                <Input type="number" min={0} /> 
              </Form.Item>
            </div>
          </div>
          
          <Form.Item name="avatar" label="Ảnh đại diện">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
              <Upload
                name="avatar"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={file => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    message.error('Bạn chỉ có thể tải lên tệp hình ảnh!');
                    return Upload.LIST_IGNORE;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error('Hình ảnh phải nhỏ hơn 2MB!');
                    return Upload.LIST_IGNORE;
                  }
                  setAvatarFile(file);
                  return false;
                }}
                onRemove={() => setAvatarFile(null)}
              >
                <div style={{ padding: 8 }}>
                  <UploadOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                  <div>Chọn ảnh</div>
                </div>
              </Upload>
              
              {avatarFile && (
                <div style={{ marginTop: 8 }}>
                  <Image
                    src={URL.createObjectURL(avatarFile)}
                    alt="Avatar preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
                    preview={{
                      mask: (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <EyeOutlined />
                          <span>Xem</span>
                        </div>
                      ),
                    }}
                  />
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => setAvatarFile(null)}
                    style={{ marginTop: 8 }}
                  >
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>Tạo mới</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
