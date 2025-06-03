import React, { useEffect, useState } from 'react';
import { Table, Card, Spin, Empty, Typography, Tag, Descriptions, Space, Button, Tooltip, Collapse, InputNumber, Modal, Divider, Select, Image, Form, Row, Col, Checkbox, message } from 'antd';
import { getRequestParams, getRequest, postRequestParams, postRequest } from '@services/api';
import { EyeOutlined, ShoppingCartOutlined, UserOutlined, PhoneOutlined, HomeOutlined, ClockCircleOutlined, CarOutlined, PlusOutlined } from '@ant-design/icons';
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

  // New API functions for add to cart workflow
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

  const fetchServiceDetail = async (serviceId) => {
    setLoadingServiceDetail(true);
    try {
      const response = await getRequestParams(`/service-details/${serviceId}`, {});
      console.log("Service detail:", response.data);
      
      if (response.data) {
        setServiceDetail(response.data);
        setSelectedExtras([]);
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

  const resetAddToCartForm = () => {
    setSelectedCategory(null);
    setCategoryDetail(null);
    setSelectedSubCategory(null);
    setSelectedService(null);
    setServiceDetail(null);
    setSelectedExtras([]);
    setQuantity(1);
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
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.userInfo.userId.substring(0, 8)}...
          </Text>
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
      width: 120,
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
          <Tooltip title="Thêm vào giỏ hàng">
            <Button 
              type="link" 
              icon={<PlusOutlined />} 
              onClick={() => handleAddToCartForUser(record.userInfo.userId)}
              style={{ color: '#52c41a' }}
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
          scroll={{ x: 1300 }}
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
                  <Text strong>{cartDetail.addressCartResponse?.contactName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại" span={1}>
                  <Text strong>{cartDetail.addressCartResponse?.contactPhone}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nhãn địa chỉ" span={1}>
                  <Tag color="blue">{cartDetail.addressCartResponse?.addressLabel}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ chi tiết" span={1}>
                  {cartDetail.addressCartResponse?.detailAddress}
                </Descriptions.Item>
                {cartDetail.addressCartResponse?.description && (
                  <Descriptions.Item label="Mô tả" span={2}>
                    <Text italic>{cartDetail.addressCartResponse.description}</Text>
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

          {/* Chọn dịch vụ thêm */}
          {serviceDetail && getServiceExtras().length > 0 && (
            <Form.Item label="Dịch vụ thêm (tùy chọn)">
              <Spin spinning={loadingServiceDetail}>
                <Checkbox.Group 
                  value={selectedExtras}
                  onChange={handleExtraChange}
                  style={{ width: '100%' }}
                >
                  <Row gutter={[8, 8]}>
                    {getServiceExtras().map(extra => (
                      <Col span={24} key={extra.extraId}>
                        <Card size="small" style={{ marginBottom: '8px' }}>
                          <Checkbox value={extra.extraId}>
                            <Row gutter={[8, 0]} align="middle">
                              <Col>
                                <Image 
                                  src={extra.imageUrl} 
                                  width={40} 
                                  height={40} 
                                  preview={false}
                                  style={{ borderRadius: '4px', objectFit: 'cover' }}
                                />
                              </Col>
                              <Col flex={1}>
                                <div>
                                  <Text strong>{extra.name}</Text>
                                  <div>
                                    <Text style={{ color: '#f5222d' }}>
                                      +{formatCurrency(extra.price)}
                                    </Text>
                                  </div>
                                  {extra.description && (
                                    <div>
                                      <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {extra.description}
                                      </Text>
                                    </div>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </Checkbox>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Spin>
            </Form.Item>
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
