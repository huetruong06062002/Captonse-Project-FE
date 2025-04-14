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

// Tạo mảng bông tuyết có số lượng là count
const createSnowflakes = (count) => {
  return Array.from({ length: count }).map((_, i) => {
    // Tạo một phân bố tập trung gần như hoàn toàn ở bên trái
    let xPosition;
    const distribution = Math.random();
    
    // 90% bông tuyết sẽ nằm ở phía bên trái màn hình
    if (distribution < 0.9) {
      // Phân bố 90% bông tuyết trong khoảng -10% đến 25% chiều rộng màn hình (hoàn toàn bên trái)
      xPosition = Math.random() * 35 - 10; // Một số sẽ bắt đầu ngoài màn hình (-10 đến 0)
    } else {
      // Chỉ 10% bông tuyết còn lại phân bố ở phần còn lại (25-60%)
      xPosition = 25 + Math.random() * 35;
    }
    
    return {
      id: i,
      x: xPosition, 
      y: -Math.random() * 1500, // Tăng độ cao để bông tuyết xuất hiện từ cao hơn
      size: Math.random() * 25 + 5,
      delay: Math.random() * 20,
      duration: Math.random() * 30 + 15,
      type: Math.floor(Math.random() * 3)
    };
  });
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { redirectPath, isLoading } = useSelector((state) => state.auth);

  // Tăng số lượng bông tuyết lên 200 để phủ đầy màn hình
  const snowflakes = createSnowflakes(200);

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
      {/* Snowfall effect */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="snowflake"
          initial={{ 
            x: `${flake.x}vw`, 
            y: flake.y, 
            opacity: 0.7 + Math.random() * 0.3, // Thêm độ ngẫu nhiên cho opacity
            rotate: Math.random() * 360, // Góc xoay ngẫu nhiên ban đầu
            scale: 0.8 + Math.random() * 0.4 // Kích thước ngẫu nhiên ban đầu
          }}
          animate={{ 
            y: '200vh', // Kéo dài để đảm bảo tuyết chậm rãi đi qua toàn màn hình
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1), // Xoay ngẫu nhiên cả 2 chiều
            x: [
              `${flake.x}vw`,
              `${flake.x + (Math.random() * 20 - 10)}vw`, 
              `${flake.x - (Math.random() * 20 - 10)}vw`,
              `${flake.x + (Math.random() * 15 - 7.5)}vw`,
              `${flake.x}vw`
            ],
            scale: [
              0.8 + Math.random() * 0.4,
              1 + Math.random() * 0.5,
              0.8 + Math.random() * 0.4
            ]
          }}
          transition={{
            y: { 
              duration: flake.duration,
              repeat: Infinity,
              delay: flake.delay,
              ease: "linear"
            },
            x: {
              duration: flake.duration * 0.8,
              repeat: Infinity,
              delay: flake.delay,
              times: [0, 0.25, 0.5, 0.75, 1],
              ease: "easeInOut"
            },
            rotate: {
              duration: flake.duration * 0.5,
              repeat: Infinity,
              delay: flake.delay,
              ease: "linear"
            },
            scale: {
              duration: flake.duration * 0.3,
              repeat: Infinity,
              delay: flake.delay,
              ease: "easeInOut"
            }
          }}
          style={{
            position: 'fixed',
            color: '#3bb77e',
            fontSize: `${flake.size}px`,
            zIndex: 100,
            textShadow: '0 0 3px white',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {/* Hiển thị các loại tuyết khác nhau */}
          {flake.type === 0 ? '❄' : flake.type === 1 ? '❅' : '❆'}
        </motion.div>
      ))}

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
