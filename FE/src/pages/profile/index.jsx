import { 
  UploadOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  SaveOutlined,
  EditOutlined  
} from "@ant-design/icons";
import { getRequestParams, postRequestMultipartFormData, putRequestMultipartFormData } from "@services/api";
import { formatDateDisplay } from "@utils/dateFormat";
import {
  Avatar,
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Typography,
  Upload,
  Card,
  Space,
  Divider,
  Skeleton,
  Badge,
  Tooltip
} from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DatePicker } from "antd";
import moment from "moment";
import dayjs from "dayjs";
import "./profile.css";

const { Title, Text, Paragraph } = Typography;

function Profile() {
  const { user, role } = useSelector((state) => state.auth);

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [dob, setDob] = useState(null);
  const [form] = Form.useForm();
  
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await getRequestParams(`/users/${user?.userId}`);
      setUserInfo(response.data);
      console.log("check response", response);
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      // Add form values
      formData.append('UserId', userInfo?.userId);
      formData.append('FullName', values.fullName);
      formData.append('Email', values.email);
      // Add file if one was uploaded
      if (fileList.length > 0) {
        formData.append('Avatar', fileList[0].originFileObj);
      }

      if (dob) {
        formData.append('Dob', dob);
      } else {
        formData.append('Dob', userInfo?.dob);
      }
      formData.append('Gender', values.gender);

      const response = await putRequestMultipartFormData(`/users/update-profile`, formData);

      if (response) {
        // Refresh user data
        await fetchUser();
        setFileList([]);
        message.success('Cập nhật thông tin thành công');
      } else {
        message.error('Cập nhật thất bại');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeDob = (date, dateString) => {
    console.log(date, dateString);
    const formattedDate = dateString ? dateString.split('/').reverse().join('-') : '';
    setDob(formattedDate);
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList); // Cập nhật danh sách file
  };

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]} className="profile-content">
        <Col xs={24} md={8}>
          <Card className="profile-card profile-info-card">
            <Skeleton loading={loading} active avatar paragraph={{ rows: 3 }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div className="profile-avatar-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <Badge count={<EditOutlined className="edit-badge" />} offset={[-5, 5]}>
                      <Avatar
                        size={120}
                        src={
                          userInfo?.avatar &&
                            userInfo?.avatar !== "null" &&
                            userInfo?.avatar !== ""
                            ? userInfo.avatar
                            : "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                        }
                        className="profile-avatar"
                      />
                    </Badge>
                  </div>
                </div>
                
                <div className="profile-upload-container" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Upload
                      listType="picture"
                      fileList={fileList}
                      onChange={handleUploadChange}
                      beforeUpload={() => false}
                      maxCount={1}
                      showUploadList={false}
                      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          icon={<UploadOutlined />} 
                          className="upload-button"
                          type="primary"
                          ghost
                        >
                          {fileList.length ? 'Thay đổi ảnh' : 'Chọn ảnh mới'}
                        </Button>
                      </div>
                    </Upload>
                    {fileList.length > 0 && (
                      <div className="selected-file">
                        <Text ellipsis>{fileList[0].name}</Text>
                        <Button 
                          size="small" 
                          danger 
                          onClick={() => setFileList([])}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Divider />
              
              <div className="profile-details">
                <Title level={3}>{userInfo?.fullName || "Chưa cập nhật"}</Title>
                <div className="role-badge">
                  <Badge color="#1890ff" status="processing" />
                  <Text strong>{userInfo?.role === "Admin" ? "Administrator" : userInfo?.role}</Text>
                </div>

                <Divider style={{ margin: '20px 0 16px', width: '80%' }} />
                
                <Space direction="vertical" size={12} className="user-meta">
                  <div className="meta-item">
                    <MailOutlined className="meta-icon" />
                    <Text copyable>{userInfo?.email || "Chưa cập nhật email"}</Text>
                  </div>
                  <div className="meta-item">
                    <PhoneOutlined className="meta-icon" />
                    <Text>{userInfo?.phoneNumber || "Chưa cập nhật số điện thoại"}</Text>
                  </div>
                  <div className="meta-item">
                    <CalendarOutlined className="meta-icon" />
                    <Text>
                      {userInfo?.dob 
                        ? dayjs(userInfo.dob).format('DD/MM/YYYY') 
                        : "Chưa cập nhật ngày sinh"}
                    </Text>
                  </div>
                </Space>
                
                <div className="account-status">
                  <Badge status={userInfo?.status === "Active" ? "success" : "error"} />
                  <Text>{userInfo?.status || "Chưa xác định"}</Text>
                </div>
              </div>
            </Skeleton>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Thông tin cá nhân</span>
              </Space>
            } 
            className="profile-card profile-form-card"
          >
            <Skeleton loading={loading} active paragraph={{ rows: 8 }}>
              {userInfo && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    fullName: `${userInfo?.fullName || ""}`,
                    email: `${userInfo?.email || ""}`,
                    phoneNumber: `${userInfo?.phoneNumber || ""}`,
                    gender: `${userInfo?.gender || ""}`,
                    status: `${userInfo?.status || ""}`,
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined className="input-prefix-icon" />} 
                          placeholder="Nhập email"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                          { required: true, message: "Vui lòng nhập họ và tên!" },
                        ]}
                      >
                        <Input 
                          prefix={<UserOutlined className="input-prefix-icon" />} 
                          placeholder="Nhập họ và tên"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phoneNumber"
                        tooltip="Số điện thoại không thể thay đổi"
                      >
                        <Input 
                          prefix={<PhoneOutlined className="input-prefix-icon" />} 
                          disabled 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item 
                        label="Ngày sinh"
                        required
                        tooltip="Chọn ngày sinh của bạn"
                      >
                        <DatePicker
                          value={
                            userInfo?.dob && dob == null
                              ? dayjs(userInfo.dob, "YYYY-MM-DD") 
                              : dob ? dayjs(dob, "YYYY-MM-DD") : null
                          }
                          format="DD/MM/YYYY"
                          onChange={onChangeDob}
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày sinh"
                          suffixIcon={<CalendarOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[
                          { required: true, message: "Vui lòng chọn giới tính!" },
                        ]}
                      >
                        <Select placeholder="Chọn giới tính">
                          <Select.Option value="Male">Nam</Select.Option>
                          <Select.Option value="Female">Nữ</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Trạng thái tài khoản"
                        name="status"
                        tooltip="Trạng thái tài khoản không thể thay đổi"
                      >
                        <Input disabled />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item className="form-actions">
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={submitting}
                      icon={<SaveOutlined />}
                      size="large"
                      block
                    >
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Profile;
