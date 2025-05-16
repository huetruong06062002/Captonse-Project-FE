import React, { useState } from 'react';
import { Button, message, Modal, Upload, Space, Typography, Divider } from 'antd';
import { CloudUploadOutlined, InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Link } = Typography;
const { Dragger } = Upload;

const ButtonImportExcelService = () => {
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFileList([]);
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn file Excel để nhập dữ liệu');
      return;
    }

    const file = fileList[0].originFileObj;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        'https://laundry.vuhai.me/api/excels/import-laundry-services',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      message.success('Tải file lên thành công!');
      setIsModalOpen(false);
      setFileList([]);
    } catch (error) {
      console.error('Lỗi upload:', error);
      message.error('Tải file thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadSample = () => {
    // First try: Attempt to download using axios and the actual path
    const downloadWithAxios = async () => {
      try {
        // Try to fetch the file using axios
        const response = await axios({
          url: '/src/ExcelExample/SampleImportServiceData.xlsx',
          method: 'GET',
          responseType: 'blob',
          timeout: 5000, // 5 second timeout
        });
        
        // Create blob URL
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'SampleImportServiceData.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        message.success('Tải file mẫu thành công!');
        return true;
      } catch (err) {
        console.log('Method 1 failed:', err);
        return false;
      }
    };
    
    // Second try: Use window.open directly on the relative path
    const downloadWithWindowOpen = () => {
      try {
        window.open('/src/ExcelExample/SampleImportServiceData.xlsx', '_blank');
        message.success('Đang mở file mẫu...');
        return true;
      } catch (err) {
        console.log('Method 2 failed:', err);
        return false;
      }
    };
    
    // Third try: Use API endpoint if available
    const downloadFromAPI = () => {
      try {
        window.open('https://laundry.vuhai.me/api/excels/download-sample-service', '_blank');
        message.success('Đang tải xuống file mẫu...');
        return true;
      } catch (err) {
        console.log('Method 3 failed:', err);
        return false;
      }
    };
    
    // Try all download methods one by one
    downloadWithAxios().catch(() => {
      if (!downloadWithWindowOpen()) {
        if (!downloadFromAPI()) {
          // Show info modal if all methods fail
          Modal.info({
            title: 'Không thể tải file mẫu',
            content: (
              <div>
                <p>Không thể tải file mẫu. Vui lòng mở trực tiếp file mẫu tại đường dẫn:</p>
                <p style={{ fontWeight: 'bold' }}>src/ExcelExample/SampleImportServiceData.xlsx</p>
                <Divider />
                <p>Hoặc tạo file Excel mới với cấu trúc sau:</p>
                <ol>
                  <li>Cột A: Tên dịch vụ</li>
                  <li>Cột B: Mã dịch vụ</li>
                  <li>Cột C: Giá dịch vụ</li>
                  <li>Cột D: Mô tả dịch vụ</li>
                </ol>
                <p>Vui lòng tạo file Excel theo cấu trúc trên và tải lên hệ thống.</p>
              </div>
            ),
          });
        }
      }
    });
  };

  const draggerProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx, .xls',
    fileList: fileList,
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} đã được chọn thành công.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} không thể được chọn.`);
      }
      
      // Update fileList
      setFileList(info.fileList.slice(-1)); // Only keep the latest file
    },
    beforeUpload: (file) => {
      // Just return false to stop the default upload behavior
      return false;
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <>
      <Button 
        type="primary"
        icon={<CloudUploadOutlined style={{ fontSize: '20px' }} />}
        onClick={showModal}
        style={{
          backgroundColor: '#52c41a',
          borderColor: '#52c41a'
        }}
      >
        Nhập Excel
      </Button>
      
      <Modal
        title="Nhập dữ liệu dịch vụ từ Excel"
        open={isModalOpen}
        onOk={handleImport}
        onCancel={handleCancel}
        okText="Nhập dữ liệu"
        cancelButtonProps={{ style: { display: 'none' } }}
        confirmLoading={uploading}
        width={600}
        centered
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <Text>Tải về file mẫu để xem cấu trúc dữ liệu:</Text>
            <Button 
              type="link" 
              icon={<DownloadOutlined />}
              onClick={handleDownloadSample}
              style={{ marginLeft: 8 }}
            >
              Tải file mẫu
            </Button>
          </div>
          
          <Divider />
          
          <Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#52c41a', fontSize: 48 }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16 }}>Kéo thả file Excel hoặc nhấp vào đây để tải lên</p>
            <p className="ant-upload-hint">
              Hỗ trợ tải lên duy nhất file .xlsx, .xls. Vui lòng sử dụng đúng định dạng mẫu.
            </p>
          </Dragger>
          
          <div style={{ marginTop: 16 }}>
            {fileList.length > 0 && (
              <Text type="success">
                Đã chọn: {fileList[0].name}
              </Text>
            )}
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default ButtonImportExcelService;
