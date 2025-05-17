import React, { useState, useRef } from 'react';
import { Button, message, Card, Descriptions, Popconfirm, Spin, Alert, Typography, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function PolicyUpload() {
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  // Lấy thông tin file hiện tại
  const fetchCurrent = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://chatbot.vuhai.me/documents/current');
      if (!res.ok) throw new Error('Không lấy được thông tin file');
      const data = await res.json();
      setFileInfo(data);
    } catch (err) {
      setFileInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Upload file
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('https://chatbot.vuhai.me/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Upload thành công!');
        fetchCurrent();
      } else {
        message.error(data.message || 'Upload thất bại!');
      }
    } catch (err) {
      message.error('Lỗi upload file!');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Xóa file
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://chatbot.vuhai.me/documents/current', {
        method: 'DELETE',
      });
      if (res.ok) {
        message.success('Đã xóa file chính sách!');
        setFileInfo(null);
      } else {
        message.error('Xóa file thất bại!');
      }
    } catch (err) {
      message.error('Lỗi xóa file!');
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin file khi load trang
  React.useEffect(() => {
    fetchCurrent();
  }, []);

  // Hàm format ngày giờ về VN
  const formatVNDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Chuyển sang UTC+7
    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(vnDate.getDate())}/${pad(vnDate.getMonth() + 1)}/${vnDate.getFullYear()} ${pad(vnDate.getHours())}:${pad(vnDate.getMinutes())}:${pad(vnDate.getSeconds())}`;
  };

  return (
    <Card
      style={{
        maxWidth: 520,
        margin: '32px auto 40px auto',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(22,119,255,0.07)',
        border: '1px solid #e6f0ff',
        background: '#fafdff',
      }}
      bodyStyle={{ padding: 32 }}
    >
      <Title level={4} style={{ color: '#1677ff', marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>Quản lý file chính sách AI</Title>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <input
          type="file"
          accept=".doc,.docx,.pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleUpload}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          loading={uploading}
          type="primary"
          size="large"
          style={{
            background: '#1677ff',
            borderRadius: 8,
            fontWeight: 600,
            minWidth: 260,
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(22,119,255,0.10)',
            letterSpacing: 0.5,
          }}
        >
          Tải lên file chính sách mới
        </Button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '32px 0' }}><Spin size="large" /></div>
      ) : fileInfo ? (
        <Card
          type="inner"
          style={{ borderRadius: 12, background: '#fff', border: '1px solid #e6f0ff', marginTop: 8 }}
          title={
            <Space align="center">
              <FileOutlined style={{ color: '#1677ff', fontSize: 22 }} />
              <Text strong style={{ fontSize: 18 }}>{fileInfo.filename}</Text>
            </Space>
          }
          extra={
            <Popconfirm
              title="Bạn chắc chắn muốn xóa file này?"
              onConfirm={handleDelete}
              okText="Xóa"
              showCancel={false}
            >
              <Button danger icon={<DeleteOutlined />}>Xóa file</Button>
            </Popconfirm>
          }
        >
          <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
            <Descriptions.Item label={<Text strong style={{ color: '#1677ff' }}>Tên file</Text>}>{fileInfo.filename}</Descriptions.Item>
            <Descriptions.Item label={<Text strong style={{ color: '#1677ff' }}>Loại file</Text>}>{fileInfo.file_type}</Descriptions.Item>
            <Descriptions.Item label={<Text strong style={{ color: '#1677ff' }}>Kích thước</Text>}>{fileInfo.file_size} bytes</Descriptions.Item>
            <Descriptions.Item label={<Text strong style={{ color: '#1677ff' }}>Upload lúc</Text>}>{formatVNDate(fileInfo.upload_time)}</Descriptions.Item>
            <Descriptions.Item label={<Text strong style={{ color: '#1677ff' }}>ID file</Text>}>{fileInfo.file_id}</Descriptions.Item>
          </Descriptions>
        </Card>
      ) : (
        <Alert message="Chưa có file chính sách nào được upload." type="info" showIcon style={{ marginTop: 8, borderRadius: 8, background: '#f4faff' }} />
      )}
    </Card>
  );
} 