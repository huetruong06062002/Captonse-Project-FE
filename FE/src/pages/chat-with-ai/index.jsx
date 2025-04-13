import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Typography, Avatar, Spin, message } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { axiosClientVer2 } from '../../config/axiosInterceptor';
import "./index.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

function ChatWithAi() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    // Add user message to chat
    const userMessage = {
      type: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setQuery("");

    try {
      const res = await axiosClientVer2.post(
        "OpenAi/get-ai-response",
        query,
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      // Nếu res.data là chuỗi, cần parse thành object
      const parsedData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

      if (parsedData?.choices?.[0]?.message?.reasoning) {
        // Add AI response to chat
        const aiMessage = {
          type: 'ai',
          content: parsedData.choices[0].message.reasoning,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Handle error in response format
        const errorMessage = {
          type: 'ai',
          content: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
        message.error("Không tìm thấy reasoning trong phản hồi");
      }
    } catch (error) {
      // Add error message to chat
      const errorMessage = {
        type: 'ai',
        content: "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      message.error("Error calling API");
      console.error("API Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-with-ai-container">
      <div className="chat-with-ai-header">
        <Title level={4}>Chat với AI hỗ trợ</Title>
      </div>

      <div className="chat-with-ai-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <RobotOutlined className="empty-chat-icon" />
            <Text className="empty-chat-text">Hãy đặt câu hỏi cho AI hỗ trợ</Text>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message-container ${msg.type === 'user' ? 'message-user' : 'message-ai'}`}
            >
              <div className="message-avatar">
                {msg.type === 'user' ? (
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                ) : (
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: msg.isError ? '#ff4d4f' : '#52c41a' }} />
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  {msg.content}
                </div>
                <div className="message-timestamp">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="message-container message-ai">
            <div className="message-avatar">
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
            </div>
            <div className="message-content">
              <div className="message-bubble loading-bubble">
                <Spin size="small" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-with-ai-input">
        <TextArea
          placeholder="Nhập câu hỏi..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={loading}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSubmit} 
          loading={loading}
          disabled={!query.trim()}
          className="send-button"
        >
          Gửi
        </Button>
      </div>
    </div>
  );
}

export default ChatWithAi;
