import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, message, Typography, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import logo from "@assets/logo3.jpg";
import "./index.css";
import { login } from '@redux/features/authReducer/authSlice';

const { Title } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { redirectPath, isLoading } = useSelector((state) => state.auth);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.05,
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 0.5
      }
    }
  };
  
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: 0.6
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 12px 20px rgba(59, 183, 126, 0.6)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
        ease: "easeOut"
      }
    },
    tap: { scale: 0.95 }
  };
  
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1 }
    }
  };
  
  const shapeVariants = {
    animate: {
      x: [0, 50, -50, 0],
      y: [0, 30, -30, 0],
      rotate: [0, 180, 360],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  const onFinish = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      
      message.success("Đăng nhập thành công");
      navigate(redirectPath || "/");
    } catch (error) {}
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-background"
        variants={backgroundVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="shape" 
          variants={shapeVariants}
          animate="animate"
          custom={1}
        ></motion.div>
        <motion.div 
          className="shape" 
          variants={shapeVariants}
          animate="animate"
          custom={2}
        ></motion.div>
      </motion.div>
      
      <motion.div
        className="login-card-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="login-card"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="login-logo-container"
            variants={itemVariants}
          >
            <motion.img 
              src={logo} 
              alt="Logo" 
              className="login-logo"
              variants={logoVariants}
              whileHover="hover"
              style={{ 
                mixBlendMode: 'multiply',
                filter: 'contrast(1.1) brightness(1.1)'
              }}
            />
            <motion.div variants={itemVariants}>
              <Title level={2} className="login-title">
                Đăng nhập
              </Title>
              <p className="login-subtitle">EcoLaundry - Dịch vụ giặt là hàng đầu</p>
            </motion.div>
          </motion.div>
          
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <motion.div variants={itemVariants}>
              <Form.Item
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Số điện thoại"
                  size="large"
                  className="login-input"
                />
              </Form.Item>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Mật khẩu"
                  size="large"
                  className="login-input"
                />
              </Form.Item>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
            >
              <Form.Item>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    size="large"
                    loading={isLoading}
                  >
                    Đăng nhập
                  </Button>
                </motion.div>
              </Form.Item>
            </motion.div>
            
            <motion.div 
              className="login-links"
              variants={itemVariants}
            >
              <Link to="/register" className="register-link">Đăng ký tài khoản</Link>
              <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
            </motion.div>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
