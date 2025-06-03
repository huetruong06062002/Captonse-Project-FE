import React, { useEffect, useState, useRef } from 'react';
import { Table, Input, Tag, Avatar, Space, Button, Card, Typography, message, Select, Modal, Form, DatePicker, Upload, Radio } from 'antd';
import { getRequestParams, getRequest, postRequestMultipartFormData, postRequest } from '../../services/api';
import { SearchOutlined, UserOutlined, PhoneOutlined, SettingOutlined, PlusOutlined, UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const { Title } = Typography;
const { Option } = Select;

function MapResizeTrigger({ trigger }) {
  const map = useMap();
  React.useEffect(() => {
    if (trigger) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300); // delay để modal render xong
    }
  }, [trigger, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvent('click', (e) => {
    onMapClick([e.latlng.lat, e.latlng.lng]);
  });
  return null;
}

async function geocodeAddress(address) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  if (data && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
}

export default function PlaceOrderManagementCustomerStaff() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchingByPhone, setSearchingByPhone] = useState(false);
  const [isShowingSearchResult, setIsShowingSearchResult] = useState(false);

  // Create customer modal states
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  // Page size options
  const pageSizeOptions = [5, 10, 15, 20];

    // Address states
    const [addressList, setAddressList] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
  
  // Create address modal states
  const [isCreateAddressModalVisible, setIsCreateAddressModalVisible] = useState(false);
  const [createAddressForm] = Form.useForm();
  const [creatingAddress, setCreatingAddress] = useState(false);
  const [currentUserIdForAddress, setCurrentUserIdForAddress] = useState(null);

  // New state for selected latitude/longitude
  const [selectedLatLng, setSelectedLatLng] = useState(null);

  // New state for address options and selected address ID
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [placingOrderUserId, setPlacingOrderUserId] = useState(null);
  const [isSelectAddressModalVisible, setIsSelectAddressModalVisible] = useState(false);

  // Fetch data from paginated API
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await getRequestParams('/users', {
        role: 'Customer',
        page: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
      });
      setData(res.data.data);
      setPagination({
        current: res.data.currentPage,
        pageSize: params.pageSize || pagination.pageSize,
        total: res.data.totalRecords,
      });
      setIsShowingSearchResult(false);
    } catch (e) {
      setData([]);
      message.error('Không thể tải dữ liệu');
    }
    setLoading(false);
  };

  // Search user by phone number
  const searchByPhone = async (phone) => {
    if (!phone || phone.trim() === '') {
      message.warning('Vui lòng nhập số điện thoại');
      return;
    }
    
    setSearchingByPhone(true);
    try {
      const res = await getRequest(`/users/search?phone=${phone.trim()}`);
      if (res.data) {
        setData([res.data]); // Wrap single user in array
        setIsShowingSearchResult(true);
        setPagination({ current: 1, pageSize: 1, total: 1 });
        message.success('Tìm thấy khách hàng');
      } else {
        setData([]);
        setIsShowingSearchResult(true);
        setPagination({ current: 1, pageSize: 0, total: 0 });
        message.info('Không tìm thấy khách hàng với số điện thoại này');
      }
    } catch (e) {
      setData([]);
      setIsShowingSearchResult(true);
      setPagination({ current: 1, pageSize: 0, total: 0 });
      message.error('Không tìm thấy khách hàng với số điện thoại này');
    }
    setSearchingByPhone(false);
  };

  // Reset search and show all data
  const resetSearch = () => {
    setPhoneSearch('');
    setIsShowingSearchResult(false);
    fetchData(pagination);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    const newPagination = {
      current: 1, // Reset to first page when changing page size
      pageSize: newPageSize,
      total: pagination.total
    };
    setPagination(newPagination);
    fetchData(newPagination);
  };

  // Create customer function
  const createCustomer = async (values) => {
    setCreating(true);
    try {
      const formData = new FormData();
      
      // Add required fields
      formData.append('FullName', values.fullName);
      formData.append('Password', values.password);
      formData.append('Role', 'Customer'); // Fixed as Customer
      formData.append('Gender', values.gender);
      formData.append('PhoneNumber', values.phoneNumber);
      
      // Add optional fields if provided
      if (values.email) {
        formData.append('Email', values.email);
      }
      if (values.dob) {
        formData.append('Dob', values.dob.format('YYYY-MM-DD'));
      }
      if (values.rewardPoints) {
        formData.append('RewardPoints', values.rewardPoints);
      }
      if (avatarFile) {
        formData.append('Avatar', avatarFile);
      }

      await postRequestMultipartFormData('/users/create', formData);
      
      message.success('Tạo khách hàng thành công!');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      setAvatarFile(null);
      fetchData(pagination); // Refresh data
    } catch (error) {
      console.error('Error creating customer:', error);
      message.error('Không thể tạo khách hàng. Vui lòng thử lại!');
    } finally {
      setCreating(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (info) => {
    if (info.file.status !== 'uploading') {
      setAvatarFile(info.file.originFileObj || info.file);
    }
  };

  // Handle create modal
  const handleOpenCreateModal = () => {
    setIsCreateModalVisible(true);
    createForm.resetFields();
    setAvatarFile(null);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
    setAvatarFile(null);
  };

  useEffect(() => {
    fetchData(pagination);
    // eslint-disable-next-line
  }, []);

  // Search handler for name column
  const handleSearch = (selectedKeys, confirm) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  // Reset search for name column
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  // Table columns
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) =>
        avatar ? (
          <Avatar src={avatar} size={64} />
        ) : (
          <Avatar icon={<UserOutlined />} size={64} />
        ),
      width: 100,
    },
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm tên"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm kiếm
            </Button>
            <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
              Xóa
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.fullName ? record.fullName.toLowerCase().includes(value.toLowerCase()) : '',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#1890ff' }} />
          <span>{phone}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || <span style={{ color: '#aaa' }}>Không có</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Deleted', value: 'Deleted' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) =>
        status === 'Active' ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Đã xóa</Tag>
        ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: 'Male', value: 'Male' },
        { text: 'Female', value: 'Female' },
      ],
      onFilter: (value, record) => record.gender === value,
      render: (gender) => gender === 'Male' ? 'Nam' : 'Nữ',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      render: (dob) => dob ? new Date(dob).toLocaleDateString('vi-VN') : <span style={{ color: '#aaa' }}>Không có</span>,
      sorter: (a, b) => (a.dob || '').localeCompare(b.dob || ''),
    },
    {
      title: 'Điểm thưởng',
      dataIndex: 'rewardPoints',
      key: 'rewardPoints',
      sorter: (a, b) => a.rewardPoints - b.rewardPoints,
      render: (points) => <Tag color="gold">{points} điểm</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.dateCreated) - new Date(b.dateCreated),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EnvironmentOutlined />}
            onClick={() => fetchAddresses(record.userId)}
          >
            Xem địa chỉ
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              // Lấy danh sách địa chỉ
              const res = await getRequest(`/addresses/userId?userId=${record.userId}`);
              const addresses = res.data || [];
              if (!addresses.length) {
                message.error('Khách hàng chưa có địa chỉ!');
                return;
              }
              setAddressOptions(addresses);
              setSelectedAddressId(addresses[0].addressId); // chọn mặc định
              setPlacingOrderUserId(record.userId);
              setIsSelectAddressModalVisible(true);
            }}
          >
            Tạo đơn hàng
          </Button>
        </Space>
      ),
    },
  ];


  const fetchAddresses = async (userId) => {
    setAddressLoading(true);
    setCurrentUserIdForAddress(userId);
    try {
      const res = await getRequest(`/addresses/userId?userId=${userId}`);
      setAddressList(res.data || []);
    } catch (e) {
      setAddressList([]);
      message.error('Không thể tải địa chỉ khách hàng');
    }
    setAddressLoading(false);
  };

  return (
    <Card style={{ margin: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <UserOutlined /> Quản lý đơn hàng khách hàng
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            size="large"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', width:"50%" }}
          >
            Thêm khách hàng mới
          </Button>
        </div>
        
        {/* Phone Search Section */}
        <Card 
          title={
            <Space>
              <PhoneOutlined style={{ color: '#1890ff' }} />
              <span>Tìm kiếm theo số điện thoại</span>
            </Space>
          }
          size="small" 
          style={{ marginBottom: '16px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Input
              placeholder="Nhập số điện thoại để tìm kiếm"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              onPressEnter={() => searchByPhone(phoneSearch)}
              prefix={<PhoneOutlined />}
              style={{ flex: 1, minWidth: '300px', width: '600px' }}
              size="large"
            />
            <Button 
              type="primary" 
              onClick={() => searchByPhone(phoneSearch)}
              loading={searchingByPhone}
              icon={<SearchOutlined />}
              // size="large"
              style={{width:"20%"}}
            >
              Tìm kiếm
            </Button>
            {isShowingSearchResult && (
              <Button onClick={resetSearch} type="default" size="large">
                Hiển thị tất cả
              </Button>
            )}
          </div>
          
          {/* Page size selector */}
          <div style={{ 
            marginTop: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SettingOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontSize: '14px', color: '#595959' }}>Hiển thị:</span>
              <Select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                disabled={isShowingSearchResult || loading}
                style={{ width: '80px' }}
                size="small"
              >
                {pageSizeOptions.map(size => (
                  <Option key={size} value={size}>
                    {size}
                  </Option>
                ))}
              </Select>
              <span style={{ fontSize: '14px', color: '#595959' }}>mục/trang</span>
            </div>
            
            {!isShowingSearchResult && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                Tổng cộng: <strong>{pagination.total}</strong> khách hàng
              </div>
            )}
          </div>
          
          {isShowingSearchResult && (
            <div style={{ marginTop: '12px' }}>
              <Tag color="blue" style={{ padding: '4px 8px', fontSize: '14px' }}>
                Đang hiển thị kết quả tìm kiếm cho số điện thoại: <strong>{phoneSearch}</strong>
              </Tag>
            </div>
          )}
        </Card>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="userId"
        pagination={isShowingSearchResult ? false : {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false, // We use our custom size changer above
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} mục`,
        }}
        loading={loading || searchingByPhone}
        onChange={(paginationInfo, filters, sorter) => {
          if (!isShowingSearchResult) {
            fetchData({
              current: paginationInfo.current,
              pageSize: pagination.pageSize, // Keep current page size
            });
          }
        }}
        bordered
        size="middle"
        locale={{
          emptyText: isShowingSearchResult 
            ? 'Không tìm thấy khách hàng với số điện thoại này' 
            : 'Không có dữ liệu'
        }}
      />
      
      {/* Create Customer Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusOutlined style={{ color: '#52c41a' }} />
            <span>Thêm khách hàng mới</span>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCloseCreateModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={creating}
            onClick={() => createForm.submit()}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Tạo khách hàng
          </Button>,
        ]}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={createCustomer}
          style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Left Column */}
            <div>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
              >
                <Input placeholder="Nhập email (tùy chọn)" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </div>

            {/* Right Column */}
            <div>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Radio.Group>
                  <Radio value="Male">Nam</Radio>
                  <Radio value="Female">Nữ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="dob"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                />
              </Form.Item>

              <Form.Item
                label="Điểm thưởng"
                name="rewardPoints"
              >
                <Input
                  type="number"
                  placeholder="Nhập điểm thưởng (mặc định: 0)"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label="Ảnh đại diện"
                name="avatar"
              >
                <Upload
                  beforeUpload={() => false} // Prevent auto upload
                  onChange={handleAvatarChange}
                  accept="image/*"
                  maxCount={1}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  Chấp nhận: JPG, PNG, GIF (tùy chọn)
                </div>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Address Modal */}
      <Modal
        open={!!addressList.length}
        onCancel={() => setAddressList([])}
        width={900}
        footer={null}
        title="Địa chỉ khách hàng"
      >
        <div style={{ height: 400, marginBottom: 16 }}>
          <MapContainer
            center={
              addressList.length
                ? [addressList[0].latitude, addressList[0].longitude]
                : [10.7769, 106.7009]
            }
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <MapResizeTrigger trigger={!!addressList.length} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {addressList.map(addr => (
              <Marker
                key={addr.addressId}
                position={[addr.latitude, addr.longitude]}
                icon={L.icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                  shadowSize: [41, 41]
                })}
              >
                <Popup>
                  <b>{addr.contactName}</b><br />
                  {addr.detailAddress}<br />
                  <i>{addr.contactPhone}</i>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <Table
          dataSource={addressList}
          rowKey="addressId"
          columns={[
            { title: 'Tên liên hệ', dataIndex: 'contactName' },
            { title: 'SĐT', dataIndex: 'contactPhone' },
            { title: 'Nhãn', dataIndex: 'addressLabel' },
            { title: 'Địa chỉ', dataIndex: 'detailAddress' },
            { title: 'Mô tả', dataIndex: 'description' },
            { title: 'Ngày tạo', dataIndex: 'dateCreated', render: d => new Date(d).toLocaleString('vi-VN') },
          ]}
          pagination={false}
          size="small"
        />
        <Button
          type="primary"
          style={{ marginBottom: 16, background: '#1890ff' }}
          onClick={() => {
            setIsCreateAddressModalVisible(true);
            createAddressForm.resetFields();
            setSelectedLatLng(null);
          }}
        >
          Thêm địa chỉ mới
        </Button>
      </Modal>

      <Modal
        open={isCreateAddressModalVisible}
        onCancel={() => setIsCreateAddressModalVisible(false)}
        title="Thêm địa chỉ mới"
        footer={null}
        width={900}
      >
        <Form
          form={createAddressForm}
          layout="vertical"
          onFinish={async (values) => {
            setCreatingAddress(true);
            try {
              await postRequest(
                `/customer-staff/create-address?userId=${currentUserIdForAddress}`,
                values
              );
              message.success('Tạo địa chỉ thành công!');
              setIsCreateAddressModalVisible(false);
              createAddressForm.resetFields();
              fetchAddresses(currentUserIdForAddress);
            } catch (e) {
              message.error('Không thể tạo địa chỉ!');
            }
            setCreatingAddress(false);
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Cột trái: Thông tin địa chỉ */}
            <div>
              <Form.Item label="Tên liên hệ" name="contactName" rules={[{ required: true, message: 'Nhập tên liên hệ' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="SĐT" name="contactPhone" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Nhãn" name="addressLabel" rules={[{ required: true, message: 'Nhập nhãn địa chỉ' }]}>
                <Input />
              </Form.Item>
              <Form.Item
                label="Địa chỉ chi tiết"
                name="detailAddress"
                rules={[{ required: true, message: 'Nhập địa chỉ chi tiết' }]}
              >
                <Input
                  onBlur={async (e) => {
                    const address = e.target.value;
                    if (address) {
                      const latlng = await geocodeAddress(address);
                      if (latlng) {
                        setSelectedLatLng(latlng);
                        createAddressForm.setFieldsValue({
                          latitude: latlng[0],
                          longitude: latlng[1],
                        });
                      } else {
                        message.error('Không tìm thấy vị trí trên bản đồ!');
                      }
                    }
                  }}
                />
              </Form.Item>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea />
              </Form.Item>
            </div>
            {/* Cột phải: Bản đồ chọn vị trí */}
            <div>
              <Form.Item label="Chọn vị trí trên bản đồ" required>
                <div style={{ height: 320, width: '100%', marginBottom: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                  <MapContainer
                    center={selectedLatLng || [10.7769, 106.7009]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={map => setTimeout(() => map.invalidateSize(), 300)}
                    scrollWheelZoom={true}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {selectedLatLng && (
                      <Marker position={selectedLatLng} />
                    )}
                    <MapClickHandler
                      onMapClick={(latlng) => {
                        setSelectedLatLng(latlng);
                        createAddressForm.setFieldsValue({
                          latitude: latlng[0],
                          longitude: latlng[1],
                        });
                      }}
                    />
                  </MapContainer>
                </div>
              </Form.Item>
              <Form.Item label="Latitude" name="latitude" rules={[{ required: true, message: 'Chọn vị trí trên bản đồ' }]}>
                <Input type="number" disabled />
              </Form.Item>
              <Form.Item label="Longitude" name="longitude" rules={[{ required: true, message: 'Chọn vị trí trên bản đồ' }]}>
                <Input type="number" disabled />
              </Form.Item>
            </div>
          </div>
          <Button type="primary" htmlType="submit" loading={creatingAddress} block style={{ marginTop: 16 }}>
            Tạo địa chỉ
          </Button>
        </Form>
      </Modal>

      {/* Select Address Modal */}
      <Modal
        open={isSelectAddressModalVisible}
        onCancel={() => setIsSelectAddressModalVisible(false)}
        title="Tạo đơn hàng mới"
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          onFinish={async (values) => {
            try {
              await postRequest(
                `/customer-staff/place-order?userId=${placingOrderUserId}`,
                {
                  deliveryAddressId: values.deliveryAddressId,
                  deliveryTime: values.deliveryTime ? values.deliveryTime.format('YYYY-MM-DDTHH:mm:ss') : undefined,
                  shippingFee: values.shippingFee || 0,
                  shippingDiscount: values.shippingDiscount || 0,
                  applicableFee: values.applicableFee || 0,
                  discount: values.discount || 0,
                  total: values.total || 0,
                  note: values.note || "",
                }
              );
              message.success('Tạo đơn hàng thành công!');
              setIsSelectAddressModalVisible(false);
            } catch (e) {
              message.error('Tạo đơn hàng thất bại!');
            }
          }}
          initialValues={{
            deliveryAddressId: selectedAddressId,
            shippingFee: 0,
            shippingDiscount: 0,
            applicableFee: 0,
            discount: 0,
            total: 0,
            note: "",
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <Form.Item label="Chọn địa chỉ giao hàng" name="deliveryAddressId" rules={[{ required: true }]}
                style={{ marginBottom: 16 }}>
                <Radio.Group
                  value={selectedAddressId}
                  onChange={e => setSelectedAddressId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {addressOptions.map(addr => (
                    <Radio key={addr.addressId} value={addr.addressId} style={{ display: 'block', margin: '8px 0' }}>
                      <b>{addr.addressLabel}</b>: {addr.detailAddress}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Thời gian giao (tùy chọn)" name="deliveryTime">
                <DatePicker
                  showTime={{ format: 'HH:mm:ss' }}
                  format="DD/MM/YYYY HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày giờ giao hàng"
                />
              </Form.Item>
              <Form.Item label="Phí vận chuyển" name="shippingFee">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item label="Giảm giá vận chuyển" name="shippingDiscount">
                <Input type="number" min={0} />
              </Form.Item>
            </div>
            <div>
              <Form.Item label="Phí phát sinh" name="applicableFee">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item label="Giảm giá" name="discount">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item label="Tổng cộng" name="total">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea />
              </Form.Item>
            </div>
          </div>
          <Button type="primary" htmlType="submit" block>
            Xác nhận tạo đơn hàng
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}
