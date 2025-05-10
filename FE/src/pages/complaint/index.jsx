import { Tabs, Table, Modal, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import { axiosClientVer2 } from '../../config/axiosInterceptor';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
const { TabPane } = Tabs;
import "./index.css"
import { Helmet } from 'react-helmet';

const Complaint = () => {
  const [pending, setPending] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [resolved, setResolved] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);

 
  const getComplaintPending = async () => {
    const token = localStorage.getItem('accessToken');
    const response = await axios('http://localhost:5239/api/complaints/pending', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  };

  const handleCreateComplaint = async () => {
    const token = localStorage.getItem('accessToken');
    const data = {
      complaintDescription: "Đơn hàng cần khiếu nại",
      complaintType: "Sai dịch vụ"
    };

    try {
      await axios.post(
        `http://localhost:5239/api/complaints/250414E1TVAS/admin-customerstaff`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      message.success('Tạo khiếu nại thành công!');
    } catch (err) {
      message.error('Tạo khiếu nại thất bại!');
      console.error(err);
    }
  };

  useEffect(() => {

    getComplaintPending();
    // 1. Tạo connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5239/complaintHub') // Đúng endpoint hub backend của bạn
      .withAutomaticReconnect()
      .build();

    // 2. Lắng nghe sự kiện ReceiveComplaintUpdate
    connection.on('ReceiveComplaintUpdate', (pendingComplaints) => {
      // pendingComplaints là dữ liệu backend gửi về
      // Cập nhật state cho tab pending

      console.log("pendingComplaints", pendingComplaints);

      setPending(pendingComplaints);
    });

    // 3. Kết nối tới hub
    connection.start()
      .then(() => console.log('SignalR connected!'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    // 4. Cleanup khi unmount
    return () => {
      connection.stop();
    };
  }, []);

  // Fetch data
  const fetchData = async (type) => {
    setLoading(true);
    let url = '';
    if (type === 'pending') url = '/complaints/pending';
    if (type === 'in-progress') url = '/complaints/in-progress';
    if (type === 'resolved') url = '/complaints/resolved';
    try {
      const res = await axiosClientVer2.get(url);
      if (type === 'pending') setPending(res.data);
      if (type === 'in-progress') setInProgress(res.data);
      if (type === 'resolved') setResolved(res.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu khiếu nại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('pending');
    fetchData('in-progress');
    fetchData('resolved');
  }, []);

  // Table columns
  const columns = [
    { title: 'Đơn hàng', dataIndex: 'orderId' },
    { title: 'Người tạo', dataIndex: 'createdBy' },
    { title: 'Ngày tạo', dataIndex: 'createdAt' },
    {
      title: 'Chi tiết',
      render: (_, record) => (
        <Button onClick={async () => {
          try {
            setLoading(true);
            const res = await axiosClientVer2.get(`/complaints/${record.complaintId}/detail`);
            setDetail(res.data);
            setModalVisible(true);
          } catch (error) {
            message.error('Không thể tải chi tiết khiếu nại!');
          } finally {
            setLoading(false);
          }
        }}>Xem</Button>
      )
    }
  ];

  // Định nghĩa các cột cho bảng
  const columnPending = [
    { title: 'Mã đơn hàng', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Người tạo', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Loại khiếu nại', dataIndex: 'complaintType', key: 'complaintType' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString('vi-VN') // Định dạng ngày giờ cho đẹp
    },
  ];

  return (
    <div className="complaint-container">
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono&display=swap" rel="stylesheet" />
      </Helmet>
      
      <Button type="primary" onClick={handleCreateComplaint} style={{width:"150px"}} className="complaint-create-btn">
        Tạo khiếu nại
      </Button>
      <Tabs defaultActiveKey="pending" className="complaint-tabs">
        <TabPane tab="Đang chờ xử lý" key="pending">
          <div className="complaint-table">
            <Table
              columns={columnPending}
              dataSource={pending}
              rowKey="complaintId"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </TabPane>
        <TabPane tab="Đang xử lý" key="in-progress">
          <div className="complaint-table">
            <Table 
              columns={columns} 
              dataSource={inProgress} 
              loading={loading} 
              rowKey="complaintId" 
              pagination={false} 
              scroll={{ x: 'max-content' }}
            />
          </div>
        </TabPane>
        <TabPane tab="Đã hoàn thành" key="resolved">
          <div className="complaint-table">
            <Table 
              columns={columns} 
              dataSource={resolved} 
              loading={loading} 
              rowKey="complaintId" 
              pagination={false} 
              scroll={{ x: 'max-content' }}
            />
          </div>
        </TabPane>
      </Tabs>
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title="Chi tiết khiếu nại"
        className="complaint-modal"
      >
        {detail ? (
          <div>
            <p><b>Mã khiếu nại:</b> {detail.complaintId}</p>
            <p><b>Đơn hàng:</b> {detail.orderId}</p>
            <p><b>Nội dung:</b> {detail.content}</p>
            {/* ... các trường khác ... */}
          </div>
        ) : 'Đang tải...'}
      </Modal>
    </div>
  );
};

export default Complaint;