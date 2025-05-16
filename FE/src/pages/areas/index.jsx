import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Tooltip, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Divider, 
  message, 
  Popconfirm, 
  Typography,
  Breadcrumb,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined, 
  HomeOutlined, 
  AppstoreOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [form] = Form.useForm();
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);
  const [districtForm] = Form.useForm();
  const [allDistricts, setAllDistricts] = useState([]);

  // Fetch areas data
  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://laundry.vuhai.me/api/admin/areas', {
        params: { areaType: 'ShippingFee' }
      });
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      message.error('Không thể tải dữ liệu khu vực');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
    // Here we would typically fetch all available districts
    // For now, we'll use a static list
    setAllDistricts([
      "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", 
      "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10", 
      "Quận 11", "Quận 12", "Gò Vấp", "Tân Bình", "Bình Thạnh", 
      "Phú Nhuận", "Thủ Đức", "Bình Tân", "Tân Phú", "Bình Chánh", "Nhà Bè"
    ]);
  }, []);

  // Handle adding/editing area
  const showModal = (area = null) => {
    setEditingArea(area);
    form.resetFields();
    if (area) {
      form.setFieldsValue({ 
        name: area.name
      });
    }
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingArea) {
        // Update existing area
        await axios.put(`https://laundry.vuhai.me/api/admin/areas/${editingArea.id}`, {
          name: values.name,
          areaType: 'ShippingFee'
        });
        message.success('Cập nhật khu vực thành công');
      } else {
        // Create new area
        await axios.post('https://laundry.vuhai.me/api/admin/areas', {
          name: values.name,
          districts: [],
          areaType: 'ShippingFee'
        });
        message.success('Thêm khu vực thành công');
      }
      
      setModalVisible(false);
      fetchAreas();
    } catch (error) {
      console.error('Error saving area:', error);
      message.error('Không thể lưu khu vực');
    }
  };

  // Handle area deletion
  const handleDeleteArea = async (areaId) => {
    try {
      await axios.delete(`https://laundry.vuhai.me/api/admin/areas/${areaId}`);
      message.success('Xóa khu vực thành công');
      fetchAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
      message.error('Không thể xóa khu vực');
    }
  };

  // Handle districts
  const showDistrictModal = (area) => {
    setCurrentArea(area);
    districtForm.resetFields();
    setDistrictModalVisible(true);
  };

  const handleDistrictModalCancel = () => {
    setDistrictModalVisible(false);
  };

  const handleAddDistrict = async () => {
    try {
      const values = await districtForm.validateFields();
      const updatedDistricts = [...currentArea.districts, values.district];
      
      await axios.put(`https://laundry.vuhai.me/api/admin/areas/${currentArea.id}`, {
        districts: updatedDistricts,
        areaType: 'ShippingFee'
      });
      
      message.success('Thêm quận/huyện thành công');
      setDistrictModalVisible(false);
      fetchAreas();
    } catch (error) {
      console.error('Error adding district:', error);
      message.error('Không thể thêm quận/huyện');
    }
  };

  const handleRemoveDistrict = async (area, district) => {
    try {
      const updatedDistricts = area.districts.filter(d => d !== district);
      
      await axios.put(`https://laundry.vuhai.me/api/admin/areas/${area.id}`, {
        districts: updatedDistricts,
        areaType: 'ShippingFee'
      });
      
      message.success('Xóa quận/huyện thành công');
      fetchAreas();
    } catch (error) {
      console.error('Error removing district:', error);
      message.error('Không thể xóa quận/huyện');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Tên khu vực',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Quận/Huyện',
      dataIndex: 'districts',
      key: 'districts',
      render: (districts, record) => (
        <>
          {districts.map((district) => (
            <Tag 
              color="blue" 
              key={`${record.id}-${district}`}
              closable
              onClose={(e) => {
                e.preventDefault();
                handleRemoveDistrict(record, district);
              }}
            >
              {district}
            </Tag>
          ))}
          <Button 
            type="dashed" 
            size="small" 
            icon={<PlusOutlined />} 
            onClick={() => showDistrictModal(record)}
            style={{ marginLeft: 8 }}
          >
            Thêm
          </Button>
        </>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa khu vực này?"
              onConfirm={() => handleDeleteArea(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // For available districts dropdown, filter out districts already assigned
  const getAvailableDistricts = () => {
    if (!currentArea) return allDistricts;
    
    return allDistricts.filter(
      district => !currentArea.districts.includes(district)
    );
  };

  return (
    <div className="areas-container">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
          <span>Trang chủ</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AppstoreOutlined />
          <span>Quản lý khu vực</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>
              <EnvironmentOutlined /> Quản lý khu vực giao hàng
            </Title>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchAreas}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
              >
                Thêm khu vực
              </Button>
            </Space>
          </Col>
        </Row>

        <Table 
          columns={columns} 
          dataSource={areas} 
          rowKey="id" 
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} khu vực`,
          }}
        />
      </Card>

      {/* Modal for adding/editing area */}
      <Modal
        title={editingArea ? "Chỉnh sửa khu vực" : "Thêm khu vực mới"}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        okText={editingArea ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khu vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}
          >
            <Input placeholder="Nhập tên khu vực" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for adding district to area */}
      <Modal
        title={`Thêm quận/huyện vào ${currentArea?.name || ''}`}
        open={districtModalVisible}
        onOk={handleAddDistrict}
        onCancel={handleDistrictModalCancel}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={districtForm} layout="vertical">
          <Form.Item
            name="district"
            label="Quận/Huyện"
            rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}
          >
            <Select placeholder="Chọn quận/huyện">
              {getAvailableDistricts().map(district => (
                <Option key={district} value={district}>{district}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Areas;