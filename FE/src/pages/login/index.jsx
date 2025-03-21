import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, message, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import logo from "@assets/logo3.jpg";
import "./index.css";
import { login } from '@redux/features/authReducer/authSlice';

const { Title } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { redirectPath, isLoading } = useSelector((state) => state.auth);

  console.log("isloading", isLoading)


  const onFinish = async (values) => {
    console.log(values);
    try {
      await dispatch(login(values)).unwrap();
      
      message.success("Đăng nhập thành công");
      navigate(redirectPath || "/admin");
    } catch (error) {}
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-logo-container">
          <img src={logo} style={{width:"10rem", height:"10rem"}} alt="Logo" className="login-logo" />
          <Title level={3} className="login-title">
            Đăng nhập 123
          </Title>
        </div>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="phoneNumber"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Số điện thoại"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size="large"
              loading={isLoading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
          <div className="login-links">
            <Link to="/register">Đăng ký tài khoản</Link>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
