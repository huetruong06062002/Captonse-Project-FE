import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Avatar, Tag, Space, message, Spin, Tabs, Button, Modal, DatePicker } from 'antd';
import { UserOutlined, TruckOutlined, ShoppingCartOutlined, FileTextOutlined, ExclamationCircleOutlined, DollarOutlined, CheckOutlined } from '@ant-design/icons';
import { getRequestParams, postRequest, postRequestParams } from '../../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

export default function ListOrderAssignment() {
  const [drivers, setDrivers] = useState([]);
  const [pickupOrders, setPickupOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [pickupPagination, setPickupPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [deliveryPagination, setDeliveryPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Cash orders modal states
  const [isCashOrdersModalVisible, setIsCashOrdersModalVisible] = useState(false);
  const [cashOrders, setCashOrders] = useState([]);
  const [cashOrdersLoading, setCashOrdersLoading] = useState(false);
  const [selectedDriverInfo, setSelectedDriverInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [markReturnLoading, setMarkReturnLoading] = useState(false);

  // Daily cash data states
  const [dailyCashData, setDailyCashData] = useState([]);
  const [cashDate, setCashDate] = useState(dayjs());
  const [cashDataLoading, setCashDataLoading] = useState(false);

  // Fetch available drivers
  const fetchAvailableDrivers = async () => {
    setLoading(true);
    try {
      const response = await getRequestParams('/users/drivers/available');
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      message.error('Không thể tải danh sách tài xế');
    } finally {
      setLoading(false);
    }
  };

  // Fetch daily cash data
  const fetchDailyCashData = async (date = null) => {
    setCashDataLoading(true);
    const searchDate = date ? date.format('YYYY-MM-DD') : cashDate?.format('YYYY-MM-DD');

    try {
      const response = await getRequestParams('/admin/driver-cash/daily', {
        date: searchDate
      });
      setDailyCashData(response.data || []);
    } catch (error) {
      console.error('Error fetching daily cash data:', error);
      message.error('Không thể tải dữ liệu thu tiền hàng ngày');
    } finally {
      setCashDataLoading(false);
    }
  };

  // Handle cash date change
  const handleCashDateChange = (date) => {
    setCashDate(date);
    fetchDailyCashData(date);
  };

  // Merge drivers data with cash data
  const mergedDriversData = drivers.map(driver => {
    const cashInfo = dailyCashData.find(cash => cash.driverId === driver.userId);
    return {
      ...driver,
      cashInfo: cashInfo || null
    };
  });

  // Fetch assigned pickup orders
  const fetchPickupOrders = async (params = {}) => {
    setPickupLoading(true);
    try {
      const response = await getRequestParams('/orders/assigned-pickup', {
        page: params.current || pickupPagination.current,
        pageSize: params.pageSize || pickupPagination.pageSize,
      });
      setPickupOrders(response.data.data || []);
      setPickupPagination({
        current: response.data.currentPage,
        pageSize: params.pageSize || pickupPagination.pageSize,
        total: response.data.totalRecords,
      });
    } catch (error) {
      console.error('Error fetching pickup orders:', error);
      message.error('Không thể tải danh sách đơn hàng nhận');
    } finally {
      setPickupLoading(false);
    }
  };

  // Fetch assigned delivery orders
  const fetchDeliveryOrders = async (params = {}) => {
    setDeliveryLoading(true);
    try {
      const response = await getRequestParams('/orders/assigned-delivery', {
        page: params.current || deliveryPagination.current,
        pageSize: params.pageSize || deliveryPagination.pageSize,
      });
      setDeliveryOrders(response.data.data || []);
      setDeliveryPagination({
        current: response.data.currentPage,
        pageSize: params.pageSize || deliveryPagination.pageSize,
        total: response.data.totalRecords,
      });
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      message.error('Không thể tải danh sách đơn hàng giao');
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Handle cancel assignment
  const handleCancelAssignment = async (assignmentId, orderId) => {
    confirm({
      title: 'Xác nhận hủy phân công',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn hủy phân công cho đơn hàng ${orderId}?`,
      okText: 'Hủy phân công',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await postRequest('/admin/cancel-assignment', {
            assignmentIds: [assignmentId]
          });
          message.success('Hủy phân công thành công!');
          // Refresh data
          fetchPickupOrders();
          fetchDeliveryOrders();
          fetchAvailableDrivers();
        } catch (error) {
          console.error('Error canceling assignment:', error);
          message.error(error.response.data.message);
        }
      },
    });
  };

  // Fetch driver cash orders
  const fetchDriverCashOrders = async (driverId, driverInfo, date = null) => {
    setCashOrdersLoading(true);
    if (driverInfo) {
      setSelectedDriverInfo(driverInfo);
    }
    const searchDate = date ? date?.format('YYYY-MM-DD') : selectedDate?.format('YYYY-MM-DD');

    try {
      const response = await getRequestParams('/admin/driver-cash/orders-by-day', {
        driverId: driverId,
        date: searchDate
      });
      setCashOrders(response.data || []);
      setSelectedRowKeys([]); // Reset selection
      if (driverInfo) {
        setIsCashOrdersModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching driver cash orders:', error);
      message.error('Không thể tải danh sách đơn thu tiền');
    } finally {
      setCashOrdersLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedDriverInfo) {
      fetchDriverCashOrders(selectedDriverInfo.userId, null, date);
    }
  };

  // Handle mark as returned
  const handleMarkAsReturned = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    setMarkReturnLoading(true);
    try {
      await postRequest('/admin/mark-returned', {
        orderIds: selectedRowKeys
      });
      message.success(`Đã đánh dấu ${selectedRowKeys.length} đơn hàng là đã nhận tiền`);
      // Refresh data
      fetchDriverCashOrders(selectedDriverInfo.userId, null, selectedDate);
    } catch (error) {
      console.error('Error marking orders as returned:', error);
      message.error('Không thể đánh dấu đơn hàng đã nhận tiền');
    } finally {
      setMarkReturnLoading(false);
    }
  };

  // Determine work status based on order counts
  const getWorkStatus = (deliveryCount, pickupCount) => {
    if (deliveryCount === 0 && pickupCount === 0) {
      return { text: 'Không có đơn', color: 'default' };
    } else if (pickupCount > 0 && deliveryCount === 0) {
      return { text: 'Có đơn nhận', color: 'blue' };
    } else if (deliveryCount > 0 && pickupCount === 0) {
      return { text: 'Có đơn giao', color: 'green' };
    } else {
      return { text: 'Có đơn nhận và giao', color: 'orange' };
    }
  };

  // Driver table columns
  const driverColumns = [
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
      title: 'Tên tài xế',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text) => <span style={{ fontWeight: '500' }}>{text}</span>,
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => (
        <Space>
          <span>{phone}</span>
        </Space>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender === 'Male' ? 'Nam' : 'Nữ',
      filters: [
        { text: 'Nam', value: 'Male' },
        { text: 'Nữ', value: 'Female' },
      ],
      onFilter: (value, record) => record.gender === value,
    },
    {
      title: 'Số đơn giao',
      dataIndex: 'deliveryOrderCount',
      key: 'deliveryOrderCount',
      render: (count) => (
        <Tag color={count > 0 ? 'green' : 'default'} icon={<TruckOutlined />}>
          {count}
        </Tag>
      ),
      sorter: (a, b) => a.deliveryOrderCount - b.deliveryOrderCount,
    },
    {
      title: 'Số đơn nhận',
      dataIndex: 'pickupOrderCount',
      key: 'pickupOrderCount',
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'} icon={<ShoppingCartOutlined />}>
          {count}
        </Tag>
      ),
      sorter: (a, b) => a.pickupOrderCount - b.pickupOrderCount,
    },
    {
      title: 'Trạng thái công việc',
      key: 'workStatus',
      render: (_, record) => {
        const status = getWorkStatus(record.deliveryOrderCount, record.pickupOrderCount);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
      filters: [
        { text: 'Không có đơn', value: 'none' },
        { text: 'Có đơn nhận', value: 'pickup' },
        { text: 'Có đơn giao', value: 'delivery' },
        { text: 'Có đơn nhận và giao', value: 'both' },
      ],
      onFilter: (value, record) => {
        const deliveryCount = record.deliveryOrderCount;
        const pickupCount = record.pickupOrderCount;

        switch (value) {
          case 'none':
            return deliveryCount === 0 && pickupCount === 0;
          case 'pickup':
            return pickupCount > 0 && deliveryCount === 0;
          case 'delivery':
            return deliveryCount > 0 && pickupCount === 0;
          case 'both':
            return deliveryCount > 0 && pickupCount > 0;
          default:
            return false;
        }
      },
    },
    {
      title: 'Thu tiền mặt',
      key: 'cashInfo',
      width: 180,
      render: (_, record) => {
        const cashInfo = record.cashInfo;
        if (!cashInfo) {
          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#999', fontSize: '12px' }}>Không có dữ liệu</div>
              <Button
                type="link"
                icon={<DollarOutlined />}
                size="small"
                onClick={() => fetchDriverCashOrders(record.userId, record)}
                loading={cashOrdersLoading && selectedDriverInfo?.userId === record.userId}
              >
                Xem chi tiết
              </Button>
            </div>
          );
        }

        return (
          <div style={{ fontSize: '12px' }}>
            <div style={{ marginBottom: '4px' }}>
              <Space size="small">
                <span>Tổng đơn tiền mặt</span>
                <Tag color="blue" size="small">{cashInfo.cashOrdersCount}</Tag>
              </Space>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <Space size="small">
                <span>Đơn đã giao tiền:</span>
                <Tag color="blue" size="small">{cashInfo.returnedOrdersCount}</Tag>
              </Space>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <Space size="small">
                <span>Tổng tiền mặt thu</span>
                <Tag color="green" size="small">
                  {(cashInfo.totalCollectedAmount / 1000).toFixed(0)}K
                </Tag>
              </Space>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Space size="small">
                <span>Tổng tiền mặt đã giao</span>
                <Tag color="orange" size="small">
                  {(cashInfo.totalReturnedAmount / 1000).toFixed(0)}K
                </Tag>

              </Space>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Space size="small">
                <span>Tổng tiền mặt chưa giao</span>
                <Tag color="red" size="small">
                  {(cashInfo.totalUnreturnedAmount / 1000).toFixed(0)}K
                </Tag>
              </Space>
            </div>
            <Button
              type="link"
              icon={<DollarOutlined />}
              size="small"
              onClick={() => fetchDriverCashOrders(record.userId, record)}
              loading={cashOrdersLoading && selectedDriverInfo?.userId === record.userId}
              style={{ padding: '0', height: 'auto' }}
            >
              Xem chi tiết
            </Button>
          </div>
        );
      },
    },
  ];

  // Order table columns (for both pickup and delivery)
  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (orderId) => <Tag color="blue">{orderId}</Tag>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: '500' }}>{record.customerFullname}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>{record.customerPhone}</span>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <span style={{ fontSize: '12px' }}>{address}</span>
      ),
      width: 250,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => (
        <Tag color="green">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(price)}
        </Tag>
      ),
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: 'Tài xế',
      key: 'driver',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: '500' }}>{record.driverFullname}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>{record.driverPhone}</span>
        </Space>
      ),
    },
    {
      title: 'Thời gian phân công',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.assignedAt).unix() - dayjs(b.assignedAt).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      render: (currentStatus) => {
        const statusMapping = {
          'SCHEDULED_PICKUP': { text: 'Được phân công nhận', color: 'blue' },
          'PICKINGUP': { text: 'Đã đi nhận hàng', color: 'processing' },
          'PICKEDUP': { text: 'Đã nhận hàng', color: 'success' },
          'SCHEDULED_DELIVERY': { text: 'Được phân công giao', color: 'orange' },
          'DELIVERING': { text: 'Đã đi giao hàng', color: 'geekblue' },
          'DELIVERED': { text: 'Đã giao hàng', color: 'purple' },
          'COMPLETED': { text: 'Đã hoàn thành', color: 'green' }
        };

        const statusInfo = statusMapping[currentStatus] || { text: currentStatus, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          danger
          size="small"
          onClick={() => handleCancelAssignment(record.assignmentId, record.orderId)}
        >
          Hủy giao
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchAvailableDrivers();
    fetchPickupOrders();
    fetchDeliveryOrders();
    fetchDailyCashData();
  }, []);

  return (
    <Card style={{ margin: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff', marginBottom: '16px' }}>
          <TruckOutlined />Danh sách phân công đơn hàng
        </Title>
      </div>

      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab={
          <span>
            <UserOutlined />
            Thông tin tài xế có sẵn ({drivers.length})
          </span>
        } key="1">
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#f6ffed',
              borderRadius: '6px',
              border: '1px solid #b7eb8f',
              marginBottom: '8px'
            }}>
              <Space size="large">
                <span>📊 <strong>Thống kê công việc:</strong></span>
                <span>🚫 Không có đơn: <strong>{mergedDriversData.filter(d => d.deliveryOrderCount === 0 && d.pickupOrderCount === 0).length}</strong></span>
                <span>📦 Có đơn nhận: <strong>{mergedDriversData.filter(d => d.pickupOrderCount > 0 && d.deliveryOrderCount === 0).length}</strong></span>
                <span>🚛 Có đơn giao: <strong>{mergedDriversData.filter(d => d.deliveryOrderCount > 0 && d.pickupOrderCount === 0).length}</strong></span>
                <span>⚡ Cả hai: <strong>{mergedDriversData.filter(d => d.deliveryOrderCount > 0 && d.pickupOrderCount > 0).length}</strong></span>
              </Space>
            </div>

            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fff7e6',
              borderRadius: '6px',
              border: '1px solid #ffd591',
            }}>
              <Space size="large">
                <span>💰 <strong>Thống kê thu tiền ({cashDate?.format('DD/MM/YYYY')}):</strong></span>
                <span>📄 Tổng đơn tiền mặt: <strong>{dailyCashData.reduce((sum, d) => sum + (d.cashOrdersCount || 0), 0)}</strong></span>
                <span>💵 Tổng tiền thu: <strong>{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(dailyCashData.reduce((sum, d) => sum + (d.totalCollectedAmount || 0), 0))}</strong></span>
                <span>✅ Đã nộp: <strong>{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(dailyCashData.reduce((sum, d) => sum + (d.totalReturnedAmount || 0), 0))}</strong></span>
                <span>❌ Chưa nộp: <strong>{new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(dailyCashData.reduce((sum, d) => sum + (d.totalUnreturnedAmount || 0), 0))}</strong></span>
              </Space>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Space size="large" align="center">
              <span><strong>Ngày thu tiền:</strong></span>
              <DatePicker
                value={cashDate}
                onChange={handleCashDateChange}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
              <Button
                type="primary"
                onClick={() => fetchDailyCashData()}
                loading={cashDataLoading}
                icon={<DollarOutlined />}
              >
                Cập nhật dữ liệu thu tiền
              </Button>
            </Space>
          </div>

          <Spin spinning={loading || cashDataLoading}>
            <Table
              columns={driverColumns}
              dataSource={mergedDriversData}
              rowKey="userId"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} tài xế`,
              }}
              bordered
              size="middle"
              locale={{
                emptyText: 'Không có tài xế nào có sẵn'
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={
          <span>
            <ShoppingCartOutlined />
            Đơn hàng được phân công đi nhận ({pickupOrders.length})
          </span>
        } key="2">
          <Spin spinning={pickupLoading}>
            <Table
              columns={orderColumns}
              dataSource={pickupOrders}
              rowKey="assignmentId"
              pagination={{
                current: pickupPagination.current,
                pageSize: pickupPagination.pageSize,
                total: pickupPagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn hàng`,
                onChange: (page, pageSize) => {
                  fetchPickupOrders({ current: page, pageSize });
                },
              }}
              bordered
              size="middle"
              locale={{
                emptyText: 'Không có đơn hàng nào được phân công nhận'
              }}
            />
          </Spin>
        </TabPane>

        <TabPane tab={
          <span>
            <TruckOutlined />
            Đơn hàng được phân công đi giao ({deliveryOrders.length})
          </span>
        } key="3">
          <Spin spinning={deliveryLoading}>
            <Table
              columns={orderColumns}
              dataSource={deliveryOrders}
              rowKey="assignmentId"
              pagination={{
                current: deliveryPagination.current,
                pageSize: deliveryPagination.pageSize,
                total: deliveryPagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn hàng`,
                onChange: (page, pageSize) => {
                  fetchDeliveryOrders({ current: page, pageSize });
                },
              }}
              bordered
              size="middle"
              locale={{
                emptyText: 'Không có đơn hàng nào được phân công giao'
              }}
            />
          </Spin>
        </TabPane>
      </Tabs>

      {/* Cash Orders Modal */}
      <Modal
        title={
          <Space>
            <DollarOutlined />
            <span>Danh sách đơn thu tiền - {selectedDriverInfo?.fullname}</span>
          </Space>
        }
        open={isCashOrdersModalVisible}
        onCancel={() => {
          setIsCashOrdersModalVisible(false);
          setSelectedRowKeys([]);
        }}
        width={1200}
        footer={[
          <Button
            key="mark-returned"
            type="primary"
            icon={<CheckOutlined />}
            loading={markReturnLoading}
            onClick={handleMarkAsReturned}
            disabled={selectedRowKeys.length === 0}
          >
            Đánh dấu đã nhận tiền ({selectedRowKeys.length})
          </Button>
        ]}
      >
        <Spin spinning={cashOrdersLoading}>
          <div style={{ marginBottom: '16px' }}>
            <Space size="large" align="center">
              <span><strong>Chọn ngày:</strong></span>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </Space>
          </div>

          {cashOrders.length > 0 ? (
            <>
              <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px' }}>
                <Space size="large">
                  <span><strong>Tổng số đơn:</strong> {cashOrders.length}</span>
                  <span><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(cashOrders.reduce((sum, order) => sum + order.amount, 0))}</span>
                  <span><strong>Đã nhận:</strong> {cashOrders.filter(order => order.isReturnedToAdmin).length}</span>
                  <span><strong>Chưa nhận:</strong> {cashOrders.filter(order => !order.isReturnedToAdmin).length}</span>
                </Space>
              </div>

              <Table
                dataSource={cashOrders}
                rowKey="orderId"
                rowSelection={{
                  type: 'checkbox',
                  selectedRowKeys,
                  onChange: (selectedKeys) => {
                    setSelectedRowKeys(selectedKeys);
                  },
                  getCheckboxProps: (record) => ({
                    disabled: record.isReturnedToAdmin, // Disable checkbox for already returned orders
                  }),
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn`
                }}
                size="middle"
                columns={[
                  {
                    title: 'Mã đơn hàng',
                    dataIndex: 'orderId',
                    key: 'orderId',
                    render: (orderId) => <Tag color="blue">{orderId}</Tag>,
                    width: 140,
                  },
                  {
                    title: 'Tổng tiền',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount) => (
                      <Tag color="green">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(amount)}
                      </Tag>
                    ),
                    sorter: (a, b) => a.amount - b.amount,
                    width: 120,
                  },
                  {
                    title: 'Ngày giao việc',
                    dataIndex: 'assignedAt',
                    key: 'assignedAt',
                    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                    sorter: (a, b) => dayjs(a.assignedAt).unix() - dayjs(b.assignedAt).unix(),
                    width: 150,
                  },
                  {
                    title: 'Ngày nhận tiền',
                    dataIndex: 'paymentDate',
                    key: 'paymentDate',
                    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                    sorter: (a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
                    width: 150,
                  },
                  {
                    title: 'Ngày giao tiền',
                    dataIndex: 'updatedAt',
                    key: 'updatedAt',
                    render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
                    width: 150,
                  },
                  {
                    title: 'Trạng thái',
                    key: 'returnStatus',
                    render: (_, record) => (
                      <Tag color={record.isReturnedToAdmin ? 'green' : 'orange'}>
                        {record.isReturnedToAdmin ? 'Đã nhận' : 'Chưa nhận'}
                      </Tag>
                    ),
                    filters: [
                      { text: 'Đã nhận', value: true },
                      { text: 'Chưa nhận', value: false },
                    ],
                    onFilter: (value, record) => record.isReturnedToAdmin === value,
                    width: 100,
                  },
                ]}
              />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <DollarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Không có đơn thu tiền nào trong ngày {selectedDate?.format('DD/MM/YYYY')}</div>
            </div>
          )}
        </Spin>
      </Modal>
    </Card>
  );
}
