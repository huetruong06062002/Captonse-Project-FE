import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, TimePicker, Input, message, Space, Card, Typography, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { getRequest, postRequest, putRequest, deleteRequestParamsV2, getRequestParams } from '../../../services/api';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

export default function AbsenDriverManagement() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Fetch drivers data
  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await getRequestParams('/users', {
        role: 'Driver',
        page: 1,
        pageSize: 50 // Lấy nhiều hơn để có đủ drivers
      });
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      message.error('Không thể tải danh sách tài xế');
    } finally {
      setLoadingDrivers(false);
    }
  };

  // Fetch absences data
  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const response = await getRequest('/admin/driver-absents');
      setAbsences(response.data || []);
    } catch (error) {
      console.error('Error fetching absences:', error);
      message.error('Không thể tải danh sách lịch vắng');
    } finally {
      setLoading(false);
    }
  };

  // Create new absence
  const createAbsence = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        driverId: values.driverId,
        date: values.date.format('YYYY-MM-DD'),
        from: values.from.format('HH:mm:ss'),
        to: values.to.format('HH:mm:ss')
      };
      
      await postRequest('/admin/driver-absents', payload);
      message.success('Tạo lịch vắng thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchAbsences();
    } catch (error) {
      console.error('Error creating absence:', error);
      console.error('Error creating absence:', error.response.data.message);

      message.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Update absence
  const updateAbsence = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        driverId: values.driverId,
        date: values.date.format('YYYY-MM-DD'),
        from: values.from.format('HH:mm:ss'),
        to: values.to.format('HH:mm:ss')
      };
      
      await putRequest(`/admin/driver-absents/${editingRecord.absentId}`, payload);
      message.success('Cập nhật lịch vắng thành công!');
      setIsModalVisible(false);
      setIsEditing(false);
      setEditingRecord(null);
      form.resetFields();
      fetchAbsences();
    } catch (error) {
      console.error('Error updating absence:', error);
      message.error('Không thể cập nhật lịch vắng!');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete absence
  const deleteAbsence = async (absentId) => {
    try {
      await deleteRequestParamsV2('/admin/driver-absents', absentId);
      message.success('Xóa lịch vắng thành công!');
      fetchAbsences();
    } catch (error) {
      console.error('Error deleting absence:', error);
      message.error('Không thể xóa lịch vắng!');
    }
  };

  // Handle modal submit
  const handleSubmit = async (values) => {
    if (isEditing) {
      await updateAbsence(values);
    } else {
      await createAbsence(values);
    }
  };

  // Open create modal
  const handleCreate = () => {
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
    fetchDrivers(); // Fetch drivers khi mở modal
  };

  // Open edit modal
  const handleEdit = (record) => {
    setIsEditing(true);
    setEditingRecord(record);
    form.setFieldsValue({
      driverId: record.driverId,
      date: moment(record.date),
      from: moment(record.from, 'HH:mm:ss'),
      to: moment(record.to, 'HH:mm:ss')
    });
    setIsModalVisible(true);
    fetchDrivers(); // Fetch drivers khi mở modal edit
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Table columns
  const columns = [
    {
      title: 'Tên tài xế',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Ngày vắng',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Tag color="blue" icon={<CalendarOutlined />}>
          {moment(date).format('DD/MM/YYYY')}
        </Tag>
      ),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'from',
      key: 'from',
      render: (time) => <Tag color="green">{time}</Tag>
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'to',
      key: 'to',
      render: (time) => <Tag color="orange">{time}</Tag>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAtUtc',
      key: 'createdAtUtc',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => moment(a.createdAtUtc).unix() - moment(b.createdAtUtc).unix(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            // size="small"
          
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa lịch vắng"
            description="Bạn có chắc chắn muốn xóa lịch vắng này?"
            onConfirm={() => deleteAbsence(record.absentId)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{padding: '20px'}}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchAbsences();
  }, []);

  return (
    <Card style={{ margin: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <CalendarOutlined /> Quản lý lịch vắng tài xế
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', width:'50%' }}
          >
            Thêm lịch vắng
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={absences}
        rowKey="absentId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} mục`,
        }}
        bordered
        size="middle"
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <span>{isEditing ? 'Chỉnh sửa lịch vắng' : 'Thêm lịch vắng mới'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={() => form.submit()}
            style={{ backgroundColor: isEditing ? '#faad14' : '#52c41a', borderColor: isEditing ? '#faad14' : '#52c41a' }}
          >
            {isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label="Chọn tài xế"
            name="driverId"
            rules={[{ required: true, message: 'Vui lòng chọn tài xế!' }]}
          >
            <Select
              placeholder="Chọn tài xế"
              loading={loadingDrivers}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
            >
              {drivers.map(driver => (
                <Option key={driver.userId} value={driver.userId}>
                  <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: '500' }}>{driver.fullName}</span>
                    <span style={{ color: '#999' }}>({driver.phoneNumber})</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày vắng"
            name="date"
            rules={[{ required: true, message: 'Vui lòng chọn ngày vắng!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày vắng"
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Thời gian bắt đầu"
              name="from"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm:ss"
                placeholder="Chọn giờ bắt đầu"
              />
            </Form.Item>

            <Form.Item
              label="Thời gian kết thúc"
              name="to"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm:ss"
                placeholder="Chọn giờ kết thúc"
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}
