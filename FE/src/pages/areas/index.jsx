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
import { deleteRequest, getRequestParams, postRequest, putRequest } from '@services/api';

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
  const [areaType, setAreaType] = useState('ShippingFee');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importForm] = Form.useForm();
  const [addDistrictModal, setAddDistrictModal] = useState({ visible: false, area: null });
  const [addDistrictForm] = Form.useForm();
  const [editAreaModal, setEditAreaModal] = useState({ visible: false, area: null });
  const [editAreaForm] = Form.useForm();

  // Fetch areas data
  const fetchAreas = async (type = areaType) => {
    setLoading(true);
    try {
      const response = await getRequestParams(`/admin/areas?areaType=${type}`);
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      message.error('Không thể tải dữ liệu khu vực');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas(areaType);
    // Here we would typically fetch all available districts
    // For now, we'll use a static list
    setAllDistricts([
      "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", 
      "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10", 
      "Quận 11", "Quận 12", "Gò Vấp", "Tân Bình", "Bình Thạnh", 
      "Phú Nhuận", "Thủ Đức", "Bình Tân", "Tân Phú", "Bình Chánh", "Nhà Bè"
    ]);
  }, [areaType]);

  // Handle adding/editing area
  const showModal = (area = null) => {
    setEditingArea(area);
    form.resetFields();
    if (area) {
      form.setFieldsValue({ 
        name: area.name,
        shippingFee: area.shippingFee || 0
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
        await putRequest(`/admin/areas/${editingArea.id}`, {
          name: values.name,
          areaType: 'ShippingFee'
        });
        message.success('Cập nhật khu vực thành công');
      } else {
        // Create new area
        await postRequest('admin/areas', {
          name: values.name,
          districts: [],
          areaType: 'ShippingFee',
          shippingFee: values.shippingFee || 0
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
      await deleteRequest(`admin/areas/${areaId}`);
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
      const payload = {
        areaType,
        areas: [{
          name: currentArea.name,
          districts: updatedDistricts
        }]
      };
      await axios.post('https://laundry.vuhai.me/api/admin/areas', payload);
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
      await axios.put(
        `https://laundry.vuhai.me/api/admin/areas/${area.id}?name=${encodeURIComponent(area.name)}`,
        updatedDistricts
      );
      message.success('Xóa quận/huyện thành công');
      fetchAreas();
    } catch (error) {
      console.error('Error removing district:', error);
      message.error('Không thể xóa quận/huyện');
    }
  };

  // Hàm cập nhật toàn bộ danh sách khu vực lên server
  const updateAllAreas = async (newAreas) => {
    try {
      await postRequest('/admin/areas', {
        areaType,
        areas: newAreas.map(area => ({
          name: area.name,
          districts: area.districts,
          shippingFee: area.shippingFee || 0
        }))
      });
      message.success('Cập nhật khu vực thành công!');
      fetchAreas();
    } catch (error) {
      message.error('Không thể cập nhật khu vực');
    }
  };

  // Xoá quận/huyện trong table
  const handleRemoveDistrictInTable = (area, district) => {
    const newAreas = areas.map(a =>
      a.id === area.id
        ? { ...a, districts: a.districts.filter(d => d !== district) }
        : a
    );
    updateAllAreas(newAreas);
  };

  // Thêm quận/huyện trong table
  const handleAddDistrictInTable = (area, newDistrict) => {
    if (!newDistrict) return;
    const newAreas = areas.map(a =>
      a.id === area.id && !a.districts.includes(newDistrict)
        ? { ...a, districts: [...a.districts, newDistrict] }
        : a
    );
    updateAllAreas(newAreas);
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
        <div className="area-districts-cell">
          {districts.map((district) => (
            <Tag 
              color="blue" 
              key={`${record.id}-${district}`}
              closable
              onClose={(e) => {
                e.preventDefault();
                handleRemoveDistrictInTable(record, district);
              }}
              className="area-district-tag"
            >
              {district}
            </Tag>
          ))}
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => showAddDistrictModal(record)}
            style={{ marginLeft: 8 }}
            className="area-add-district-btn"
          >
            Thêm
          </Button>
        </div>
      ),
    },
    {
      title: 'Phí giao hàng',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      width: 140,
      align: 'center',
      render: (fee) => (
        <Tag color="orange" style={{ fontSize: '13px', fontWeight: '500' }}>
          {fee ? `${fee.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle" className="area-action-btns">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={() => showEditAreaModal(record)}
              className="area-edit-btn"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa khu vực này?"
              onConfirm={() => handleDeleteArea(record.areaId)}
              okText="Xóa"
              cancelText="Hủy"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              cancelButtonProps={{ style: { display: 'none' } }}
            >
              <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} className="area-delete-btn" />
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

  // Thêm hàm submit import
  const handleImportSubmit = async () => {
    try {
      const values = await importForm.validateFields();
      const payload = {
        areaType,
        areas: values.areas.map(area => ({
          name: area.name,
          districts: area.districts || [],
          shippingFee: area.shippingFee || 0
        }))
      };
      await postRequest('/admin/areas', payload);
      message.success('Nhập danh sách khu vực thành công!');
      setImportModalVisible(false);
      fetchAreas();
    } catch (error) {
      message.error('Không thể nhập danh sách khu vực');
    }
  };

  // Khi mở modal nhập, set giá trị mặc định là danh sách khu vực hiện tại
  const openImportModal = () => {
    importForm.setFieldsValue({
      areas: areas.map(area => ({
        name: area.name,
        districts: area.districts,
        shippingFee: area.shippingFee || 0
      }))
    });
    setImportModalVisible(true);
  };

  // Mở modal thêm quận/huyện
  const showAddDistrictModal = (area) => {
    addDistrictForm.resetFields();
    setAddDistrictModal({ visible: true, area });
  };

  // Xử lý thêm quận/huyện từ modal
  const handleAddDistrictModalOk = async () => {
    try {
      const values = await addDistrictForm.validateFields();
      const newDistricts = values.districts;
      const area = addDistrictModal.area;
      const newAreas = areas.map(a =>
        a.id === area.id
          ? { ...a, districts: [...a.districts, ...newDistricts.filter(d => !a.districts.includes(d))] }
          : a
      );
      setAddDistrictModal({ visible: false, area: null });
      updateAllAreas(newAreas);
    } catch {}
  };

  // Mở modal chỉnh sửa khu vực
  const showEditAreaModal = (area) => {
    editAreaForm.setFieldsValue({
      name: area.name,
      districts: area.districts,
      shippingFee: area.shippingFee || 0
    });
    setEditAreaModal({ visible: true, area });
  };

  // Xử lý lưu chỉnh sửa khu vực
  const handleEditAreaModalOk = async () => {
    try {
      const values = await editAreaForm.validateFields();
      console.log("values", values);
      await putRequest(
        `/admin/areas/${editAreaModal.area.areaId}?name=${encodeURIComponent(values.name)}&shippingFee=${values.shippingFee}`,
        values.districts
      );
      setEditAreaModal({ visible: false, area: null });
      message.success('Cập nhật khu vực thành công!');
      fetchAreas();
    } catch (error) {
      message.error('Không thể cập nhật khu vực');
    }
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
            <Space className="areas-header-actions">
              <Select
                value={areaType}
                style={{ width: 160 }}
                onChange={value => setAreaType(value)}
              >
                <Option value="ShippingFee">ShippingFee</Option>
                <Option value="Driver">Driver</Option>
              </Select>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => fetchAreas(areaType)}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="default"
                onClick={openImportModal}
              >
                Nhập danh sách khu vực
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
          className="areas-table"
        />
      </Card>

      {/* Modal for adding/editing area */}
      <Modal
        title={editingArea ? "Chỉnh sửa khu vực" : "Thêm khu vực mới"}
        open={modalVisible}
        onOk={handleModalSubmit}
        okText={editingArea ? "Cập nhật" : "Thêm"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khu vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}
          >
            <Input placeholder="Nhập tên khu vực" />
          </Form.Item>
          <Form.Item
            name="shippingFee"
            label="Phí giao hàng (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập phí giao hàng' }]}
          >
            <Input 
              type="number" 
              placeholder="30000"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for adding district to area */}
      <Modal
        title={`Thêm quận/huyện vào ${currentArea?.name || ''}`}
        open={districtModalVisible}
        onOk={handleAddDistrict}
        okText="Thêm"
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

      {/* Modal nhập danh sách khu vực */}
      <Modal
        title="Nhập danh sách khu vực"
        open={importModalVisible}
        onOk={handleImportSubmit}
        onCancel={() => setImportModalVisible(false)}
        okText="Nhập"
        width={1000}
        footer={[
          <Button key="submit" type="primary" onClick={handleImportSubmit} style={{ width: '100%' }}>
            Nhập
          </Button>
        ]}
      >
        <Form form={importForm} layout="vertical">
          <Form.List name="areas" initialValue={[{ name: '', districts: [], shippingFee: 0 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ border: '1px solid #eee', padding: 16, marginBottom: 12, borderRadius: 8 }}>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="Tên khu vực"
                          rules={[{ required: true, message: 'Nhập tên khu vực' }]}
                        >
                          <Input placeholder="Tên khu vực" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'districts']}
                          label="Danh sách quận/huyện"
                          rules={[{ required: true, message: 'Chọn ít nhất 1 quận/huyện' }]}
                        >
                          <Select
                            mode="multiple"
                            placeholder="Chọn quận/huyện"
                            options={allDistricts.map(d => ({ label: d, value: d }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'shippingFee']}
                          label="Phí giao hàng (VNĐ)"
                          rules={[{ required: true, message: 'Nhập phí giao hàng' }]}
                        >
                          <Input 
                            type="number" 
                            placeholder="30000"
                            min={0}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                        {fields.length > 1 && (
                          <Button danger onClick={() => remove(name)}>-</Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add({ name: '', districts: [], shippingFee: 0 })} block>+ Thêm khu vực</Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal thêm quận/huyện vào khu vực */}
      <Modal
        title={`Thêm quận/huyện vào ${addDistrictModal.area?.name || ''}`}
        open={addDistrictModal.visible}
        onOk={handleAddDistrictModalOk}
        onCancel={() => setAddDistrictModal({ visible: false, area: null })}
        okText="Thêm"
        cancelText="Hủy"
        footer={[
          <Button key="submit" type="primary" onClick={handleAddDistrictModalOk} style={{ width: '100%' }}>
            Thêm
          </Button>
        ]}
      >
        <Form form={addDistrictForm} layout="vertical">
          <Form.Item
            name="districts"
            label="Chọn quận/huyện"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 quận/huyện' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn quận/huyện"
              options={addDistrictModal.area ? allDistricts.filter(d => !addDistrictModal.area.districts.includes(d)).map(d => ({ label: d, value: d })) : []}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa khu vực */}
      <Modal
        title="Chỉnh sửa khu vực"
        open={editAreaModal.visible}
        onOk={handleEditAreaModalOk}
        onCancel={() => setEditAreaModal({ visible: false, area: null })}
        okText="Lưu"
        footer={[
          <Button key="submit" type="primary" onClick={handleEditAreaModalOk} style={{ width: '100%' }}>
            Lưu
          </Button>
        ]}
      >
        <Form form={editAreaForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khu vực"
            rules={[{ required: true, message: 'Vui lòng nhập tên khu vực' }]}
          >
            <Input placeholder="Tên khu vực" />
          </Form.Item>
          <Form.Item
            name="districts"
            label="Danh sách quận/huyện"
            rules={[{ required: true, message: 'Chọn ít nhất 1 quận/huyện' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn quận/huyện"
              options={allDistricts.map(d => ({ label: d, value: d }))}
            />
          </Form.Item>
          <Form.Item
            name="shippingFee"
            label="Phí giao hàng (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập phí giao hàng' }]}
          >
            <Input 
              type="number" 
              placeholder="30000"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Areas;