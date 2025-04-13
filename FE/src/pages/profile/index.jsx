import { UploadOutlined } from "@ant-design/icons";
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
} from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DatePicker } from "antd";
import moment from "moment";
import dayjs from "dayjs";

const { Title, Text } = Typography;

function Profile() {
  const { user, role } = useSelector((state) => state.auth);

  const [userInfo, setUserInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [dob, setDob] = useState(null);
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getRequestParams(`/users/${user?.userId}`);
      setUserInfo(response.data);
      console.log("check response", response);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  console.log("check userInfo", userInfo);
  const onFinish = async (values) => {
    setLoading(true);
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

      console.log("check response", response);

      if (response) {
        // Refresh user data
        await fetchUser();
        message.success('Cập nhập thông tin thành công');
      } else {
        message.error('Cập nhập thất bại');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDob = (date, dateString) => {
    console.log(date, dateString);
    const formattedDate = dateString ? dateString.split('/').reverse().join('-') : '';
    setDob(formattedDate);
  };

  console.log("dob", dob);

  console.log("fileList", fileList);
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList); // Cập nhật danh sách file
  };

  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto", // Căn giữa nội dung
        padding: "0 1rem", // Thêm khoảng cách hai bên
        maxHeight: "90vh", // Giới hạn chiều cao tối đa (90% chiều cao màn hình)
        overflowY: "auto",
        paddingBottom: "10rem",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Avatar
          size={100}
          src={
            userInfo?.avatar &&
              userInfo?.avatar !== "null" &&
              userInfo?.avatar !== ""
              ? userInfo.avatar
              : "data:image/png;base64,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"
          }
          style={{ marginBottom: "16px" }}
        />
        <Title level={3}>{userInfo?.fullName}</Title>
        <Text type="secondary">
          {userInfo?.email || "Chưa cập nhật email"} -{" "}
          {userInfo?.role == "Admin" ? "Administrator" : userInfo?.role}
        </Text>
      </div>

      {/* Upload Avatar */}
      <div
        style={{
          display: "flex", // Sử dụng Flexbox
          justifyContent: "center", // Căn giữa theo chiều ngang
          alignItems: "center", // Căn giữa theo chiều dọc
          flexDirection: "column", // Đặt các phần tử theo cột
          height: "200px", // Chiều cao của container (có thể tùy chỉnh)
          marginBottom: "24px",
        }}
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          onChange={handleUploadChange}
          beforeUpload={() => false}
          showUploadList={{
            showPreviewIcon: false,
            showRemoveIcon: true
          }}
        >
          {fileList.length < 1 && (
            <Button style={{ background: "#2ecc71" }} icon={<UploadOutlined />}>
              Chọn hình ảnh để cập nhật
            </Button>
          )}
        </Upload>
      </div>
      {/* Form */}
      {userInfo && (
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            fullName: `${userInfo?.fullName || "Chưa cập nhật họ tên"}`,
            email: `${userInfo?.email || "Chưa cập nhật email"}`,
            phoneNumber: `${userInfo?.phoneNumber || "Chưa cập nhật số điện thoại"
              }`,
            dob: userInfo?.dob
              ? moment(userInfo.dob, "YYYY-MM-DD")
              : "Chưa cập nhật ngày sinh",
            gender: `${userInfo?.gender || "Chưa cập nhật giới tính"}`,
            status: `${userInfo?.status || "Chưa cập nhật trạng thái"}`,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập email!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "red" }}>*</span> Ngày sinh
                </label>
                <DatePicker
                  value={
                    userInfo?.dob && dob == null? dayjs(userInfo.dob, "YYYY-MM-DD") : dayjs(dob, "YYYY-MM-DD")
                  } // Chuyển đổi giá trị ngày sinh
                  format="DD/MM/YYYY" // Định dạng ngày hiển thị
                  onChange={onChangeDob}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "4px",
                  }} // Tùy chỉnh CSS
                  placeholder="Chọn ngày sinh"
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng nhập trạng thái!" },
                ]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" loading={loading} htmlType="submit" style={{ width: "100%" }}>
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}

export default Profile;
