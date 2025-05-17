import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getRequest, postRequest } from '@services/api';
import { Form, Input, InputNumber, Button, message, Card, Modal } from 'antd';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Hàm lấy địa chỉ từ lat/lng bằng Nominatim
const fetchAddressFromLatLng = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.display_name || '';
};

function LocationPicker({ onPick }) {
  useMapEvents({
    click: async (e) => {
      const latlng = [e.latlng.lat, e.latlng.lng];
      let address = '';
      try {
        address = await fetchAddressFromLatLng(latlng[0], latlng[1]);
      } catch {
        address = '';
      }
      onPick(latlng, address);
    },
  });
  return null;
}

export default function Branch() {
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const [pickedLatLng, setPickedLatLng] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchBranch();
  }, []);

  const fetchBranch = async () => {
    setLoading(true);
    try {
      const res = await getRequest('/admin/branchaddress');
      setBranch(res.data);
    } catch (err) {
      setBranch(null);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setCreating(true);
    try {
      const payload = {
        ...values,
        latitude: pickedLatLng ? pickedLatLng[0] : values.latitude,
        longitude: pickedLatLng ? pickedLatLng[1] : values.longitude,
      };
      await postRequest('admin/branchaddress', payload);
      message.success('Tạo chi nhánh thành công!');
      setPickedLatLng(null);
      fetchBranch();
      form.resetFields();
      setModalOpen(false);
    } catch (err) {
      message.error('Tạo chi nhánh thất bại!');
    } finally {
      setCreating(false);
    }
  };

  // Giá trị mặc định cho bản đồ chọn vị trí
  const defaultPosition = pickedLatLng || [10.762622, 106.660172]; // Hồ Chí Minh

  // Khi chọn vị trí trên bản đồ
  const handlePickLocation = (latlng, address) => {
    setPickedLatLng(latlng);
    form.setFieldsValue({ latitude: latlng[0], longitude: latlng[1], addressdetail: address });
  };

  return (
    <div style={{ maxWidth: 700, margin: '32px auto' }}>
      <Button type="primary" onClick={() => setModalOpen(true)} style={{ marginBottom: 24 }}>
        Tạo địa chỉ cho chi nhánh
      </Button>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title="Tạo mới chi nhánh"
        destroyOnClose
        width={600}
      >
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item label="Địa chỉ chi tiết" name="addressdetail" rules={[{ required: true, message: 'Nhập địa chỉ chi tiết!' }]}> 
            <Input placeholder="VD: 701 Trường Sơn, Phường 4, Quận Tân Bình, Hồ Chí Minh" />
          </Form.Item>
          <Form.Item label="Vĩ độ (latitude)" name="latitude" rules={[{ required: true, message: 'Nhập vĩ độ!' }]}> 
            <InputNumber style={{ width: '100%' }} placeholder="VD: 10.809993" step={0.000001} value={pickedLatLng ? pickedLatLng[0] : undefined} readOnly />
          </Form.Item>
          <Form.Item label="Kinh độ (longitude)" name="longitude" rules={[{ required: true, message: 'Nhập kinh độ!' }]}> 
            <InputNumber style={{ width: '100%' }} placeholder="VD: 106.664737" step={0.000001} value={pickedLatLng ? pickedLatLng[1] : undefined} readOnly />
          </Form.Item>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Chọn vị trí trên bản đồ (click vào bản đồ):</div>
            <MapContainer
              center={defaultPosition}
              zoom={15}
              style={{ height: 250, width: '100%', borderRadius: 8, marginBottom: 8 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onPick={handlePickLocation} />
              {pickedLatLng && (
                <Marker position={pickedLatLng}>
                  <Popup>Vị trí bạn chọn</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creating}>Tạo chi nhánh</Button>
          </Form.Item>
        </Form>
      </Modal>
      {loading ? (
        <div>Đang tải bản đồ chi nhánh...</div>
      ) : !branch ? (
        <div>Không lấy được thông tin chi nhánh.</div>
      ) : (
        <>
          <h2 style={{ color: '#1677ff', marginBottom: 16 }}>Địa chỉ chi nhánh</h2>
          <div style={{ marginBottom: 12, fontWeight: 500 }}>{branch.addressdetail}</div>
          <MapContainer
            center={[branch.latitude, branch.longitude]}
            zoom={16}
            style={{ height: 400, width: '100%', borderRadius: 12, boxShadow: '0 2px 12px rgba(22,119,255,0.08)' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[branch.latitude, branch.longitude]}>
              <Popup>
                <b>{branch.addressdetail}</b>
              </Popup>
            </Marker>
          </MapContainer>
        </>
      )}
    </div>
  );
}
