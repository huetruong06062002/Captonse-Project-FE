import React, { useState, useEffect } from 'react';
import { Tabs, Button, Spin, Alert } from 'antd';
import { FileWordOutlined, DownloadOutlined } from '@ant-design/icons';
import mammoth from 'mammoth';

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
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocx = async () => {
      setLoading(true);
      setError('');
      setContent('');
      try {
        const res = await fetch(files[Number(activeKey)].file);
        if (!res.ok) throw new Error('Không thể tải file Word.');
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let cleanHtml = result.value.replace(/font-weight:\s*\d{3};?/g, '');
        cleanHtml = cleanHtml.replace(/<strong>([\s\S]*?)<\/strong>/g, '<p>$1</p>');
        setContent(cleanHtml);
      } catch (err) {
        setError('Không thể đọc nội dung file Word. Vui lòng tải về để xem chi tiết.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocx();
  }, [activeKey]);

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, minHeight: 400 }}>
      <h2 style={{ fontSize: 24, marginBottom: 24, color: '#1677ff' }}>Chính sách EcoLaundry</h2>
      <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Nội dung các chính sách</div>
      <Tabs
        activeKey={activeKey}
        onChange={key => setActiveKey(key)}
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
              {loading && <Spin size="large" style={{ margin: '32px auto', display: 'block' }} />}
              {error && <Alert message={error} type="warning" showIcon style={{ marginBottom: 16 }} />}
              {!loading && !error && (
                <div
                  className="word-content"
                  style={{ background: '#f8fafd', borderRadius: 8, padding: 24, minHeight: 300, fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400, color: '#222', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          ),
        }))}
      />
    </div>
  );
}
