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
        responseType: 'blob',
      });

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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Button
        onClick={handleExport}
        type="primary"
        loading={loading}
        icon={loading ? <LoadingOutlined style={{ fontSize: '20px' }} /> : <DownloadOutlined style={{ fontSize: '20px' }} />}
        style={{
          backgroundColor: '#faad14',
          borderColor: '#faad14'
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
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            width: '100%',
          }}
        />
      )}
    </div>
  );
};

export default ExportExcelButton;
