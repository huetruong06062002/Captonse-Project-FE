// WelcomeMessage.js
import React from "react";
import { Typography, Card } from "antd";
import { SmileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WelcomeMessage = () => (
  <Card className="welcome-card">
    <div className="welcome-content">
      <SmileOutlined className="welcome-icon" />
      <Title level={2} className="welcome-title">
        Chào mừng đến với hệ thống <br />
        Intern System
      </Title>
      <Text className="welcome-text">
        Quản lý và đào tạo những lứa lập trình viên xuất sắc.
      </Text>
    </div>
  </Card>
);

export default WelcomeMessage;
