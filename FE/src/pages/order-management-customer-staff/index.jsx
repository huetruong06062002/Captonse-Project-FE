import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, Empty, Typography, Tag, Descriptions, Space, Button, Tooltip, Collapse, InputNumber, Modal, Divider, Select, Image, Form, Row, Col, Checkbox, message } from 'antd';
import { getRequestParams, getRequest, postRequestParams, postRequest, putRequest } from '@services/api';
import { EyeOutlined, ShoppingCartOutlined, UserOutlined, PhoneOutlined, HomeOutlined, ClockCircleOutlined, CarOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import "./index.css";
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export default function ORDERMANAGEMENTCUSTOMERSTAFF() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // States for detail modal
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [cartDetail, setCartDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // States for add to cart modal
  const [isAddToCartModalVisible, setIsAddToCartModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDetail, setCategoryDetail] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetail, setServiceDetail] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCategoryDetail, setLoadingCategoryDetail] = useState(false);
  const [loadingServiceDetail, setLoadingServiceDetail] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Add state for selected user
  const [selectedUserId, setSelectedUserId] = useState(null);

  // States for update cart functionality
  const [isUpdateCartModalVisible, setIsUpdateCartModalVisible] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [updateCartData, setUpdateCartData] = useState(null);
  const [currentUserExtras, setCurrentUserExtras] = useState([]);

  // Add state to track pending extras selection for update modal
  const [pendingExtrasSelection, setPendingExtrasSelection] = useState(null);

  useEffect(() => {
    fetchCarts();
  }, [currentPage, pageSize]);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
      };
      const response = await getRequestParams('/customer-staff/all-cart', params);
      console.log("Cart data:", response.data);
      
      if (response.data) {
        setCarts(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      console.error("Error fetching carts:", error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartDetail = async (userId) => {
    setLoadingDetail(true);
    try {
      const response = await getRequest(`/customer-staff/cart?userId=${userId}`);
      console.log("Cart detail:", response.data);
      
      if (response.data) {
        setCartDetail(response.data);
        setIsDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching cart detail:", error);
      message.error("Không thể tải thông tin chi tiết giỏ hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  //  API functions for add to cart workflow
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getRequestParams('/categories', {});
      console.log("Categories:", response.data);
      
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh mục sản phẩm");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCategoryDetail = async (categoryId) => {
    setLoadingCategoryDetail(true);
    try {
      const response = await getRequestParams(`/categories/${categoryId}`, {});
      console.log("Category detail:", response.data);
      
      if (response.data) {
        setCategoryDetail(response.data);
        setSelectedSubCategory(null);
        setSelectedService(null);
        setServiceDetail(null);
        setSelectedExtras([]);
      }
    } catch (error) {
      console.error("Error fetching category detail:", error);
      message.error("Không thể tải chi tiết danh mục");
    } finally {
      setLoadingCategoryDetail(false);
    }
  };

  const fetchServiceDetail = async (serviceId, preserveExtras = false) => {
    setLoadingServiceDetail(true);
    try {
      const response = await getRequestParams(`/service-details/${serviceId}`, {});
      console.log("Service detail:", response.data);
      
      if (response.data) {
        setServiceDetail(response.data);
        if (!preserveExtras) {
          setSelectedExtras([]);
        }
      }
    } catch (error) {
      console.error("Error fetching service detail:", error);
      message.error("Không thể tải chi tiết dịch vụ");
    } finally {
      setLoadingServiceDetail(false);
    }
  };

  const addToCart = async (userId) => {
    if (!serviceDetail || !userId) {
      message.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    setAddingToCart(true);
    try {
      const payload = {
        serviceDetailId: serviceDetail.serviceId,
        quantity: quantity,
        extraIds: selectedExtras
      };
      
      console.log("Adding to cart payload:", payload);
      
      const response = await postRequest(`/customer-staff/add-to-cart/?userId=${userId}`, payload);
      console.log("Add to cart response:", response.data);
      
      message.success("Thêm vào giỏ hàng thành công!");
      setIsAddToCartModalVisible(false);
      resetAddToCartForm();
      fetchCarts(); // Refresh the cart list
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("Không thể thêm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  // Update cart function using putRequest
  const updateCart = async (userId, orderItemId) => {
    if (!orderItemId || !userId) {
      message.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    setUpdatingCart(true);
    try {
      const payload = {
        orderItemId: orderItemId,
        quantity: quantity,
        extraIds: selectedExtras
      };
      
      console.log("Updating cart payload:", payload);
      console.log("Selected extras:", selectedExtras);
      console.log("Current user extras:", currentUserExtras);
      console.log("Service extras available:", getServiceExtras().map(e => ({id: e.extraId, name: e.name, price: e.price})));
      
      // Debug price calculation
      const newlyAddedExtras = getServiceExtras().filter(extra => 
        selectedExtras.includes(extra.extraId) && 
        !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
      );
      const removedExtras = currentUserExtras.filter(userExtra => 
        !selectedExtras.includes(userExtra.extraId || userExtra.id)
      );
      
      console.log("Newly added extras:", newlyAddedExtras);
      console.log("Removed extras:", removedExtras);
      console.log("Current total extras price:", currentUserExtras.reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0));
      console.log("New total extras price:", getServiceExtras().filter(extra => selectedExtras.includes(extra.extraId)).reduce((sum, extra) => sum + extra.price, 0));
      
      const response = await putRequest(`/customer-staff/cart?userId=${userId}`, payload);
      console.log("Update cart response:", response.data);
      
      message.success("Cập nhật giỏ hàng thành công!");
      setIsUpdateCartModalVisible(false);
      resetUpdateCartForm();
      fetchCarts(); // Refresh the cart list
    } catch (error) {
      console.error("Error updating cart:", error);
      message.error("Không thể cập nhật giỏ hàng");
    } finally {
      setUpdatingCart(false);
    }
  };

  const resetAddToCartForm = () => {
    setSelectedCategory(null);
    setCategoryDetail(null);
    setSelectedSubCategory(null);
    setSelectedService(null);
    setServiceDetail(null);
    setSelectedExtras([]);
    setQuantity(1);
  };

  const resetUpdateCartForm = () => {
    setUpdateCartData(null);
    setSelectedExtras([]);
    setQuantity(1);
    setCurrentUserExtras([]);
    setPendingExtrasSelection(null);
  };

  const handleOpenAddToCartModal = () => {
    setIsAddToCartModalVisible(true);
    fetchCategories();
  };

  const handleCloseAddToCartModal = () => {
    setIsAddToCartModalVisible(false);
    resetAddToCartForm();
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchCategoryDetail(categoryId);
  };

  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setSelectedService(null);
    setServiceDetail(null);
  };

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    fetchServiceDetail(serviceId);
  };

  const handleExtraChange = (extraIds) => {
    setSelectedExtras(extraIds);
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() + " VND";
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const renderExtras = (extras) => {
    if (!extras || extras.length === 0) return <Text type="secondary">Không có dịch vụ thêm</Text>;
    
    return (
      <Space direction="vertical" size="small">
        {extras.map((extra, index) => (
          <Tag key={index} color="blue" style={{ margin: '2px 0' }}>
            {extra.extraName} - {formatCurrency(extra.extraPrice)}
          </Tag>
        ))}
      </Space>
    );
  };

  const renderItems = (items) => {
    return (
      <Collapse size="small" ghost>
        {items.map((item, index) => (
          <Panel 
            header={
              <Space>
                <Text strong>{item.serviceName}</Text>
                <Tag color="green">SL: {item.quantity}</Tag>
                <Tag color="orange">{formatCurrency(item.subTotal)}</Tag>
              </Space>
            } 
            key={index}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tên dịch vụ">
                <Text strong>{item.serviceName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Đơn giá">
                {formatCurrency(item.servicePrice)}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                <Tag color="cyan">{item.quantity}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ thêm">
                {renderExtras(item.extras)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  {formatCurrency(item.subTotal)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Panel>
        ))}
      </Collapse>
    );
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 150,
      render: (orderId) => (
        <Text strong style={{ color: '#1890ff' }}>
          {orderId}
        </Text>
      ),
      fixed: 'left',
    },
    {
      title: "Thông tin khách hàng",
      key: "userInfo",
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text strong>{record.userInfo.fullName}</Text>
          </Space>
          <Space>
            <PhoneOutlined style={{ color: '#52c41a' }} />
            <Text>{record.userInfo.phoneNumber}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Số lượng dịch vụ",
      key: "itemCount",
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
          <ShoppingCartOutlined /> {record.items.length}
        </Tag>
      ),
    },
    {
      title: "Chi tiết dịch vụ",
      key: "items",
      width: 400,
      render: (_, record) => renderItems(record.items),
    },
    {
      title: "Tổng tiền ước tính",
      dataIndex: "estimatedTotal",
      key: "estimatedTotal",
      width: 150,
      align: 'right',
      render: (total) => (
        <Text strong style={{ 
          fontSize: '16px', 
          color: '#f5222d',
          background: '#fff1f0',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #ffccc7'
        }}>
          {formatCurrency(total)}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
              loading={loadingDetail}
            />
          </Tooltip>
          <Tooltip title="Thêm sản phẩm vào giỏ hàng">
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={() => handleAddToCartForUser(record.userInfo.userId)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Cập nhật giỏ hàng">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEditCartItems(record)}
              style={{ color: '#1890ff' }}
              disabled={!record.items || record.items.length === 0}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    console.log("View detail for user:", record.userInfo.userId);
    fetchCartDetail(record.userInfo.userId);
  };

  const handleAddToCartForUser = (userId) => {
    console.log("Add to cart for user:", userId);
    setSelectedUserId(userId);
    handleOpenAddToCartModal();
  };

  const handleEditCartItems = (record) => {
    console.log("Edit cart items for user:", record.userInfo.userId);
    if (record.items && record.items.length > 0) {
      // For simplicity, edit the first item. You can modify this to show a selection if needed
      const firstItem = record.items[0];
      const itemWithUserId = {
        ...firstItem,
        userId: record.userInfo.userId,
        orderItemId: firstItem.orderItemId // Assuming serviceId is the orderItemId
      };
      handleOpenUpdateCartModal(itemWithUserId, record.userInfo.userId);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setCartDetail(null);
  };

  const getSubCategoryServices = () => {
    if (!categoryDetail || !selectedSubCategory) return [];
    
    const subCategory = categoryDetail.subCategories?.find(
      sub => sub.subCategoryId === selectedSubCategory
    );
    return subCategory?.serviceDetails || [];
  };

  const getServiceExtras = () => {
    if (!serviceDetail || !serviceDetail.extraCategories) return [];
    
    return serviceDetail.extraCategories.flatMap(category => 
      category.extras.map(extra => ({
        ...extra,
        categoryName: category.categoryName
      }))
    );
  };

  const handleOpenUpdateCartModal = async (cartItem, userId) => {
    console.log("Opening update modal with cart item:", cartItem);
    
    setUpdateCartData({ ...cartItem, userId });
    setQuantity(cartItem.quantity || 1);
    setIsUpdateCartModalVisible(true);
    
    // Store current user extras
    const userExtras = cartItem.extras || [];
    setCurrentUserExtras(userExtras);
    console.log("Current user extras:", userExtras);
    
    // Extract current extra IDs from cart item
    const currentExtraIds = cartItem.extras?.map(extra => {
      const id = extra.extraId || extra.id;
      console.log("Mapping extra:", extra, "to ID:", id);
      return id;
    }) || [];
    console.log("Current extra IDs before setting:", currentExtraIds);
    
    // Fetch service details to get all available extras, preserving current selection
    if (cartItem.serviceId) {
      // Set pending selection first
      setPendingExtrasSelection(currentExtraIds);
      await fetchServiceDetail(cartItem.serviceId, true);
      // useEffect will handle setting selectedExtras after serviceDetail is loaded
    } else {
      setSelectedExtras(currentExtraIds);
    }
  };

  const handleCloseUpdateCartModal = () => {
    setIsUpdateCartModalVisible(false);
    resetUpdateCartForm();
  };

  // Add useEffect to handle setting selected extras after service detail is loaded
  useEffect(() => {
    if (serviceDetail && pendingExtrasSelection && isUpdateCartModalVisible) {
      console.log("Setting selected extras from useEffect:", pendingExtrasSelection);
      setSelectedExtras(pendingExtrasSelection);
      setPendingExtrasSelection(null);
    }
  }, [serviceDetail, pendingExtrasSelection, isUpdateCartModalVisible]);

  return (
    <Card style={{ margin: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            <ShoppingCartOutlined /> Quản lý giỏ hàng khách hàng
          </Title>
          <Text type="secondary">
            Danh sách tất cả giỏ hàng của khách hàng trong hệ thống
          </Text>
        </div>
        {/* <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAddToCartModal}
          size="large"
        >
          Thêm sản phẩm
        </Button> */}
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={carts}
          rowKey="orderId"
          scroll={{ x: 1400 }}
          size="middle"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} giỏ hàng`,
            pageSizeOptions: ['10', '20', '50', '100'],
            style: {
              marginTop: '16px'
            }
          }}
          locale={{ 
            emptyText: (
              <Empty 
                description="Không có dữ liệu giỏ hàng" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
          style={{ 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Spin>

      {/* Modal Chi tiết giỏ hàng */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCartOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: '18px' }}>
              Chi tiết giỏ hàng - {cartDetail?.orderId}
            </Text>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleCloseDetailModal}
        width={900}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Đang tải thông tin chi tiết...</div>
          </div>
        ) : cartDetail ? (
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Thông tin địa chỉ */}
            <Card 
              title={
                <Space>
                  <HomeOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Thông tin địa chỉ</Text>
                </Space>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Tên liên hệ" span={1}>
                  <Text strong>{cartDetail.addressCartResponse?.contactName || 'Không có'} </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại" span={1}>
                  <Text strong>{cartDetail.addressCartResponse?.contactPhone || 'Không có'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nhãn địa chỉ" span={1}>
                  <Tag color="blue">{cartDetail.addressCartResponse?.addressLabel || 'Không có'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ chi tiết" span={1}>
                  <Text strong>{cartDetail.addressCartResponse?.detailAddress || 'Không có'}</Text>
                </Descriptions.Item>
                {cartDetail.addressCartResponse?.description && (
                  <Descriptions.Item label="Mô tả" span={2}>
                    <Text italic>{cartDetail.addressCartResponse.description || 'Không có'}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Thông tin thời gian */}
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                  <Text strong>Thông tin thời gian</Text>
                </Space>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Thời gian lấy hàng">
                  <Space>
                    <CarOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{formatDateTime(cartDetail.pickupTime)}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian giao hàng">
                  <Space>
                    <CarOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{formatDateTime(cartDetail.deliveryTime)}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian hoàn thành tối thiểu">
                  <Tag color="orange">{cartDetail.minCompleteTime} ngày</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tên dịch vụ chính">
                  <Text strong>{cartDetail.serviceName}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Chi tiết dịch vụ */}
            <Card 
              title={
                <Space>
                  <ShoppingCartOutlined style={{ color: '#722ed1' }} />
                  <Text strong>Chi tiết dịch vụ</Text>
                </Space>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              {cartDetail.items?.map((item, index) => (
                <div key={index} style={{ 
                  marginBottom: index < cartDetail.items.length - 1 ? '16px' : '0',
                  padding: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa'
                }}>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Tên dịch vụ" span={2}>
                      <Text strong style={{ fontSize: '16px' }}>{item.serviceName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đơn giá">
                      {formatCurrency(item.servicePrice)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng">
                      <Tag color="cyan" style={{ fontSize: '14px' }}>{item.quantity}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Dịch vụ thêm" span={2}>
                      {renderExtras(item.extras)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền" span={2}>
                      <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                        {formatCurrency(item.subTotal)}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ))}
            </Card>

            {/* Tổng kết thanh toán */}
            <Card 
              title={
                <Space>
                  <Text strong style={{ color: '#f5222d' }}>💰 Tổng kết thanh toán</Text>
                </Space>
              }
              size="small"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Tổng tiền dịch vụ">
                  <Text style={{ fontSize: '16px' }}>{formatCurrency(cartDetail.estimatedTotal)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phí vận chuyển">
                  <Text style={{ fontSize: '16px' }}>{formatCurrency(cartDetail.shippingFee)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phí phát sinh">
                  <Text style={{ fontSize: '16px' }}>{formatCurrency(cartDetail.applicableFee)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng cộng">
                  <Text strong style={{ 
                    fontSize: '18px', 
                    color: '#f5222d',
                    background: '#fff1f0',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ffccc7'
                  }}>
                    {formatCurrency((cartDetail.estimatedTotal || 0) + (cartDetail.shippingFee || 0) + (cartDetail.applicableFee || 0))}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        ) : null}
      </Modal>

      {/* Modal Thêm sản phẩm vào giỏ hàng */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ fontSize: '18px' }}>
              Thêm sản phẩm vào giỏ hàng
            </Text>
          </div>
        }
        open={isAddToCartModalVisible}
        onCancel={handleCloseAddToCartModal}
        width={1000}
        footer={[
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => addToCart(selectedUserId)}
            disabled={!serviceDetail || !selectedUserId}
            loading={addingToCart}
          >
            Thêm vào giỏ hàng
          </Button>
        ]}
      >
        <Form layout="vertical" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Chọn danh mục */}
          <Form.Item label="Chọn danh mục" required>
            <Spin spinning={loadingCategories}>
              <Select
                placeholder="Chọn danh mục sản phẩm"
                value={selectedCategory}
                onChange={handleCategoryChange}
                style={{ width: '100%' }}
              >
                {categories.map(category => (
                  <Option key={category.categoryId} value={category.categoryId}>
                    <Space>
                      <Image 
                        src={category.icon} 
                        width={20} 
                        height={20} 
                        preview={false}
                        style={{ borderRadius: '4px' }}
                        fallback="https://via.placeholder.com/20x20?text=Cat"
                      />
                      {category.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Spin>
          </Form.Item>

          {/* Chọn danh mục con */}
          {categoryDetail && (
            <Form.Item label="Chọn danh mục con" required>
              <Spin spinning={loadingCategoryDetail}>
                <Select
                  placeholder="Chọn danh mục con"
                  value={selectedSubCategory}
                  onChange={handleSubCategoryChange}
                  style={{ width: '100%' }}
                >
                  {categoryDetail.subCategories?.map(subCategory => (
                    <Option key={subCategory.subCategoryId} value={subCategory.subCategoryId}>
                      {subCategory.name}
                    </Option>
                  ))}
                </Select>
              </Spin>
            </Form.Item>
          )}

          {/* Chọn dịch vụ */}
          {selectedSubCategory && (
            <Form.Item label="Chọn dịch vụ" required>
              <Select
                placeholder="Chọn dịch vụ"
                value={selectedService}
                onChange={handleServiceChange}
                style={{ width: '100%' }}
                optionLabelProp="label"
              >
                {getSubCategoryServices().map(service => (
                  <Option 
                    key={service.serviceId} 
                    value={service.serviceId}
                    label={service.name}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Image 
                        src={service.imageUrl} 
                        width={30} 
                        height={30} 
                        preview={false}
                        style={{ borderRadius: '4px', objectFit: 'cover' }}
                        fallback="https://via.placeholder.com/30x30?text=Service"
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {formatCurrency(service.price)}
                        </div>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Chi tiết dịch vụ */}
          {serviceDetail && (
            <Card 
              title="Chi tiết dịch vụ"
              size="small"
              style={{ marginBottom: '16px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Image 
                    src={serviceDetail.imageUrl}
                    style={{ width: '100%', borderRadius: '8px' }}
                    preview={false}
                    fallback="https://via.placeholder.com/200x200?text=Service+Detail"
                  />
                </Col>
                <Col span={16}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên dịch vụ">
                      <Text strong style={{ fontSize: '16px' }}>{serviceDetail.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá cơ bản">
                      <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                        {formatCurrency(serviceDetail.price)}
                      </Text>
                    </Descriptions.Item>
                    {serviceDetail.description && (
                      <Descriptions.Item label="Mô tả">
                        <Text>{serviceDetail.description}</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          )}

          {/* Cập nhật dịch vụ thêm */}
          {serviceDetail && getServiceExtras().length > 0 && (
            <Card
              title={
                <Space>
                  <Text strong style={{ color: '#52c41a' }}>🔧 Dịch vụ thêm</Text>
                  <Tag color="green">{getServiceExtras().length} dịch vụ có sẵn</Tag>
                </Space>
              }
              size="small"
              style={{ marginBottom: '16px' }}
            >
              <div style={{ marginBottom: '12px' }}>
                <Text type="secondary">
                  Chọn các dịch vụ thêm mà bạn muốn cập nhật. Những dịch vụ đã chọn trước đó sẽ hiển thị với nền xanh.
                </Text>
              </div>
              
              <Checkbox.Group 
                value={selectedExtras}
                onChange={handleExtraChange}
                style={{ width: '100%' }}
              >
                <Row gutter={[8, 8]}>
                  {getServiceExtras().map(extra => {
                    const isCurrentlySelected = currentUserExtras.some(userExtra => 
                      (userExtra.extraId || userExtra.id) === extra.extraId
                    );
                    const isNewlySelected = selectedExtras.includes(extra.extraId) && !isCurrentlySelected;
                    const isBeingRemoved = !selectedExtras.includes(extra.extraId) && isCurrentlySelected;
                    
                    return (
                      <Col span={24} key={extra.extraId}>
                        <Card 
                          size="small" 
                          style={{ 
                            marginBottom: '8px',
                            backgroundColor: isCurrentlySelected ? '#f6ffed' : isNewlySelected ? '#e6f7ff' : isBeingRemoved ? '#fff1f0' : '#fff',
                            border: isCurrentlySelected ? '1px solid #52c41a' : isNewlySelected ? '1px solid #1890ff' : isBeingRemoved ? '1px solid #ff4d4f' : '1px solid #d9d9d9'
                          }}
                        >
                          <Checkbox value={extra.extraId}>
                            <Row gutter={[8, 0]} align="middle">
                              <Col>
                                <Image 
                                  src={extra.imageUrl || 'https://via.placeholder.com/50x50?text=Extra'}
                                  width={50} 
                                  height={50} 
                                  preview={false}
                                  style={{ borderRadius: '6px', objectFit: 'cover' }}
                                  fallback="https://via.placeholder.com/50x50?text=Extra"
                                />
                              </Col>
                              <Col flex={1}>
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  <div>
                                    <Space>
                                      <Text strong style={{ fontSize: '15px' }}>{extra.name}</Text>
                                      {isCurrentlySelected && (
                                        <Tag color="green" size="small">Đã chọn</Tag>
                                      )}
                                      {isNewlySelected && (
                                        <Tag color="blue" size="small">Mới thêm</Tag>
                                      )}
                                      {isBeingRemoved && (
                                        <Tag color="red" size="small">Sẽ xóa</Tag>
                                      )}
                                    </Space>
                                  </div>
                                  <div>
                                    <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                      +{formatCurrency(extra.price)}
                                    </Text>
                                  </div>
                                  {extra.description && (
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '13px' }}>
                                        {extra.description}
                                      </Text>
                                    </div>
                                  )}
                                </Space>
                              </Col>
                            </Row>
                          </Checkbox>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Checkbox.Group>
              <Spin spinning={loadingServiceDetail} />
              
              {/* Thống kê nhanh */}
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary">Đã chọn trước</Text>
                      <div><Text strong style={{ color: '#fa8c16' }}>{currentUserExtras.length}</Text></div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary">Đang chọn</Text>
                      <div><Text strong style={{ color: '#1890ff' }}>{selectedExtras.length}</Text></div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary">Thay đổi</Text>
                      <div>
                        <Text strong style={{ color: selectedExtras.length > currentUserExtras.length ? '#52c41a' : selectedExtras.length < currentUserExtras.length ? '#ff4d4f' : '#595959' }}>
                          {selectedExtras.length > currentUserExtras.length && '+'}
                          {selectedExtras.length - currentUserExtras.length}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          )}

          {/* Số lượng */}
          {serviceDetail && (
            <Form.Item label="Số lượng" required>
              <InputNumber
                min={1}
                max={999}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ width: '200px' }}
              />
            </Form.Item>
          )}

          {/* Tổng kết */}
          {serviceDetail && (
            <Card 
              title="Tổng kết"
              size="small"
              style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Giá dịch vụ cơ bản">
                  {formatCurrency(serviceDetail.price)}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  <Tag color="blue">{quantity}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Phí dịch vụ thêm">
                  {formatCurrency(
                    getServiceExtras()
                      .filter(extra => selectedExtras.includes(extra.extraId))
                      .reduce((sum, extra) => sum + extra.price, 0)
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng cộng">
                  <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                    {formatCurrency(
                      (serviceDetail.price + 
                       getServiceExtras()
                         .filter(extra => selectedExtras.includes(extra.extraId))
                         .reduce((sum, extra) => sum + extra.price, 0)
                      ) * quantity
                    )}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Form>
      </Modal>

      {/* Modal Cập nhật giỏ hàng */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EditOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: '18px' }}>
              Cập nhật giỏ hàng
            </Text>
          </div>
        }
        open={isUpdateCartModalVisible}
        onCancel={handleCloseUpdateCartModal}
        width={1400}
        style={{ top: 20 }}
        footer={[
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => updateCart(updateCartData?.userId, updateCartData?.orderItemId)}
            disabled={!updateCartData}
            loading={updatingCart}
            size="large"
          >
            Cập nhật giỏ hàng
          </Button>
        ]}
      >
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Row gutter={[24, 16]}>
            {/* Cột trái: Thông tin sản phẩm và số lượng */}
            <Col span={10}>
              {/* Thông tin sản phẩm hiện tại */}
              {updateCartData && (
                <Card 
                  title={
                    <Space>
                      <EditOutlined style={{ color: '#1890ff' }} />
                      <Text strong>Thông tin sản phẩm hiện tại</Text>
                    </Space>
                  }
                  size="small"
                  style={{ marginBottom: '16px', backgroundColor: '#f6ffed' }}
                >
                  <Row gutter={[16, 8]}>
                    <Col span={10}>
                      <Image 
                        src={updateCartData.imageUrl || updateCartData.serviceImageUrl || serviceDetail?.imageUrl || 'https://via.placeholder.com/150x150?text=No+Image'}
                        style={{ width: '100%', borderRadius: '8px', maxHeight: '120px', objectFit: 'cover' }}
                        preview={true}
                        fallback="https://via.placeholder.com/150x150?text=No+Image"
                      />
                    </Col>
                    <Col span={14}>
                      <Descriptions column={1} size="small" layout="horizontal" labelStyle={{ fontWeight: 'bold', width: '80px' }}>
                        <Descriptions.Item label="Tên">
                          <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                            {updateCartData.serviceName}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Giá">
                          <Text strong style={{ fontSize: '14px', color: '#f5222d' }}>
                            {formatCurrency(updateCartData.servicePrice)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="SL hiện tại">
                          <Tag color="blue">{updateCartData.quantity}</Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Cập nhật số lượng */}
              <Card 
                title={
                  <Space>
                    <Text strong style={{ color: '#722ed1' }}>📊 Cập nhật số lượng</Text>
                  </Space>
                }
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <Row gutter={[16, 8]} align="middle">
                  <Col span={12}>
                    <Form.Item label="Số lượng mới" required style={{ marginBottom: 0 }}>
                      <InputNumber
                        min={1}
                        max={999}
                        value={quantity}
                        onChange={(value) => setQuantity(value || 1)}
                        style={{ width: '100%' }}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: '8px', backgroundColor: '#f0f2ff', borderRadius: '6px' }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text type="secondary">Hiện tại: </Text>
                          <Tag color="blue">{updateCartData?.quantity || 0}</Tag>
                        </div>
                        <div>
                          <Text type="secondary">Thay đổi: </Text>
                          <Tag color={quantity > (updateCartData?.quantity || 0) ? 'green' : quantity < (updateCartData?.quantity || 0) ? 'red' : 'default'}>
                            {quantity > (updateCartData?.quantity || 0) && '+'}
                            {quantity - (updateCartData?.quantity || 0)}
                          </Tag>
                        </div>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Tổng kết cập nhật */}
              {updateCartData && (
                <Card 
                  title="💰 Tổng kết cập nhật"
                  size="small"
                  style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Giá sản phẩm">
                      {formatCurrency(updateCartData.servicePrice)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng mới">
                      <Tag color="blue">{quantity}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Dịch vụ thêm hiện tại">
                      {formatCurrency(
                        currentUserExtras.reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dịch vụ thêm mới">
                      <Text style={{ color: '#52c41a' }}>
                        +{formatCurrency(
                          getServiceExtras()
                            .filter(extra => 
                              selectedExtras.includes(extra.extraId) && 
                              !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                            )
                            .reduce((sum, extra) => sum + extra.price, 0)
                        )}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Dịch vụ thêm bị xóa">
                      <Text style={{ color: '#ff4d4f' }}>
                        -{formatCurrency(
                          currentUserExtras
                            .filter(userExtra => 
                              !selectedExtras.includes(userExtra.extraId || userExtra.id)
                            )
                            .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)
                        )}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng extras sau cập nhật">
                      {formatCurrency(
                        getServiceExtras()
                          .filter(extra => selectedExtras.includes(extra.extraId))
                          .reduce((sum, extra) => sum + extra.price, 0)
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng cộng mới">
                      <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                        {formatCurrency(
                          (updateCartData.servicePrice + 
                           getServiceExtras()
                             .filter(extra => selectedExtras.includes(extra.extraId))
                             .reduce((sum, extra) => sum + extra.price, 0)
                          ) * quantity
                        )}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="So sánh với hiện tại">
                      <Text strong style={{ 
                        fontSize: '16px', 
                        color: 
                          ((updateCartData.servicePrice + 
                            getServiceExtras()
                              .filter(extra => selectedExtras.includes(extra.extraId))
                              .reduce((sum, extra) => sum + extra.price, 0)
                           ) * quantity) > (updateCartData.subTotal || 0) ? '#52c41a' : 
                          ((updateCartData.servicePrice + 
                            getServiceExtras()
                              .filter(extra => selectedExtras.includes(extra.extraId))
                              .reduce((sum, extra) => sum + extra.price, 0)
                           ) * quantity) < (updateCartData.subTotal || 0) ? '#ff4d4f' : '#595959'
                      }}>
                        {(getServiceExtras()
                          .filter(extra => 
                            selectedExtras.includes(extra.extraId) && 
                            !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                          )
                          .reduce((sum, extra) => sum + extra.price, 0) -
                        currentUserExtras
                          .filter(userExtra => 
                            !selectedExtras.includes(userExtra.extraId || userExtra.id)
                          )
                          .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)) > 0 && '+'}
                        {formatCurrency(
                          ((updateCartData.servicePrice + 
                            getServiceExtras()
                              .filter(extra => selectedExtras.includes(extra.extraId))
                              .reduce((sum, extra) => sum + extra.price, 0)
                           ) * quantity) - (updateCartData.subTotal || 0)
                        )}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
            </Col>

            {/* Cột phải: Dịch vụ thêm */}
            <Col span={14}>
              {/* Loading indicator for service details */}
              {loadingServiceDetail && updateCartData && (
                <Card size="small" style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <Spin />
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">Đang tải thông tin dịch vụ thêm...</Text>
                  </div>
                </Card>
              )}

              {/* Cập nhật dịch vụ thêm */}
              {serviceDetail && getServiceExtras().length > 0 && (
                <Card
                  title={
                    <Space>
                      <Text strong style={{ color: '#52c41a' }}>🔧 Dịch vụ thêm</Text>
                      <Tag color="green">{getServiceExtras().length} dịch vụ có sẵn</Tag>
                    </Space>
                  }
                  size="small"
                  style={{ marginBottom: '16px' }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <Text type="secondary">
                      Chọn các dịch vụ thêm mà bạn muốn cập nhật. Những dịch vụ đã chọn trước đó sẽ hiển thị với nền xanh.
                    </Text>
                  </div>
                  
                  <Checkbox.Group 
                    value={selectedExtras}
                    onChange={handleExtraChange}
                    style={{ width: '100%' }}
                  >
                    <Row gutter={[8, 8]}>
                      {getServiceExtras().map(extra => {
                        const isCurrentlySelected = currentUserExtras.some(userExtra => 
                          (userExtra.extraId || userExtra.id) === extra.extraId
                        );
                        const isNewlySelected = selectedExtras.includes(extra.extraId) && !isCurrentlySelected;
                        const isBeingRemoved = !selectedExtras.includes(extra.extraId) && isCurrentlySelected;
                        
                        return (
                          <Col span={12} key={extra.extraId}>
                            <Card 
                              size="small" 
                              style={{ 
                                marginBottom: '8px',
                                backgroundColor: isCurrentlySelected ? '#f6ffed' : isNewlySelected ? '#e6f7ff' : isBeingRemoved ? '#fff1f0' : '#fff',
                                border: isCurrentlySelected ? '1px solid #52c41a' : isNewlySelected ? '1px solid #1890ff' : isBeingRemoved ? '1px solid #ff4d4f' : '1px solid #d9d9d9'
                              }}
                            >
                              <Checkbox value={extra.extraId}>
                                <Row gutter={[8, 0]} align="middle">
                                  <Col>
                                    <Image 
                                      src={extra.imageUrl || 'https://via.placeholder.com/40x40?text=Extra'}
                                      width={40} 
                                      height={40} 
                                      preview={false}
                                      style={{ borderRadius: '6px', objectFit: 'cover' }}
                                      fallback="https://via.placeholder.com/40x40?text=Extra"
                                    />
                                  </Col>
                                  <Col flex={1}>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                      <div>
                                        <Space>
                                          <Text strong style={{ fontSize: '13px' }}>{extra.name}</Text>
                                          {isCurrentlySelected && (
                                            <Tag color="green" size="small">Đã chọn</Tag>
                                          )}
                                          {isNewlySelected && (
                                            <Tag color="blue" size="small">Mới thêm</Tag>
                                          )}
                                          {isBeingRemoved && (
                                            <Tag color="red" size="small">Sẽ xóa</Tag>
                                          )}
                                        </Space>
                                      </div>
                                      <div>
                                        <Text strong style={{ color: '#f5222d', fontSize: '14px' }}>
                                          +{formatCurrency(extra.price)}
                                        </Text>
                                      </div>
                                      {extra.description && (
                                        <div>
                                          <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {extra.description.length > 50 ? extra.description.substring(0, 50) + '...' : extra.description}
                                          </Text>
                                        </div>
                                      )}
                                    </Space>
                                  </Col>
                                </Row>
                              </Checkbox>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </Checkbox.Group>
                  
                  {/* Thống kê nhanh */}
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary">Đã chọn trước</Text>
                          <div><Text strong style={{ color: '#fa8c16' }}>{currentUserExtras.length}</Text></div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary">Đang chọn</Text>
                          <div><Text strong style={{ color: '#1890ff' }}>{selectedExtras.length}</Text></div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary">Thay đổi</Text>
                          <div>
                            <Text strong style={{ color: selectedExtras.length > currentUserExtras.length ? '#52c41a' : selectedExtras.length < currentUserExtras.length ? '#ff4d4f' : '#595959' }}>
                              {selectedExtras.length > currentUserExtras.length && '+'}
                              {selectedExtras.length - currentUserExtras.length}
                            </Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              )}

              {/* Tóm tắt thay đổi */}
              {updateCartData && currentUserExtras.length > 0 && (
                <Card 
                  title="📋 Tóm tắt thay đổi dịch vụ thêm"
                  size="small"
                  style={{ backgroundColor: '#fff7e6', border: '1px solid #ffec99' }}
                >
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text strong style={{ color: '#fa8c16' }}>Hiện tại:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {currentUserExtras.map((extra, index) => (
                          <Tag key={index} color="orange" style={{ margin: '2px', fontSize: '11px' }}>
                            {extra.extraName || extra.name}
                          </Tag>
                        ))}
                        {currentUserExtras.length === 0 && (
                          <Text type="secondary">Không có</Text>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text strong style={{ color: '#1890ff' }}>Mới:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {getServiceExtras()
                          .filter(extra => selectedExtras.includes(extra.extraId))
                          .map((extra, index) => (
                            <Tag key={index} color="blue" style={{ margin: '2px', fontSize: '11px' }}>
                              {extra.name}
                            </Tag>
                          ))}
                        {selectedExtras.length === 0 && (
                          <Text type="secondary">Không có</Text>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Chi tiết thay đổi extras */}
              {updateCartData && (
                <Card 
                  title="🔄 Chi tiết thay đổi dịch vụ thêm"
                  size="small"
                  style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginTop: '16px' }}
                >
                  {/* Extras mới thêm */}
                  {getServiceExtras().filter(extra => 
                    selectedExtras.includes(extra.extraId) && 
                    !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                  ).length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong style={{ color: '#52c41a' }}>✅ Thêm mới:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {getServiceExtras()
                          .filter(extra => 
                            selectedExtras.includes(extra.extraId) && 
                            !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                          )
                          .map((extra, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '4px 8px',
                              backgroundColor: '#f6ffed',
                              border: '1px solid #b7eb8f',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}>
                              <Text style={{ fontSize: '12px' }}>{extra.name}</Text>
                              <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                                +{formatCurrency(extra.price)}
                              </Text>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Extras bị xóa */}
                  {currentUserExtras.filter(userExtra => 
                    !selectedExtras.includes(userExtra.extraId || userExtra.id)
                  ).length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong style={{ color: '#ff4d4f' }}>❌ Xóa bỏ:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {currentUserExtras
                          .filter(userExtra => 
                            !selectedExtras.includes(userExtra.extraId || userExtra.id)
                          )
                          .map((extra, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '4px 8px',
                              backgroundColor: '#fff1f0',
                              border: '1px solid #ffccc7',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}>
                              <Text style={{ fontSize: '12px' }}>{extra.extraName || extra.name}</Text>
                              <Text strong style={{ color: '#ff4d4f', fontSize: '12px' }}>
                                -{formatCurrency(extra.extraPrice || extra.price || 0)}
                              </Text>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Extras giữ nguyên */}
                  {currentUserExtras.filter(userExtra => 
                    selectedExtras.includes(userExtra.extraId || userExtra.id)
                  ).length > 0 && (
                    <div>
                      <Text strong style={{ color: '#595959' }}>🔄 Giữ nguyên:</Text>
                      <div style={{ marginTop: '4px' }}>
                        {currentUserExtras
                          .filter(userExtra => 
                            selectedExtras.includes(userExtra.extraId || userExtra.id)
                          )
                          .map((extra, index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '4px 8px',
                              backgroundColor: '#f5f5f5',
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              marginBottom: '4px'
                            }}>
                              <Text style={{ fontSize: '12px' }}>{extra.extraName || extra.name}</Text>
                              <Text style={{ color: '#595959', fontSize: '12px' }}>
                                {formatCurrency(extra.extraPrice || extra.price || 0)}
                              </Text>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Tổng kết thay đổi */}
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ 
                    padding: '8px',
                    backgroundColor: '#e6f7ff',
                    borderRadius: '6px',
                    border: '1px solid #91d5ff'
                  }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Thêm mới</Text>
                          <div>
                            <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>
                              +{formatCurrency(
                                getServiceExtras()
                                  .filter(extra => 
                                    selectedExtras.includes(extra.extraId) && 
                                    !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                                  )
                                  .reduce((sum, extra) => sum + extra.price, 0)
                              )}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Xóa bỏ</Text>
                          <div>
                            <Text strong style={{ color: '#ff4d4f', fontSize: '13px' }}>
                              -{formatCurrency(
                                currentUserExtras
                                  .filter(userExtra => 
                                    !selectedExtras.includes(userExtra.extraId || userExtra.id)
                                  )
                                  .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)
                              )}
                            </Text>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Chênh lệch</Text>
                          <div>
                            <Text strong style={{ 
                              color: 
                                (getServiceExtras()
                                  .filter(extra => 
                                    selectedExtras.includes(extra.extraId) && 
                                    !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                                  )
                                  .reduce((sum, extra) => sum + extra.price, 0) -
                                currentUserExtras
                                  .filter(userExtra => 
                                    !selectedExtras.includes(userExtra.extraId || userExtra.id)
                                  )
                                  .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)) > 0 ? '#52c41a' : 
                                (getServiceExtras()
                                  .filter(extra => 
                                    selectedExtras.includes(extra.extraId) && 
                                    !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                                  )
                                  .reduce((sum, extra) => sum + extra.price, 0) -
                                currentUserExtras
                                  .filter(userExtra => 
                                    !selectedExtras.includes(userExtra.extraId || userExtra.id)
                                  )
                                  .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)) < 0 ? '#ff4d4f' : '#595959',
                              fontSize: '13px'
                            }}>
                              {(getServiceExtras()
                                .filter(extra => 
                                  selectedExtras.includes(extra.extraId) && 
                                  !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                                )
                                .reduce((sum, extra) => sum + extra.price, 0) -
                              currentUserExtras
                                .filter(userExtra => 
                                  !selectedExtras.includes(userExtra.extraId || userExtra.id)
                                )
                                .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)) > 0 && '+'}
                              {formatCurrency(
                                getServiceExtras()
                                  .filter(extra => 
                                    selectedExtras.includes(extra.extraId) && 
                                    !currentUserExtras.some(userExtra => (userExtra.extraId || userExtra.id) === extra.extraId)
                                  )
                                  .reduce((sum, extra) => sum + extra.price, 0) -
                                currentUserExtras
                                  .filter(userExtra => 
                                    !selectedExtras.includes(userExtra.extraId || userExtra.id)
                                  )
                                  .reduce((sum, extra) => sum + (extra.extraPrice || extra.price || 0), 0)
                              )}
                            </Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        </div>
      </Modal>

      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-thead > tr > th {
          background-color: #e6f7ff;
          color: #1890ff;
          font-weight: 600;
        }
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
          padding: 8px 0;
        }
        .ant-descriptions-item-label {
          font-weight: 600;
          color: #595959;
        }
      `}</style>
    </Card>
  );
}
