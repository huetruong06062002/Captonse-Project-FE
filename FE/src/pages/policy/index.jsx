import React, { useState } from 'react';
import { Tabs, Button, Alert } from 'antd';
import { FileWordOutlined, DownloadOutlined } from '@ant-design/icons';
import PolicyUpload from './PolicyUpload';

const files = [
  {
    name: 'Chính sách giao nhận',
    file: '/Policy/ChinhSachGiaoNhan.docx',
  },
  {
    name: 'Chính sách bồi hoàn',
    file: '/Policy/ChinhSachBoiHoan.docx',
  },
  {
    name: 'Các trường hợp miễn trừ trách nhiệm',
    file: '/Policy/CacTruongHopMienTru.docx',
  },
];

export default function Policy() {
  const [activeKey, setActiveKey] = useState('0');
  const [viewerError, setViewerError] = useState(false);

  return (
    
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 400 }}>
        <PolicyUpload />
      <h2 style={{ fontSize: 24, marginBottom: 24, color: '#1677ff' }}>Chính sách EcoLaundry</h2>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Nội dung các chính sách</div>
      <Tabs
        activeKey={activeKey}
        onChange={key => { setActiveKey(key); setViewerError(false); }}
        items={files.map((f, idx) => ({
          key: String(idx),
          label: f.name,
          children: (
            <div style={{ minHeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <FileWordOutlined style={{ fontSize: 28, color: '#1677ff' }} />
                <span style={{ fontWeight: 600, fontSize: 18 }}>{f.name}</span>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={f.file}
                  download
                  style={{ marginLeft: 8 }}
                >
                  Tải về
                </Button>
              </div>
              {viewerError && (
                <Alert
                  message="Không thể xem trực tiếp file Word này trên trình duyệt. Vui lòng tải về để xem nội dung chi tiết."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
              <iframe
                src={`https://docs.google.com/gview?url=${window.location.origin + f.file}&embedded=true`}
                style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8, boxShadow: '0 2px 6px rgba(24, 144, 255, 0.1)' }}
                frameBorder="0"
                title={f.name}
                onError={() => setViewerError(true)}
              />
            </div>
          ),
        }))}
      />
    
    </div>
  );
}
