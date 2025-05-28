import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Typography, Avatar, Spin, message, List, Card, InputNumber, Form, Row, Col, Divider, Tooltip } from "antd";
import { SendOutlined, RobotOutlined, UserOutlined, DeleteOutlined, QuestionCircleOutlined, SearchOutlined, ReloadOutlined, CloudSyncOutlined } from "@ant-design/icons";
import { postRequest } from "../../services/api";
import "./index.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

function ChatWithAi() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [updatingKnowledge, setUpdatingKnowledge] = useState(false);
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState(() => localStorage.getItem("userId") || "guest-user");
  const [customTopic, setCustomTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [form] = Form.useForm();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on component mount
  useEffect(() => {
    // You could implement a function to fetch chat history here
    // For example:
    // fetchChatHistory(userId);
    
    // Fetch initial related questions
    fetchRelatedQuestions("", questionCount);
  }, [userId, questionCount]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Function to update knowledge base
  const updateKnowledgeBase = async () => {
    setUpdatingKnowledge(true);
    try {
      const response = await postRequest("OpenAi/update-knowledge", {});
      
      if (response.data.success) {
        message.success(response.data.response || "Cập nhật dữ liệu thành công");
      } else {
        message.error("Không thể cập nhật dữ liệu");
      }
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      message.error("Lỗi khi cập nhật dữ liệu");
    } finally {
      setUpdatingKnowledge(false);
    }
  };

  // Function to clean text of boxed formatting
  const cleanBoxedText = (text) => {
    if (!text) return "";
    
    // Remove boxed formatting and clean up
    return text
      .replace(/\\boxed{/g, "")
      .replace(/\\boxed\[/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\{/g, "")
      .replace(/\}/g, "")
      .replace(/\\"/g, '"');
  };

  // Function to fetch related questions based on a topic
  const fetchRelatedQuestions = async (topic, count) => {
    setLoadingQuestions(true);
    try {
      const response = await postRequest("OpenAi/related-questions", {
        topic: topic,
        count: count
      });
      
      if (response.data.success && response.data.questions) {
        // Clean boxed formatting from each question
        const cleanedQuestions = response.data.questions.map(question => cleanBoxedText(question));
        setRelatedQuestions(cleanedQuestions);
      } else {
        console.error("Failed to fetch related questions");
        message.error("Không thể tải câu hỏi gợi ý");
      }
    } catch (error) {
      console.error("Error fetching related questions:", error);
      message.error("Lỗi khi tải câu hỏi gợi ý");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Handle custom topic search
  const handleTopicSearch = () => {
    fetchRelatedQuestions(customTopic, questionCount);
  };

  // Handle selecting a suggested question
  const handleSelectQuestion = (question) => {
    setQuery(question);
  };

  // Handle count change
  const handleCountChange = (value) => {
    setQuestionCount(value);
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
      // Use the postRequest function from services/api.js
      const response = await postRequest("OpenAi/get-ai-response", {query:query});
      
      // Handle the response format from the screenshot
      const data = response.data;
      
      if (data.success && data.response) {
        // Clean the response text
        const cleanResponse = cleanBoxedText(data.response);
        
        // Add AI response to chat
        const aiMessage = {
          type: 'ai',
          content: cleanResponse,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Fetch related questions based on the user's query
        fetchRelatedQuestions(query, questionCount);
        // Update custom topic field with the current query
        setCustomTopic(query);
      } else {
        // Handle error in response format
        const errorMessage = {
          type: 'ai',
          content: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
        message.error("Không nhận được phản hồi từ AI");
      }
    } catch (error) {
      console.error("API Error: ", error);
      
      // Add error message to chat
      const errorMessage = {
        type: 'ai',
        content: "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      message.error("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // Function to clear chat history
  const clearChat = () => {
    setMessages([]);
    message.success("Lịch sử trò chuyện đã được xóa");
    
    // Fetch initial related questions again
    fetchRelatedQuestions("", questionCount);
    setCustomTopic("");
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
    <div className="chat-container-wrapper">
      <div className="chat-with-ai-container">
        <div className="chat-with-ai-header">
          <Title level={4}>Chat với AI hỗ trợ</Title>
          <div className="header-actions">
            <Tooltip title="Cập nhật dữ liệu">
              <Button 
                icon={<CloudSyncOutlined />} 
                type="text"
                onClick={updateKnowledgeBase}
                loading={updatingKnowledge}
                className="update-knowledge-btn"
              />
            </Tooltip>
            {messages.length > 0 && (
              <Button 
                icon={<DeleteOutlined />}
                type="text"
                onClick={clearChat}
                title="Xóa lịch sử"
              />
            )}
          </div>
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
      
      {/* Related Questions Section */}
      <div className="related-questions-container">
        <div className="related-questions-header">
          <Title level={5}>
            <QuestionCircleOutlined /> Gợi ý các câu hỏi của khách hàng
          </Title>
        </div>

        <div className="related-questions-controls">
          <Row gutter={[8, 8]} align="middle">
            <Col flex="auto">
              <Input 
                placeholder="Nhập chủ đề - có thể để trống" 
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onPressEnter={handleTopicSearch}
                allowClear
              />
            </Col>
            <Col>
              <Button 
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleTopicSearch}
                title="Tìm câu hỏi gợi ý"
              />
            </Col>
          </Row>
          <Row gutter={[8, 8]} align="middle" style={{ marginTop: 8 }}>
            <Col>
              <Text>Số lượng:</Text>
            </Col>
            <Col>
              <InputNumber 
                min={1} 
                max={20} 
                defaultValue={questionCount} 
                onChange={handleCountChange} 
                style={{ width: 60 }}
              />
            </Col>
            <Col flex="auto">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchRelatedQuestions(customTopic, questionCount)}
                style={{ marginLeft: 8 }}
                title="Làm mới câu hỏi"
              />
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div className="related-questions-content">
          {loadingQuestions ? (
            <div className="related-questions-loading">
              <Spin size="small" />
              <Text className="loading-text">Đang tải câu hỏi gợi ý...</Text>
            </div>
          ) : (
            <List
              size="small"
              dataSource={relatedQuestions}
              renderItem={(item) => (
                <List.Item 
                  className="related-question-item"
                  onClick={() => handleSelectQuestion(item)}
                >
                  <Text className="related-question-text">{item}</Text>
                </List.Item>
              )}
              locale={{ emptyText: "Không có câu hỏi gợi ý" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatWithAi;
