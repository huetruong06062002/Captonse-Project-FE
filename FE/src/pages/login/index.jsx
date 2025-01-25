import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, message, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import logo2 from "@assets/logo2.svg";
import "./index.css";

const { Title } = Typography;

const Login = () => {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const { redirectPath } = useSelector((state) => state.auth);

  // const onFinish = async (values) => {
  //   try {
  //     await dispatch(login(values)).unwrap();
  //     message.success("Đăng nhập thành công");
  //     navigate(redirectPath || "/");
  //   } catch (error) {}
  // };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-logo-container">
          <img src={logo2} alt="Logo" className="login-logo" />
          <Title level={3} className="login-title">
            Đăng nhập
          </Title>
        </div>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          // onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Tên đăng nhập"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input
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
