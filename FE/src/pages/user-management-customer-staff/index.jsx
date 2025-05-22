import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, Empty, Typography, Avatar, Input, Button, message, Space, Modal, Form, Select, DatePicker, Upload, Image, Descriptions, Divider, InputNumber, Checkbox, Row, Col, List, Tooltip } from 'antd';
import { getRequestParams, getRequest, postRequestMultipartFormData, postRequest, putRequest } from '@services/api';
import dayjs from 'dayjs';
import { SearchOutlined, UserAddOutlined, UploadOutlined, EyeOutlined, DeleteOutlined, ShoppingCartOutlined, PlusOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export default function UserManagementCustomerStaff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchPhone, setSearchPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isAddToCartModalVisible, setIsAddToCartModalVisible] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [form] = Form.useForm();
  const [addToCartForm] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // States for add to cart feature
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [extraCategories, setExtraCategories] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);

  const [isUpdateCartModalVisible, setIsUpdateCartModalVisible] = useState(false);
  const [updateCartForm] = Form.useForm();
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [updateCartLoading, setUpdateCartLoading] = useState(false);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [updatedExtras, setUpdatedExtras] = useState([]);
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);

  useEffect(() => {
    if (!searching) fetchUsers();
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  // Load categories when add to cart modal opens
  useEffect(() => {
    if (isAddToCartModalVisible) {
      fetchCategories();
      fetchExtraCategories();
    }
  }, [isAddToCartModalVisible]);

  // Load category details when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryDetails(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await getRequest('/categories');
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      message.error('Không thể tải danh mục dịch vụ!');
    }
  };

  const fetchCategoryDetails = async (categoryId) => {
    try {
      const response = await getRequest(`/categories/${categoryId}`);
      if (response.data) {
        setCategoryDetails(response.data);
      }
    } catch (error) {
      message.error('Không thể tải chi tiết danh mục!');
    }
  };

  const fetchExtraCategories = async () => {
    try {
      const response = await getRequest('/extra-categories');
      if (response.data) {
        setExtraCategories(response.data);
      }
    } catch (error) {
      message.error('Không thể tải dịch vụ thêm!');
    }
  };

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

  const handleViewCart = async (userId) => {
    setCartLoading(true);
    setIsCartModalVisible(true);
    setCurrentUserId(userId);
    try {
      const response = await getRequestParams('customer-staff/cart', { userId });
      if (response.data) {
        setCartData(response.data);
      } else {
        // Handle empty cart data
        setCartData(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Don't close modal on error, just show empty state
      setCartData(null);
      message.error('Không thể lấy thông tin giỏ hàng!');
    } finally {
      setCartLoading(false);
    }
  };

  const handleOpenAddToCartModal = (userId) => {
    setCurrentUserId(userId);
    setIsAddToCartModalVisible(true);
    setSelectedCategory(null);
    setCategoryDetails(null);
    setSelectedService(null);
    setSelectedExtras([]);
    addToCartForm.resetFields();
  };

  const handleAddToCart = async (values) => {
    if (!selectedService) {
      message.error('Vui lòng chọn dịch vụ!');
      return;
    }

    setAddToCartLoading(true);
    try {
      const payload = {
        serviceDetailId: selectedService.serviceId,
        quantity: values.quantity,
        extraIds: selectedExtras
      };

      await postRequest(`/customer-staff/add-to-cart?userId=${currentUserId}`, payload);
      message.success('Thêm vào giỏ hàng thành công!');
      setIsAddToCartModalVisible(false);
      
      // Refresh cart data if cart modal is open
      if (isCartModalVisible) {
        handleViewCart(currentUserId);
      }
    } catch (error) {
      message.error('Thêm vào giỏ hàng thất bại!');
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleExtraChange = (extraId, checked) => {
    if (checked) {
      setSelectedExtras(prev => [...prev, extraId]);
    } else {
      setSelectedExtras(prev => prev.filter(id => id !== extraId));
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    addToCartForm.setFieldsValue({ serviceId: service.serviceId });
  };

  // New function to handle cart item update
  const handleUpdateCartItem = async (values) => {
    if (!selectedCartItem) return;
    
    setUpdateCartLoading(true);
    try {
      const payload = {
        orderItemId: selectedCartItem.orderItemId,
        quantity: values.quantity,
        extraIds: updatedExtras
      };

      // Add userId as a query parameter to the API endpoint
      await putRequest(`/customer-staff/cart?userId=${currentUserId}`, payload);
      message.success('Cập nhật giỏ hàng thành công!');
      setIsUpdateCartModalVisible(false);
      
      // Refresh cart data
      handleViewCart(currentUserId);
    } catch (error) {
      message.error('Cập nhật giỏ hàng thất bại!');
    } finally {
      setUpdateCartLoading(false);
    }
  };

  const handleOpenUpdateModal = (item) => {
    setSelectedCartItem(item);
    setIsUpdateCartModalVisible(true);
    
    // Set initial values for the form
    updateCartForm.setFieldsValue({
      quantity: item.quantity
    });
    
    // Set initial selected extras
    const initialExtras = item.extras ? item.extras.map(extra => extra.extraId) : [];
    setUpdatedExtras(initialExtras);
    
    // Fetch available extras for this service
    fetchExtrasForUpdate();
  };

  const fetchExtrasForUpdate = async () => {
    try {
      const response = await getRequest('/extra-categories');
      if (response.data) {
        setAvailableExtras(response.data);
      }
    } catch (error) {
      message.error('Không thể tải dịch vụ thêm!');
    }
  };

  const handleUpdateExtraChange = (extraId, checked) => {
    if (checked) {
      setUpdatedExtras(prev => [...prev, extraId]);
    } else {
      setUpdatedExtras(prev => prev.filter(id => id !== extraId));
    }
  };

  // New function to handle placing an order
  const handlePlaceOrder = async () => {
    if (!cartData || !currentUserId) {
      message.error('Không có thông tin giỏ hàng!');
      return;
    }

    setPlaceOrderLoading(true);
    try {
      // Create payload based on the required fields from the API
      const payload = {
        deliveryAddressId: cartData.addressCartResponse?.addressId,
        deliveryTime: cartData.deliveryTime,
        shippingFee: cartData.shippingFee || 0,
        shippingDiscount: 0, // Default to 0 if not available
        applicableFee: cartData.applicableFee || 0,
        discount: 0, // Default to 0 if not available
        total: cartData.estimatedTotal + cartData.shippingFee + (cartData.applicableFee || 0),
        note: ''
      };

      // Make API call with userId as query parameter
      const response = await postRequest(`/customer-staff/place-order?userId=${currentUserId}`, payload);
      
      if (response.data) {
        message.success('Đặt hàng thành công!');
        setIsCartModalVisible(false);
        // Optionally refresh user's cart or clear cart data
        setCartData(null);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response?.data?.message) {
        message.error(`Đặt hàng thất bại: ${error.response.data.message}`);
      } else {
        message.error('Đặt hàng thất bại! Vui lòng thử lại sau.');
      }
    } finally {
      setPlaceOrderLoading(false);
    }
  };

  const columns = [
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar, record) =>
        avatar ? (
          <Avatar src={avatar} size={45} />
        ) : (
          <Avatar style={{ backgroundColor: '#1890ff', fontSize: '18px' }} size={45}>
            {record.fullName ? record.fullName.charAt(0).toUpperCase() : '?'}
          </Avatar>
        ),
      width: 80,
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
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => handleViewCart(record.userId)}
            style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
          >
            Xem giỏ hàng
          </Button>
          <Button
            type="default"
            icon={<PlusOutlined />}
            onClick={() => handleOpenAddToCartModal(record.userId)}
            style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
          >
            Thêm sản phẩm
          </Button>
        </Space>
      ),
    },
  ];

  // In the cart table columns, add a new action column
  const cartItemColumns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 100,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'servicePrice',
      key: 'servicePrice',
      align: 'right',
      width: 120,
      render: (price) => <Text>{price.toLocaleString()}đ</Text>,
    },
    {
      title: 'Dịch vụ thêm',
      dataIndex: 'extras',
      key: 'extras',
      render: (extras) => {
        if (!extras || extras.length === 0) return '-';
        return (
          <ul style={{ padding: '0 0 0 20px', margin: 0 }}>
            {extras.map(extra => (
              <li key={extra.extraId}>
                {extra.extraName} ({extra.extraPrice.toLocaleString()}đ)
              </li>
            ))}
          </ul>
        );
      }
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subTotal',
      key: 'subTotal',
      align: 'right',
      width: 150,
      render: (total) => <Text strong>{total.toLocaleString()}đ</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Cập nhật">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenUpdateModal(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Card 
      style={{ 
        margin: 24, 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
      }}
    >
      <Title level={3} style={{ marginBottom: 24, color: '#1f1f1f' }}>
        Danh sách khách hàng
      </Title>
      <Space style={{ marginBottom: 24 }} wrap>
        <Input
          placeholder="Tìm theo số điện thoại"
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 220, borderRadius: '6px' }}
          suffix={<SearchOutlined style={{ color: '#bfbfbf' }}/>}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
          style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
        >
          Tìm kiếm
        </Button>
        {searchPhone && (
          <Button 
            onClick={() => { setSearchPhone(''); setSearching(false); fetchUsers(); }}
            style={{ borderRadius: '6px' }}
          >
            Xóa tìm kiếm
          </Button>
        )}
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
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
          style={{ 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        />
      </Spin>

      {/* Create User Modal */}
      <Modal
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Tạo khách hàng mới</Title>}
        open={isModalVisible}
        width={800}
        onCancel={() => { setIsModalVisible(false); setAvatarFile(null); form.resetFields(); }}
        footer={null}
        destroyOnClose
        bodyStyle={{ padding: '24px' }}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          validateMessages={validateMessages}
        >
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}> 
                <Input style={{ borderRadius: '6px' }}/> 
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}> 
                <Input style={{ borderRadius: '6px' }}/> 
              </Form.Item>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}> 
                <Input.Password style={{ borderRadius: '6px' }}/> 
              </Form.Item>
              <Form.Item name="dob" label="Ngày sinh"> 
                <DatePicker 
                  style={{ width: '100%', borderRadius: '6px' }} 
                  format="DD-MM-YYYY"
                  placeholder="DD-MM-YYYY"
                  getPopupContainer={triggerNode => triggerNode.parentElement}
                  allowClear
                  inputReadOnly={false}
                  onChange={(date, dateString) => {
                    if (date) {
                      form.setFieldsValue({ dob: date });
                    }
                  }}
                /> 
              </Form.Item>
            </div>
            <div style={{ flex: 1 }}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}> 
                <Select placeholder="Chọn giới tính" style={{ borderRadius: '6px' }}> 
                  <Select.Option value="Male">Nam</Select.Option> 
                  <Select.Option value="Female">Nữ</Select.Option> 
                  <Select.Option value="Other">Khác</Select.Option> 
                </Select> 
              </Form.Item>
              <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}> 
                <Input style={{ borderRadius: '6px' }}/> 
              </Form.Item>
              <Form.Item name="rewardPoints" label="Điểm thưởng"> 
                <Input type="number" min={0} style={{ borderRadius: '6px' }}/> 
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
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px' }}
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
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              style={{ width: '100%', height: '40px', borderRadius: '6px' }}
            >
              Tạo mới
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Cart Modal */}
      <Modal
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Chi tiết giỏ hàng</Title>}
        open={isCartModalVisible}
        onCancel={() => setIsCartModalVisible(false)}
        footer={
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsCartModalVisible(false);
                  handleOpenAddToCartModal(currentUserId);
                }}
                style={{ 
                  borderRadius: '6px', 
                  flex: 1, 
                  height: '40px',
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Thêm sản phẩm vào giỏ hàng
              </Button>
              {cartData && cartData.items && cartData.items.length > 0 && (
                <Button 
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handlePlaceOrder}
                  loading={placeOrderLoading}
                  style={{ 
                    borderRadius: '6px', 
                    flex: 1,
                    height: '40px',
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a' 
                  }}
                >
                  Đặt hàng
                </Button>
              )}
            </div>
            <Button 
              onClick={() => setIsCartModalVisible(false)}
              style={{ 
                borderRadius: '6px',
                width: '100%'
              }}
            >
              Đóng
            </Button>
          </div>
        }
        width={1000}
        bodyStyle={{ padding: '24px' }}
        style={{ top: 20 }}
      >
        <Spin spinning={cartLoading}>
          {cartData && (
            <div className="cart-details">
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ 
                  background: '#f9f9f9', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  flex: '1',
                  minWidth: '400px'
                }}>
                  <Title level={5} style={{ marginTop: 0, marginBottom: '16px', color: '#1f1f1f' }}>Chi tiết giỏ hàng</Title>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 0', color: '#666', width: '40%', fontSize: '14px' }}>Mã đơn hàng</td>
                        <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>{cartData.orderId}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 0', color: '#666', fontSize: '14px' }}>Dịch vụ</td>
                        <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>{cartData.serviceName}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 0', color: '#666', fontSize: '14px' }}>Thời gian nhận hàng</td>
                        <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>{dayjs(cartData.pickupTime).format('DD/MM/YYYY HH:mm')}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 0', color: '#666', fontSize: '14px' }}>Thời gian giao hàng</td>
                        <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>{dayjs(cartData?.deliveryTime).format('DD/MM/YYYY HH:mm')}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '10px 0', color: '#666', fontSize: '14px' }}>Địa chỉ giao hàng</td>
                        <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>{cartData?.addressCartResponse?.detailAddress}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 0', color: '#666', fontSize: '14px' }}>Người nhận</td>
                        <td style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>{cartData?.addressCartResponse?.contactName} - {cartData?.addressCartResponse?.contactPhone}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div style={{ 
                  background: '#f9f9f9', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <Title level={5} style={{ marginTop: 0, marginBottom: '16px', color: '#1f1f1f' }}>Thông tin thanh toán</Title>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '14px' }}>Tổng tiền dịch vụ:</Text>
                      <Text strong style={{ fontSize: '14px' }}>{cartData.estimatedTotal.toLocaleString()}đ</Text>
                    </div>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '14px' }}>Phí vận chuyển:</Text>
                      <Text style={{ fontSize: '14px' }}>{cartData.shippingFee.toLocaleString()}đ</Text>
                    </div>
                    {cartData.applicableFee > 0 && (
                      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: '14px' }}>Phí áp dụng:</Text>
                        <Text style={{ fontSize: '14px' }}>{cartData.applicableFee.toLocaleString()}đ</Text>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Divider style={{ margin: '16px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '16px' }}>Tổng thanh toán:</Text>
                      <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>
                        {(cartData.estimatedTotal + cartData.shippingFee + (cartData.applicableFee || 0)).toLocaleString()}đ
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
              
              <Table
                dataSource={cartData.items}
                rowKey="orderItemId"
                pagination={false}
                style={{ 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                columns={cartItemColumns}
                summary={(pageData) => {
                  const total = pageData.reduce((acc, curr) => acc + curr.subTotal, 0);
                  return (
                    <Table.Summary.Row style={{ background: '#fafafa' }}>
                      <Table.Summary.Cell colSpan={5} align="right" style={{ padding: '16px' }}>
                        <Text strong>Tổng cộng</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" style={{ padding: '16px' }}>
                        <Text strong>{total.toLocaleString()}đ</Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </div>
          )}
          {(!cartData || (cartData.items && cartData.items.length === 0)) && (
            <Empty 
              description="Giỏ hàng trống" 
              style={{ 
                background: '#f9f9f9', 
                padding: '40px', 
                borderRadius: '12px', 
                marginTop: '20px' 
              }} 
            />
          )}
        </Spin>
      </Modal>

      {/* Add to Cart Modal */}
      <Modal
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Thêm sản phẩm vào giỏ hàng</Title>}
        open={isAddToCartModalVisible}
        onCancel={() => setIsAddToCartModalVisible(false)}
        footer={null}
        width={1000}
        bodyStyle={{ padding: '24px' }}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Spin spinning={addToCartLoading}>
          <Form
            form={addToCartForm}
            layout="vertical"
            onFinish={handleAddToCart}
            initialValues={{ quantity: 1 }}
          >
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <Form.Item
                  name="categoryId"
                  label="Danh mục dịch vụ"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                  <Select
                    placeholder="Chọn danh mục dịch vụ"
                    onChange={(value) => {
                      setSelectedCategory(value);
                      setSelectedService(null);
                      addToCartForm.setFieldsValue({ serviceId: undefined });
                    }}
                    optionLabelProp="label"
                    style={{ width: '100%', borderRadius: '6px' }}
                    dropdownStyle={{ borderRadius: '6px', padding: '4px' }}
                  >
                    {categories.map(category => (
                      <Option 
                        key={category.categoryId} 
                        value={category.categoryId}
                        label={category.name}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {category.icon && (
                            <img 
                              src={category.icon} 
                              alt={category.name}
                              style={{ 
                                width: '24px', 
                                height: '24px', 
                                marginRight: '8px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }} 
                            />
                          )}
                          <span>{category.name}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {categoryDetails && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Các dịch vụ:</Text>
                    <div style={{ 
                      height: '300px', 
                      overflowY: 'auto', 
                      border: '1px solid #f0f0f0', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      marginTop: '8px',
                      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.05)'
                    }}>
                      {categoryDetails.subCategories.map(subCategory => (
                        <div key={subCategory.subCategoryId} style={{ marginBottom: '16px' }}>
                          <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>{subCategory.name}</Text>
                          <List
                            dataSource={subCategory.serviceDetails}
                            renderItem={service => (
                              <List.Item 
                                style={{ 
                                  padding: '10px 12px', 
                                  cursor: 'pointer',
                                  background: selectedService?.serviceId === service.serviceId ? '#e6f7ff' : 'transparent',
                                  borderRadius: '6px',
                                  display: 'block',
                                  transition: 'all 0.3s ease',
                                  marginBottom: '4px',
                                  border: selectedService?.serviceId === service.serviceId ? '1px solid #91d5ff' : '1px solid transparent',
                                }}
                                onClick={() => handleServiceSelect(service)}
                                className="service-item-hover"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  {service.imageUrl && (
                                    <div style={{ marginRight: '12px', width: '36px', height: '36px', overflow: 'hidden', flexShrink: 0 }}>
                                      <img 
                                        src={service.imageUrl} 
                                        alt={service.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                                      />
                                    </div>
                                  )}
                                  <div style={{ flex: 1 }}>
                                    <Text>{service.name}</Text>
                                  </div>
                                  <div>
                                    <Text type="secondary">{service.price.toLocaleString()}đ</Text>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Form.Item
                  name="quantity"
                  label="Số lượng"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                >
                  <InputNumber min={1} style={{ width: '100%', borderRadius: '6px' }} />
                </Form.Item>
              </div>

              <div style={{ flex: 1 }}>
                <Text strong>Dịch vụ thêm (Extras):</Text>
                <div style={{ 
                  height: '400px', 
                  overflowY: 'auto', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '8px',
                  marginBottom: '16px',
                  boxShadow: 'inset 0 0 6px rgba(0,0,0,0.05)'
                }}>
                  {extraCategories.map(extraCategory => (
                    <div key={extraCategory.extraCategoryId} style={{ marginBottom: '16px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>{extraCategory.name}</Text>
                      <Row gutter={[16, 8]}>
                        {extraCategory.extras.map(extra => (
                          <Col span={24} key={extra.extraId}>
                            <Checkbox
                              onChange={(e) => handleExtraChange(extra.extraId, e.target.checked)}
                              checked={selectedExtras.includes(extra.extraId)}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', transition: 'all 0.3s ease' }}
                              className={selectedExtras.includes(extra.extraId) ? "extra-item-selected" : "extra-item-hover"}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                {extra.imageUrl && (
                                  <div style={{ marginRight: '12px', width: '36px', height: '36px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img 
                                      src={extra.imageUrl} 
                                      alt={extra.name} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                                    />
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: '20px' }}>
                                    <Text>{extra.name}</Text>
                                    <Text type="secondary">{extra.price.toLocaleString()}đ</Text>
                                  </div>
                                  {extra.description && (
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '12px' }}>{extra.description}</Text>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))}
                </div>

                <Form.Item name="serviceId" hidden>
                  <Input />
                </Form.Item>

                <div style={{ textAlign: 'right' }}>
                  <Space>
                    <Button 
                      onClick={() => setIsAddToCartModalVisible(false)}
                      style={{ borderRadius: '6px' }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      disabled={!selectedService}
                      loading={addToCartLoading}
                      style={{ borderRadius: '6px' }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  </Space>
                </div>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Update Cart Item Modal */}
      <Modal
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Cập nhật sản phẩm trong giỏ hàng</Title>}
        open={isUpdateCartModalVisible}
        onCancel={() => setIsUpdateCartModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: '24px' }}
        destroyOnClose
        style={{ top: 20 }}
      >
        <Spin spinning={updateCartLoading}>
          {selectedCartItem && (
            <Form
              form={updateCartForm}
              layout="vertical"
              onFinish={handleUpdateCartItem}
              initialValues={{ quantity: selectedCartItem.quantity }}
            >
              <div style={{ 
                background: '#f9f9f9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <Text strong style={{ width: '120px', fontSize: '14px' }}>Dịch vụ: </Text>
                  <Text style={{ fontSize: '14px' }}>{selectedCartItem.serviceName}</Text>
                </div>

                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <Text strong style={{ width: '120px', fontSize: '14px' }}>Đơn giá: </Text>
                  <Text style={{ fontSize: '14px' }}>{selectedCartItem.servicePrice?.toLocaleString()}đ</Text>
                </div>
              </div>

              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
              >
                <InputNumber min={1} style={{ width: '100%', borderRadius: '6px' }} />
              </Form.Item>

              <div style={{ marginBottom: '16px' }}>
                <Text strong>Dịch vụ thêm (Extras):</Text>
                <div style={{ 
                  height: '300px', 
                  overflowY: 'auto', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '8px',
                  marginBottom: '16px',
                  boxShadow: 'inset 0 0 6px rgba(0,0,0,0.05)'
                }}>
                  {availableExtras.map(extraCategory => (
                    <div key={extraCategory.extraCategoryId} style={{ marginBottom: '16px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>{extraCategory.name}</Text>
                      <Row gutter={[16, 8]}>
                        {extraCategory.extras.map(extra => (
                          <Col span={24} key={extra.extraId}>
                            <Checkbox
                              onChange={(e) => handleUpdateExtraChange(extra.extraId, e.target.checked)}
                              checked={updatedExtras.includes(extra.extraId)}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', transition: 'all 0.3s ease' }}
                              className={updatedExtras.includes(extra.extraId) ? "extra-item-selected" : "extra-item-hover"}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                {extra.imageUrl && (
                                  <div style={{ marginRight: '12px', width: '36px', height: '36px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img 
                                      src={extra.imageUrl} 
                                      alt={extra.name} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                                    />
                                  </div>
                                )}
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: '20px' }}>
                                    <Text>{extra.name}</Text>
                                    <Text type="secondary">{extra.price.toLocaleString()}đ</Text>
                                  </div>
                                  {extra.description && (
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '12px' }}>{extra.description}</Text>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button 
                    onClick={() => setIsUpdateCartModalVisible(false)}
                    style={{ borderRadius: '6px' }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={updateCartLoading}
                    style={{ borderRadius: '6px' }}
                  >
                    Cập nhật
                  </Button>
                </Space>
              </div>
            </Form>
          )}
        </Spin>
      </Modal>

      <style jsx global>{`
        .service-item-hover:hover {
          background-color: #f5f5f5;
        }
        .extra-item-hover:hover {
          background-color: #f5f5f5;
        }
        .extra-item-selected {
          background-color: #e6f7ff;
          border: 1px solid #91d5ff;
        }
      `}</style>
    </Card>
  );
}
