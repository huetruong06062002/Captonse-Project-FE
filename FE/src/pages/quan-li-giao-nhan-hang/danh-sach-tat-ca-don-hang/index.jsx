import { Table, Tag, Input, Button, Space, Tooltip, message, Modal, Descriptions, Typography, Timeline, Image, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { getRequest, getRequestParams, deleteRequest } from "@services/api";
import { SearchOutlined, ReloadOutlined, EyeOutlined, FilterFilled, EnvironmentOutlined, HistoryOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { axiosClientVer2 } from '../../../config/axiosInterceptor';


const { Search } = Input;
const { Text } = Typography;

function ListAllOrders() {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [orderHistory, setOrderHistory] = useState(null);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryPhotos, setSelectedHistoryPhotos] = useState([]);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAllOrder();
  }, [currentPage, pageSize]);

  const fetchAllOrder = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
      };
      const response = await getRequestParams("orders/all-orders", params);
      console.log("check response: ", response);

      if (response && response.data) {
        setOrders(response.data.data);
        setTotalRecords(response.data.totalRecords);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      SCHEDULED_PICKUP: "#1890ff",
      CANCELLED: "#ff4d4f",
      PENDING: "#faad14",
      WASHING: "#13c2c2",
      PICKEDUP: "#52c41a",
      WASHED: "#722ed1",
      DELIVERYFAILED: "#eb2f96"
    };
    return statusColors[status] || "#000000";
  };

  const getStatusStyle = (status) => {
    return {
      color: getStatusColor(status),
      backgroundColor: getStatusColor(status) + '10',
      borderColor: getStatusColor(status),
      fontWeight: 500,
      textTransform: 'uppercase',
      fontSize: '0.85rem',
      padding: '4px 12px',
      borderRadius: '6px'
    };
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={'Tìm kiếm ' + dataIndex}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
    filteredValue: filteredInfo[dataIndex] || null,
  });

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  const fetchOrderDetail = async (orderId) => {
    setIsLoadingDetail(true);
    try {
      const response = await getRequest(`orders/${orderId}`);
      if (response && response.data) {
        setSelectedOrder(response.data);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      message.error("Không thể tải thông tin đơn hàng");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetail = (orderId) => {
    fetchOrderDetail(orderId);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() + " VND";
  };

  const fetchOrderHistory = async (orderId) => {
    setIsLoadingHistory(true);
    try {
      const response = await getRequest(`orders/history/${orderId}`);
      if (response && response.data) {
        setOrderHistory(response.data);
        setIsHistoryModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      message.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = (orderId) => {
    fetchOrderHistory(orderId);
  };

  const getTimelineItemColor = (status) => {
    const statusColors = {
      PENDING: '#faad14',
      CONFIRMED: '#52c41a',
      SCHEDULED_PICKUP: '#1890ff',
      PICKINGUP: '#722ed1',
      PICKEDUP: '#13c2c2',
      PICKUP_SUCCESS: '#52c41a',
      CHECKING: '#fa8c16',
      CHECKED: '#52c41a',
      WASHING: '#1890ff',
      CANCELLED: '#ff4d4f',
      WASHED: '#722ed1',
      DELIVERYFAILED: '#ff4d4f'
    };
    return statusColors[status] || '#000000';
  };

  const fetchHistoryPhotos = async (statusHistoryId) => {
    setLoadingPhotos(true);
    try {
      const response = await getRequest(`photos?statusHistoryId=${statusHistoryId}`);
      if (response && response.data) {
        setSelectedHistoryPhotos(response.data);
        setIsPhotoModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      message.error("Không thể tải hình ảnh");
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn hàng để xóa');
      return;
    }
    
    setIsDeleteModalVisible(true);
  };

  const confirmBatchDelete = async () => {
    setIsDeleting(true);
    try {
      const payload = {
        orderIds: selectedRowKeys
      };
      
      const response = await axiosClientVer2.delete('/admin/orders/batch', {
        data: payload
      });
      
      if (response && response.status === 200) {
        message.success(`Đã xóa thành công ${selectedRowKeys.length} đơn hàng`);
        setSelectedRowKeys([]);
        fetchAllOrder();
      } else {
        throw new Error('Xóa đơn hàng không thành công');
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      message.error("Xóa đơn hàng không thành công: " + (error.message || "Lỗi không xác định"));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
    }
  };

  const cancelBatchDelete = () => {
    setIsDeleteModalVisible(false);
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      ...getColumnSearchProps('orderId'),
      sorter: (a, b) => a.orderId.localeCompare(b.orderId),
      sortOrder: sortedInfo.columnKey === 'orderId' && sortedInfo.order,
      render: (text) => (
        <Tooltip title="Nhấn để xem chi tiết">
          <span 
            style={{ fontWeight: 500, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleViewDetail(text)}
          >
            {text}
          </span>
        </Tooltip>
      ),
      fixed: 'left',
      width: 150,
    },
    {
      title: "Tên đơn hàng",
      dataIndex: "orderName",
      key: "orderName",
      ...getColumnSearchProps('orderName'),
      sorter: (a, b) => a.orderName.localeCompare(b.orderName),
      sortOrder: sortedInfo.columnKey === 'orderName' && sortedInfo.order,
      render: (text) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      ),
      width: 150,
    },
    {
      title: "Số lượng dịch vụ",
      dataIndex: "serviceCount",
      key: "serviceCount",
      sorter: (a, b) => a.serviceCount - b.serviceCount,
      sortOrder: sortedInfo.columnKey === 'serviceCount' && sortedInfo.order,
      align: 'center',
      width: 150,
      render: (count) => (
        <span style={{ 
          backgroundColor: '#f6ffed', 
          color: '#52c41a',
          padding: '4px 12px',
          borderRadius: '12px',
          fontWeight: 500
        }}>
          {count}
        </span>
      ),
    },
    {
      title: "Tổng giá",
      dataIndex: "totalPrice",
      key: "totalPrice",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
      sortOrder: sortedInfo.columnKey === 'totalPrice' && sortedInfo.order,
      align: 'right',
      width: 150,
      render: (price) => (
        <span style={{ 
          fontWeight: 600,
          color: '#d4380d'
        }}>
          {price?.toLocaleString()} VND
        </span>
      ),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderedDate",
      key: "orderedDate",
      sorter: (a, b) => new Date(a.orderedDate) - new Date(b.orderedDate),
      sortOrder: sortedInfo.columnKey === 'orderedDate' && sortedInfo.order,
      width: 180,
      render: (date) => (
        <span style={{ 
          color: '#8c8c8c',
          fontSize: '0.9rem'
        }}>
          {new Date(date).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: 'center',
      width: 150,
      filters: [
        { text: 'Đang giặt', value: 'WASHING' },
        { text: 'Đã lên lịch', value: 'SCHEDULED_PICKUP' },
        { text: 'Đã hủy', value: 'CANCELLED' },
        { text: 'Đã nhận', value: 'PICKEDUP' },
        { text: 'Đã giặt', value: 'WASHED' },
        { text: 'Giao thất bại', value: 'DELIVERYFAILED' },
      ],
      filteredValue: filteredInfo.orderStatus || null,
      onFilter: (value, record) => record.orderStatus === value,
      render: (status) => (
        <Tag style={getStatusStyle(status)}>
          {status}
        </Tag>
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
              onClick={() => handleViewDetail(record.orderId)}
            />
          </Tooltip>
          <Tooltip title="Xem lịch sử">
            <Button 
              type="link" 
              icon={<HistoryOutlined />} 
              onClick={() => handleViewHistory(record.orderId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Space>
            <Button onClick={clearFilters}>Xóa lọc</Button>
            <Button onClick={clearAll}>Xóa lọc và sắp xếp</Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                loading={isDeleting}
              >
                Xóa {selectedRowKeys.length} đơn hàng đã chọn
              </Button>
            )}
          </Space>
          <Space>
            <Search
              placeholder="Tìm kiếm đơn hàng..."
              allowClear
              enterButton={
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: '40px'
                  }}
                >
                  Tìm kiếm
                </Button>
              }
              size="large"
              onSearch={(value) => console.log("Search:", value)}
              style={{ 
                width: 400,
              }}
            />
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={fetchAllOrder}
              size="large"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                backgroundColor: '#f6ffed',
                borderColor: '#52c41a',
                color: '#52c41a',
                fontWeight: 500
              }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey={(record) => record.orderId}
          loading={loading}
          onChange={handleChange}
          rowSelection={rowSelection}
          scroll={{ x: 1300 }}
          size="middle"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => 'Tổng số ' + total + ' đơn hàng',
            style: {
              marginTop: '24px'
            }
          }}
          style={{
            marginTop: '12px'
          }}
        />
      </div>


      {/* Modal xem chi tiết */}
      <Modal
        title={<Text strong>Chi tiết đơn hàng {selectedOrder?.orderId}</Text>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {isLoadingDetail ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
        ) : (
          selectedOrder && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Trạng thái" span={2}>
                  <Tag style={getStatusStyle(selectedOrder.currentOrderStatus?.currentStatus)}>
                    {selectedOrder.currentOrderStatus?.currentStatus}
                  </Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {selectedOrder.currentOrderStatus?.statusDescription}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Thông tin lấy hàng" span={2}>
                  <Space direction="vertical">
                    <Text strong>{selectedOrder.pickupName} - {selectedOrder.pickupPhone}</Text>
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{selectedOrder.pickupAddressDetail}</Text>
                    </Space>
                    <Text type="secondary">Thời gian: {formatDateTime(selectedOrder.pickupTime)}</Text>
                    {selectedOrder.pickupDescription && (
                      <Text type="secondary">Ghi chú: {selectedOrder.pickupDescription}</Text>
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Thông tin giao hàng" span={2}>
                  <Space direction="vertical">
                    <Text strong>{selectedOrder.deliveryName} - {selectedOrder.deliveryPhone}</Text>
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{selectedOrder.deliveryAddressDetail}</Text>
                    </Space>
                    <Text type="secondary">Thời gian: {formatDateTime(selectedOrder.deliveryTime)}</Text>
                    {selectedOrder.deliveryDescription && (
                      <Text type="secondary">Ghi chú: {selectedOrder.deliveryDescription}</Text>
                    )}
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Chi tiết dịch vụ" span={2}>
                  {selectedOrder.orderSummary?.items.map((item, index) => (
                    <div key={index} style={{ marginBottom: 16 }}>
                      <Space direction="vertical">
                        <Text strong>{item.serviceName}</Text>
                        <Space>
                          <Text>Đơn giá: {formatCurrency(item.servicePrice)}</Text>
                          <Text>Số lượng: {item.quantity}</Text>
                          <Text>Tổng: {formatCurrency(item.subTotal)}</Text>
                        </Space>
                        {item.extras.length > 0 && (
                          <div>
                            <Text>Dịch vụ thêm:</Text>
                            {item.extras.map((extra, idx) => (
                              <div key={idx}>
                                <Text>{extra.name} - {formatCurrency(extra.price)}</Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </Space>
                    </div>
                  ))}
                </Descriptions.Item>

                <Descriptions.Item label="Tổng tiền hàng">
                  {formatCurrency(selectedOrder.orderSummary?.estimatedTotal)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí vận chuyển">
                  {formatCurrency(selectedOrder.orderSummary?.shippingFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá vận chuyển">
                  {formatCurrency(selectedOrder.orderSummary?.shippingDiscount)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí phát sinh">
                  {formatCurrency(selectedOrder.orderSummary?.applicableFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  {formatCurrency(selectedOrder.orderSummary?.discount)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng cộng" className="total-amount">
                  <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                    {formatCurrency(selectedOrder.orderSummary?.totalPrice)}
                  </Text>
                </Descriptions.Item>

                {selectedOrder.notes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedOrder.notes}
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Thời gian tạo đơn">
                  {formatDateTime(selectedOrder.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật cuối">
                  {formatDateTime(selectedOrder.currentOrderStatus?.lastUpdate)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )
        )}
      </Modal>

       {/* Modal xem lịch sử  */}
      <Modal
        title={<Text strong>Lịch sử đơn hàng {orderHistory?.[0]?.orderId}</Text>}
        open={isHistoryModalVisible}
        onCancel={() => setIsHistoryModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsHistoryModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {isLoadingHistory ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
        ) : (
          <Timeline
            mode="left"
            items={orderHistory?.map(item => ({
              color: getTimelineItemColor(item.status),
              label: (
                <div style={{ width: '150px' }}>
                  <Text type="secondary" style={{ fontSize: '0.9em' }}>
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </Text>
                </div>
              ),
              children: (
                <div style={{ padding: '0 8px' }}>
                  <Space direction="vertical" size="small">
                    <Text strong>{item.statusDescription}</Text>
                    <div>
                      <Text type="secondary">Cập nhật bởi: </Text>
                      <Text>{item.updatedBy.fullName}</Text>
                      <Text type="secondary"> - </Text>
                      <Text>{item.updatedBy.phoneNumber}</Text>
                    </div>
                    {item.notes && (
                      <Text italic>Ghi chú: {item.notes}</Text>
                    )}
                    {item.containMedia && (
                      <Tag 
                        color="blue" 
                        icon={<CameraOutlined />}
                        style={{ cursor: 'pointer' }}
                        onClick={() => fetchHistoryPhotos(item.statusHistoryId)}
                      >
                        Xem hình ảnh đính kèm
                      </Tag>
                    )}
                  </Space>
                </div>
              ),
            }))}
          />
        )}
      </Modal>

      {/* Modal xem ảnh */}
      <Modal
        title={<Text strong>Hình ảnh đính kèm</Text>}
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsPhotoModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {loadingPhotos ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải ảnh...</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {selectedHistoryPhotos.map((photo, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <Image
                  src={photo.photoUrl}
                  alt={`Ảnh ${index + 1}`}
                  style={{ objectFit: 'cover' }}
                  width={200}
                  height={200}
                />
                <Text type="secondary" style={{ 
                  display: 'block', 
                  textAlign: 'center',
                  marginTop: '4px',
                  fontSize: '0.9em' 
                }}>
                  {new Date(photo.createdAt).toLocaleString("vi-VN")}
                </Text>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal xác nhận xóa hàng loạt */}
      <Modal
        title={<Text strong style={{ color: '#ff4d4f' }}>Xác nhận xóa đơn hàng</Text>}
        open={isDeleteModalVisible}
        onCancel={cancelBatchDelete}
        footer={null}
        centered
      >
        <div style={{ padding: '16px 0' }}>
          <p>Bạn có chắc chắn muốn xóa {selectedRowKeys.length} đơn hàng đã chọn?</p>
          <p><Text strong>Lưu ý:</Text> Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.</p>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={cancelBatchDelete}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              danger 
              loading={isDeleting}
              onClick={confirmBatchDelete}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ListAllOrders;
