import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Button, Progress, message } from 'antd';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';

const ExportExcelButton = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const now = new Date();
  const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  const defaultFilename = `laundry_service_${formattedDate}.xlsx`;

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress > 90) {
        currentProgress = 90;
        clearInterval(interval);
      }
      setProgress(Math.min(Math.round(currentProgress), 90));
    }, 200);
    return interval;
  };

  const handleExport = async () => {
    setLoading(true);
    setProgress(0);
    const progressInterval = simulateProgress();

    try {
      const response = await axios.get('https://laundry.vuhai.me/api/excels/export-laundry-services', {
        responseType: 'blob', //nhận diện file excel theo dạng nhị phân
      });

      // Lấy tên file từ header 
      const disposition = response.headers['content-disposition'];
      const filenameMatch = disposition && disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      const filename = filenameMatch ? filenameMatch[1].replace(/['"]/g, '') : defaultFilename;

      saveAs(new Blob([response.data]), filename);
      setProgress(100);
      message.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi export file:', error);
      message.error('Xuất Excel thất bại!');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <Button
        onClick={handleExport}
        type="primary"
        loading={loading}
        icon={loading ? <LoadingOutlined /> : <DownloadOutlined />}
        style={{
          backgroundColor: '#2D9CDB',
          borderColor: '#2D9CDB',
          height: '40px',
          padding: '20px 20px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#1a8bc7',
            borderColor: '#1a8bc7',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(45, 156, 219, 0.2)'
          }
        }}
      >
        {loading ? 'Đang xuất...' : 'Xuất Excel'}
      </Button>
      {loading && (
        <Progress 
          percent={progress} 
          size="small" 
          status="active"
          style={{ 
            width: '100%',
            marginTop: '4px'
          }}
        />
      )}
    </div>
  );
};

export default ExportExcelButton;
