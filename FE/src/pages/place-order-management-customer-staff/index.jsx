import React, { useEffect, useState, useRef } from 'react';
import { Table, Input, Tag, Avatar, Space, Button, Card, Typography, message, Select, Modal, Form, DatePicker, Upload, Radio, InputNumber } from 'antd';
import { getRequestParams, getRequest, postRequestMultipartFormData, postRequest, putRequest } from '../../services/api';
import { SearchOutlined, UserOutlined, PhoneOutlined, SettingOutlined, PlusOutlined, UploadOutlined, EnvironmentOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
  const [cartData, setCartData] = useState(null);
  const [placeOrderForm] = Form.useForm();
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // New state for cart modal
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [cartModalData, setCartModalData] = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);

  // New state for add/update cart modal
  const [isCartManagementModalVisible, setIsCartManagementModalVisible] = useState(false);
  const [cartManagementForm] = Form.useForm();
  const [currentCartUserId, setCurrentCartUserId] = useState(null);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [submittingCart, setSubmittingCart] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

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
        <Space direction="vertical" size={4}>
          <Space>
            <Button
              icon={<EnvironmentOutlined />}
              onClick={() => fetchAddresses(record.userId)}
              size="small"
            >
              Xem địa chỉ
            </Button>
            <Button
              type="default"
              onClick={() => fetchCartData(record.userId)}
              loading={loadingCart}
              style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }}
              size="small"
            >
              Xem giỏ hàng
            </Button>
          </Space>
          <Space>
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

                // Gọi API cart để lấy thông tin
                try {
                  const cartRes = await getRequest(`/customer-staff/cart?userId=${record.userId}`);
                  setCartData(cartRes.data);

                  // Set initial values for form
                  placeOrderForm.setFieldsValue({
                    deliveryAddressId: addresses[0].addressId,
                    shippingFee: 0,
                    applicableFee: cartRes.data.applicableFee || 0,
                    discount: 0,
                    serviceName: cartRes.data.serviceName || "",
                    estimatedTotal: cartRes.data.estimatedTotal || 0,
                    total: (cartRes.data.estimatedTotal || 0) + (cartRes.data.applicableFee || 0),
                    note: "",
                  });
                } catch (e) {
                  message.error('Không thể tải thông tin giỏ hàng!');
                  return;
                }

                setIsSelectAddressModalVisible(true);
              }}
              size="small"
            >
              Tạo đơn hàng
            </Button>
          </Space>
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
      console.log(e);
      message.error(e.response.data.message);
    }
    setAddressLoading(false);
  };

  const calculateShippingFee = async () => {
    setCalculatingShipping(true);
    try {
      const formValues = placeOrderForm.getFieldsValue();
      const shippingRes = await postRequest(`/customer-staff/shipping-fee`, {
        deliveryAddressId: formValues.deliveryAddressId !== 'store' ? formValues.deliveryAddressId : undefined,
        deliveryTime: formValues.deliveryTime ? formValues.deliveryTime.format('YYYY-MM-DDTHH:mm:ss') : undefined,
        serviceName: formValues.serviceName,
        minCompleteTime: cartData?.minCompleteTime,
        estimatedTotal: formValues.estimatedTotal
      });

      // Cập nhật form với shippingFee và applicableFee từ response
      const newShippingFee = shippingRes.data.shippingFee || 0;
      const newApplicableFee = shippingRes.data.applicableFee || 0;

      placeOrderForm.setFieldsValue({
        shippingFee: newShippingFee,
        applicableFee: newApplicableFee,
      });

      // Tính lại total với giá trị mới
      const estimatedTotal = formValues.estimatedTotal || 0;
      const discount = formValues.discount || 0;
      const newTotal = estimatedTotal + newShippingFee + newApplicableFee - discount;

      placeOrderForm.setFieldValue('total', newTotal);
      message.success('Tính phí ship thành công!');
    } catch (error) {
      // Lấy message lỗi từ response
      const errorMessage = error?.response?.data?.message || error?.data?.message || 'Không thể tính phí ship!';
      message.error(errorMessage);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Fetch cart data for modal
  const fetchCartData = async (userId) => {
    setLoadingCart(true);
    try {
      const res = await getRequest(`/customer-staff/cart?userId=${userId}`);
      // Check if response has items
      const hasItems = res.data && res.data.items && res.data.items.length > 0;
      setCartModalData({
        ...res.data,
        userId: userId,
        isEmpty: !hasItems
      });
      setIsCartModalVisible(true);
    } catch (e) {
      // Handle empty cart (204) or other errors
      if (e.response?.status === 204 || e.response?.status === 404) {
        setCartModalData({
          userId: userId,
          isEmpty: true
        });
        setIsCartModalVisible(true);
      } else {
        message.error('Không thể tải thông tin giỏ hàng!');
      }
    } finally {
      setLoadingCart(false);
    }
  };

  // Fetch categories for cart management
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await getRequest('/categories');
      setCategories(res.data || []);
    } catch (e) {
      message.error('Không thể tải danh sách danh mục!');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch services by category
  const fetchServicesByCategory = async (categoryId) => {
    setLoadingServices(true);
    try {
      const res = await getRequest(`/categories/${categoryId}`);
      
      // Flatten all serviceDetails from subCategories
      const allServices = [];
      if (res.data.subCategories) {
        res.data.subCategories.forEach(subCategory => {
          if (subCategory.serviceDetails) {
            subCategory.serviceDetails.forEach(service => {
              allServices.push({
                ...service,
                subCategoryName: subCategory.name,
                subCategoryId: subCategory.subCategoryId
              });
            });
          }
        });
      }
      
      setServices(allServices);
    } catch (e) {
      message.error('Không thể tải danh sách dịch vụ!');
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch service details and extras
  const fetchServiceDetails = async (serviceId) => {
    try {
      const res = await getRequest(`/service-details/${serviceId}`);
      setSelectedService(res.data);
      
      // Flatten all extras from extraCategories
      const allExtras = [];
      if (res.data.extraCategories) {
        res.data.extraCategories.forEach(extraCategory => {
          if (extraCategory.extras) {
            extraCategory.extras.forEach(extra => {
              allExtras.push({
                ...extra,
                categoryName: extraCategory.categoryName
              });
            });
          }
        });
      }
      
      setAvailableExtras(allExtras);
    } catch (e) {
      message.error('Không thể tải chi tiết dịch vụ!');
    }
  };

  // Add to cart function
  const addToCart = async (values) => {
    console.log('Add to cart values:', values); // Debug log
    setSubmittingCart(true);
    try {
      const payload = {
        serviceDetailId: values.serviceDetailId,
        quantity: parseInt(values.quantity),
        extraIds: values.extraIds || []
      };
      
      console.log('Add to cart payload:', payload); // Debug log
      console.log('User ID:', currentCartUserId); // Debug log
      
      await postRequest(`/customer-staff/add-to-cart?userId=${currentCartUserId}`, payload);
      message.success('Thêm vào giỏ hàng thành công!');
      setIsCartManagementModalVisible(false);
      cartManagementForm.resetFields();
      setSelectedService(null);
      setAvailableExtras([]);
      setSelectedCategory(null);
      setServices([]);
    } catch (e) {
      console.error('Add to cart error:', e); // Debug log
      message.error('Không thể thêm vào giỏ hàng!');
    } finally {
      setSubmittingCart(false);
    }
  };

  // Update cart function
  const updateCart = async (values) => {
    console.log('Update cart values:', values); // Debug log
    setSubmittingCart(true);
    try {
      const payload = {
        orderItemId: values.orderItemId,
        quantity: parseInt(values.quantity),
        extraIds: values.extraIds || []
      };
      
      console.log('Update cart payload:', payload); // Debug log
      
      await putRequest(`/customer-staff/cart?userId=${currentCartUserId}`, payload);
      message.success('Cập nhật giỏ hàng thành công!');
      setIsCartManagementModalVisible(false);
      cartManagementForm.resetFields();
      setSelectedService(null);
      setAvailableExtras([]);
      setSelectedCategory(null);
      setServices([]);
    } catch (e) {
      console.error('Update cart error:', e); // Debug log
      message.error('Không thể cập nhật giỏ hàng!');
    } finally {
      setSubmittingCart(false);
    }
  };

  // Open cart management modal
  const openCartManagementModal = async (userId, forceAddMode = false) => {
    setCurrentCartUserId(userId);
    
    // Check if cart has items (only if not forced to add mode)
    if (!forceAddMode) {
      try {
        const cartRes = await getRequest(`/customer-staff/cart?userId=${userId}`);
        const hasItems = cartRes.data && cartRes.data.items && cartRes.data.items.length > 0;
        setIsUpdatingCart(hasItems);
        
        if (hasItems) {
          // Pre-fill form with first item for update
          const firstItem = cartRes.data.items[0];
          cartManagementForm.setFieldsValue({
            orderItemId: firstItem.orderItemId,
            quantity: firstItem.quantity,
            extraIds: firstItem.extras?.map(e => e.extraId) || []
          });
          
          // Fetch service details for the first item
          await fetchServiceDetails(firstItem.serviceId);
        } else {
          cartManagementForm.resetFields();
        }
      } catch (e) {
        setIsUpdatingCart(false);
        cartManagementForm.resetFields();
      }
    } else {
      // Force add mode - reset everything
      setIsUpdatingCart(false);
      cartManagementForm.resetFields();
      setSelectedService(null);
      setAvailableExtras([]);
    }
    
    await fetchCategories();
    setIsCartManagementModalVisible(true);
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
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', width: "50%" }}
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
              style={{ width: "20%" }}
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
        open={isSelectAddressModalVisible}
        onCancel={() => setIsSelectAddressModalVisible(false)}
        title="Tạo đơn hàng mới"
        footer={null}
        width={700}
      >
        <Form
          form={placeOrderForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const payload = {
                deliveryTime: values.deliveryTime ? values.deliveryTime.format('YYYY-MM-DDTHH:mm:ss') : undefined,
                shippingFee: values.shippingFee || 0,
                applicableFee: values.applicableFee || 0,
                discount: values.discount || 0,
                total: values.total || 0,
                note: values.note || "",
              };

              // Chỉ thêm deliveryAddressId nếu không chọn "Tại cửa hàng"
              if (values.deliveryAddressId !== 'store') {
                payload.deliveryAddressId = values.deliveryAddressId;
              }

              await postRequest(
                `/customer-staff/place-order?userId=${placingOrderUserId}`,
                payload
              );
              message.success('Tạo đơn hàng thành công!');
              setIsSelectAddressModalVisible(false);
            } catch (e) {
              message.error('Tạo đơn hàng thất bại!');
            }
          }}
          onValuesChange={(changedValues, allValues) => {
            // Tự động tính total khi các giá trị thay đổi
            if (changedValues.estimatedTotal || changedValues.shippingFee || changedValues.applicableFee || changedValues.discount) {
              const estimatedTotal = allValues.estimatedTotal || 0;
              const shippingFee = allValues.shippingFee || 0;
              const applicableFee = allValues.applicableFee || 0;
              const discount = allValues.discount || 0;

              const total = estimatedTotal + shippingFee + applicableFee - discount;
              placeOrderForm.setFieldValue('total', total);
            }
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
                  <Radio value="store" style={{ display: 'block', margin: '8px 0' }}>
                    <b>Tại cửa hàng</b>
                  </Radio>
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
              <Form.Item name="serviceName">
                <div style={{ padding: '8px 0', fontSize: '14px' }}>
                  <span style={{ fontWeight: 'normal' }}>Tên dịch vụ: </span>
                  <span style={{ fontWeight: '500' }}>{placeOrderForm.getFieldValue('serviceName') || 'Đang tải...'}</span>
                </div>
              </Form.Item>
              <Button
                type="default"
                onClick={calculateShippingFee}
                loading={calculatingShipping}
                style={{ width: '100%', marginBottom: 16 }}
              >
                Tính phí ship
              </Button>
            </div>
            <div>
              <Form.Item label="Tổng tạm tính" name="estimatedTotal">
                <Input type="number" min={0} disabled />
              </Form.Item>
              <Form.Item label="Phí vận chuyển" name="shippingFee">
                <Input type="number" min={0} disabled />
              </Form.Item>
              <Form.Item label="Phí phát sinh" name="applicableFee">
                <Input type="number" min={0} disabled />
              </Form.Item>
              <Form.Item label="Giảm giá" name="discount">
                <Input type="number" min={0} />
              </Form.Item>
              <Form.Item label="Tổng cộng" name="total">
                <Input type="number" min={0} disabled style={{ fontWeight: 'bold', fontSize: '16px', color: '#f5222d' }} />
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

      {/* Cart Modal */}
      <Modal
        open={isCartModalVisible}
        onCancel={() => setIsCartModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setIsCartModalVisible(false)}>
            Đóng
          </Button>
        ]}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCartOutlined style={{ color: '#faad14' }} />
            <span>Chi tiết giỏ hàng</span>
          </div>
        }
      >
        {cartModalData && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {cartModalData.isEmpty ? (
              // Empty cart display - ONLY this when cart is empty
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <ShoppingCartOutlined style={{ fontSize: '80px', color: '#d9d9d9', marginBottom: '24px' }} />
                <h2 style={{ color: '#999', marginBottom: '12px', fontSize: '24px' }}>Giỏ hàng đang rỗng</h2>
                <p style={{ color: '#666', marginBottom: '32px', fontSize: '16px' }}>
                  Khách hàng chưa có sản phẩm nào trong giỏ hàng
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIsCartModalVisible(false);
                    openCartManagementModal(cartModalData.userId, true); // Force add mode
                  }}
                  style={{ 
                    backgroundColor: '#52c41a', 
                    borderColor: '#52c41a',
                    height: '48px',
                    fontSize: '16px',
                    padding: '0 32px'
                  }}
                  size="large"
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>
            ) : (
              // Cart with items display - ONLY this when cart has items
              <>
                {/* Order Info */}
                <Card 
                  size="small" 
                  title="Thông tin đơn hàng" 
                  style={{ marginBottom: 16 }}
                  headStyle={{ backgroundColor: '#f0f9ff', color: '#1890ff' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p><strong>Mã đơn hàng:</strong> <Tag color="blue">{cartModalData.orderId || 'Chưa có'}</Tag></p>
                      <p><strong>Tên dịch vụ:</strong> {cartModalData.serviceName || 'Chưa có'}</p>
                      <p><strong>Thời gian hoàn thành:</strong> <Tag color="orange">{cartModalData.minCompleteTime || 0} phút</Tag></p>
                    </div>
                    <div>
                      <p><strong>Thời gian nhận:</strong> {cartModalData.pickupTime ? new Date(cartModalData.pickupTime).toLocaleString('vi-VN') : 'Chưa có'}</p>
                      <p><strong>Thời gian giao:</strong> {cartModalData.deliveryTime ? new Date(cartModalData.deliveryTime).toLocaleString('vi-VN') : 'Chưa có'}</p>
                    </div>
                  </div>
                </Card>

                {/* Address Info */}
                {cartModalData.addressCartResponse && (
                  <Card 
                    size="small" 
                    title="Thông tin địa chỉ" 
                    style={{ marginBottom: 16 }}
                    headStyle={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <p><strong>Tên liên hệ:</strong> {cartModalData.addressCartResponse.contactName}</p>
                        <p><strong>Số điện thoại:</strong> {cartModalData.addressCartResponse.contactPhone}</p>
                      </div>
                      <div>
                        <p><strong>Nhãn:</strong> <Tag color="green">{cartModalData.addressCartResponse.addressLabel}</Tag></p>
                        <p><strong>Địa chỉ:</strong> {cartModalData.addressCartResponse.detailAddress}</p>
                      </div>
                    </div>
                    {cartModalData.addressCartResponse.description && (
                      <p><strong>Mô tả:</strong> {cartModalData.addressCartResponse.description}</p>
                    )}
                  </Card>
                )}

                {/* Items List */}
                <Card 
                  size="small" 
                  title={`Danh sách sản phẩm (${cartModalData.items?.length || 0} mục)`}
                  style={{ marginBottom: 16 }}
                  headStyle={{ backgroundColor: '#fff7e6', color: '#fa8c16' }}
                >
                  {cartModalData.items?.map((item, index) => (
                    <div key={item.orderItemId} style={{ 
                      padding: '12px', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '6px', 
                      marginBottom: index < cartModalData.items.length - 1 ? '12px' : 0,
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, color: '#1890ff' }}>{item.serviceName}</h4>
                        <div style={{ textAlign: 'right' }}>
                          <div>Số lượng: <Tag color="blue">{item.quantity}</Tag></div>
                          <div>Giá dịch vụ: <Tag color="green">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.servicePrice)}</Tag></div>
                        </div>
                      </div>
                      
                      {item.extras && item.extras.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <strong>Dịch vụ đi kèm:</strong>
                          <div style={{ marginTop: 4 }}>
                            {item.extras.map(extra => (
                              <div key={extra.extraId} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '4px 8px', 
                                backgroundColor: 'white', 
                                border: '1px solid #e6f7ff',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}>
                                <span>{extra.extraName}</span>
                                <span style={{ color: '#52c41a', fontWeight: '500' }}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(extra.extraPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ textAlign: 'right', borderTop: '1px solid #e8e8e8', paddingTop: 8 }}>
                        <strong style={{ fontSize: '16px', color: '#f5222d' }}>
                          Tổng phụ: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subTotal)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </Card>

                {/* Total Summary */}
                <Card 
                  size="small" 
                  title="Tổng kết thanh toán"
                  headStyle={{ backgroundColor: '#fff2f0', color: '#ff4d4f' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Tổng tạm tính:</span>
                        <span style={{ fontWeight: '500' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartModalData.estimatedTotal || 0)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Phí vận chuyển:</span>
                        <span style={{ fontWeight: '500' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartModalData.shippingFee || 0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Phí phát sinh:</span>
                        <span style={{ fontWeight: '500' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartModalData.applicableFee || 0)}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        borderTop: '2px solid #ff4d4f', 
                        paddingTop: 8,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#ff4d4f'
                      }}>
                        <span>TỔNG CỘNG:</span>
                        <span>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            (cartModalData.estimatedTotal || 0) + (cartModalData.shippingFee || 0) + (cartModalData.applicableFee || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Cart Management Actions for non-empty cart */}
                <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setIsCartModalVisible(false);
                      openCartManagementModal(cartModalData.userId, true); // Force add mode
                    }}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    size="large"
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    type="primary"
                    icon={<SettingOutlined />}
                    onClick={() => {
                      setIsCartModalVisible(false);
                      openCartManagementModal(cartModalData.userId, false); // Update mode
                    }}
                    style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                    size="large"
                  >
                    Chỉnh sửa giỏ hàng
                  </Button>
                  <Button
                    type="primary"
                    onClick={async () => {
                      // Đóng modal giỏ hàng
                      setIsCartModalVisible(false);
                      
                      // Lấy danh sách địa chỉ
                      const res = await getRequest(`/addresses/userId?userId=${cartModalData.userId}`);
                      const addresses = res.data || [];
                      if (!addresses.length) {
                        message.error('Khách hàng chưa có địa chỉ!');
                        return;
                      }
                      setAddressOptions(addresses);
                      setSelectedAddressId(addresses[0].addressId); // chọn mặc định
                      setPlacingOrderUserId(cartModalData.userId);

                      // Sử dụng dữ liệu cart hiện tại
                      setCartData(cartModalData);

                      // Set initial values cho form từ dữ liệu cart hiện có
                      placeOrderForm.setFieldsValue({
                        deliveryAddressId: addresses[0].addressId,
                        shippingFee: cartModalData.shippingFee || 0,
                        applicableFee: cartModalData.applicableFee || 0,
                        discount: 0,
                        serviceName: cartModalData.serviceName || "",
                        estimatedTotal: cartModalData.estimatedTotal || 0,
                        total: (cartModalData.estimatedTotal || 0) + (cartModalData.applicableFee || 0) + (cartModalData.shippingFee || 0),
                        note: "",
                      });

                      setIsSelectAddressModalVisible(true);
                    }}
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                    size="large"
                  >
                    Tạo đơn hàng
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Cart Management Modal */}
      <Modal
        open={isCartManagementModalVisible}
        onCancel={() => {
          setIsCartManagementModalVisible(false);
          cartManagementForm.resetFields();
          setSelectedService(null);
          setAvailableExtras([]);
          setSelectedCategory(null);
          setServices([]);
        }}
        width={700}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCartOutlined style={{ color: '#52c41a' }} />
            <span>{isUpdatingCart ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ hàng'}</span>
          </div>
        }
        footer={null}
      >
        <Form
          form={cartManagementForm}
          layout="vertical"
          onFinish={(values) => {
            console.log('Form submitted with values:', values); // Debug log
            if (isUpdatingCart) {
              updateCart(values);
            } else {
              addToCart(values);
            }
          }}
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo);
          }}
        >
          {isUpdatingCart && (
            <Form.Item name="orderItemId" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>
          )}

          {!isUpdatingCart && (
            <>
              <Form.Item
                label="Chọn danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  loading={loadingCategories}
                  onChange={(value) => {
                    const category = categories.find(c => c.categoryId === value);
                    setSelectedCategory(category);
                    fetchServicesByCategory(value);
                    // Reset service selection when category changes
                    cartManagementForm.setFieldValue('serviceDetailId', undefined);
                    setSelectedService(null);
                    setAvailableExtras([]);
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories.map(category => (
                    <Option key={category.categoryId} value={category.categoryId}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={category.icon} 
                          alt={category.name}
                          style={{ width: '20px', height: '20px', objectFit: 'cover' }}
                        />
                        {category.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Chọn dịch vụ"
                name="serviceDetailId"
                rules={[{ required: true, message: 'Vui lòng chọn dịch vụ!' }]}
              >
                <Select
                  placeholder="Chọn dịch vụ"
                  loading={loadingServices}
                  disabled={!selectedCategory}
                  onChange={(value) => {
                    console.log('Selected service ID:', value); // Debug log
                    const service = services.find(s => s.serviceId === value);
                    if (service) {
                      console.log('Selected service:', service); // Debug log
                      fetchServiceDetails(service.serviceId);
                    }
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  optionHeight={60}
                  listHeight={300}
                >
                  {services.map(service => (
                    <Option key={service.serviceId} value={service.serviceId}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '4px 0'
                      }}>
                        <img 
                          src={service.imageUrl} 
                          alt={service.name}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#1890ff',
                            fontSize: '14px',
                            lineHeight: '1.2',
                            marginBottom: '2px'
                          }}>
                            {service.name}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            lineHeight: '1.2'
                          }}>
                            {service.subCategoryName} • {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(service.price)}
                          </div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, max: 100, message: 'Số lượng phải từ 1 đến 100!' }
            ]}
            initialValue={1}
          >
            <InputNumber 
              min={1} 
              max={100}
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
              onChange={(value) => {
                console.log('Quantity changed:', value); // Debug log
              }}
            />
          </Form.Item>

          <Form.Item
            label="Dịch vụ đi kèm (tùy chọn)"
            name="extraIds"
          >
            <Select
              mode="multiple"
              placeholder="Chọn dịch vụ đi kèm"
              allowClear
              optionHeight={60}
              listHeight={300}
              onChange={(values) => {
                console.log('Selected extras:', values); // Debug log
              }}
            >
              {availableExtras.map(extra => (
                <Option key={extra.extraId} value={extra.extraId}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '4px 0'
                  }}>
                    <img 
                      src={extra.imageUrl} 
                      alt={extra.name}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '500',
                        fontSize: '13px',
                        lineHeight: '1.2',
                        marginBottom: '2px'
                      }}>
                        {extra.name}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#666',
                        lineHeight: '1.2'
                      }}>
                        {extra.categoryName} • {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(extra.price)}
                      </div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedService && (
            <Card size="small" title="Chi tiết dịch vụ đã chọn" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <img 
                  src={selectedService.imageUrl} 
                  alt={selectedService.name}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    borderRadius: '6px',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>{selectedService.name}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                    {selectedService.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5222d' }}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(selectedService.price)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {selectedService.minCompleteTime ? `${selectedService.minCompleteTime} phút` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Submit button */}
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingCart}
              block
              style={{ 
                backgroundColor: '#52c41a', 
                borderColor: '#52c41a',
                height: '48px',
                fontSize: '16px'
              }}
            >
              {isUpdatingCart ? 'Cập nhật' : 'Thêm vào giỏ hàng'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Address Modal */}
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
    </Card>
  );
}
