import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Avatar, Tag, Space, message, Spin, Tabs, Button, Modal } from 'antd';
import { UserOutlined, TruckOutlined, ShoppingCartOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getRequestParams, postRequest, postRequestParams } from '../../../services/api';
import moment from 'moment';

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
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.assignedAt).unix() - moment(b.assignedAt).unix(),
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
            Tài xế có sẵn ({drivers.length})
          </span>
        } key="1">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#f6ffed', 
              borderRadius: '6px', 
              border: '1px solid #b7eb8f',
            }}>
              <Space size="large">
                <span>📊 <strong>Thống kê:</strong></span>
                <span>🚫 Không có đơn: <strong>{drivers.filter(d => d.deliveryOrderCount === 0 && d.pickupOrderCount === 0).length}</strong></span>
                <span>📦 Có đơn nhận: <strong>{drivers.filter(d => d.pickupOrderCount > 0 && d.deliveryOrderCount === 0).length}</strong></span>
                <span>🚛 Có đơn giao: <strong>{drivers.filter(d => d.deliveryOrderCount > 0 && d.pickupOrderCount === 0).length}</strong></span>
                <span>⚡ Cả hai: <strong>{drivers.filter(d => d.deliveryOrderCount > 0 && d.pickupOrderCount > 0).length}</strong></span>
              </Space>
            </div>
          </div>
          
          <Spin spinning={loading}>
            <Table
              columns={driverColumns}
              dataSource={drivers}
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
    </Card>
  );
}
