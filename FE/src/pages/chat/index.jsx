import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Button,
  Input,
  Space,
  List,
  Typography,
  Tooltip,
} from "antd";

const { Search } = Input;

import { SendOutlined } from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

import "./index.css";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useSelector } from "react-redux";
import moment from "moment";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);

  const { user } = useSelector((state) => state.auth);
  console.log("user", user);
  // Kết nối SignalR khi component được mount
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://laundry.vuhai.me/chatHub", {
        withCredentials: false, // Tắt gửi thông tin xác thực
      }) // Không cần `withCredentials`
      .build();

    setConnection(newConnection);

    // Nhận tin nhắn từ server
    newConnection.on("ReceiveMessage", (newMessages) => {
      setMessages(newMessages);
    });

    // Khởi động kết nối SignalR
    newConnection
      .start()
      .catch((err) => console.error("Error while starting connection: ", err));
  }, []);

  console.log("user.userid", user.userId);

  useEffect(() => {
    if (conversationId) {
      // Xóa tin nhắn cũ trước khi tải tin nhắn mới
      setMessages([]); // Reset messages trước khi fetch
      // Chỉ gọi API khi conversationId đã có giá trị
      const fetchMessages = async () => {
        const messagesResponse = await fetch(
          `https://laundry.vuhai.me/api/Conversations/messages/${conversationId}`
        );
        const messagesData = await messagesResponse.json();

        if (messagesData.success) {
          setMessages(messagesData.messages); // Lưu tin nhắn vào state
        } else {
          console.log("No messages found");
        }
      };

      fetchMessages();
    }
  }, [conversationId]); // Chạy lại mỗi khi conversationId thay đổi

  const startConversation = async (receiverId) => {
    console.log("receiverId", receiverId);
    const response = await fetch(
      `https://laundry.vuhai.me/api/Conversations/${receiverId}?currentUserId=${user.userId}`
    );
    const data = await response.json();

    if (!data.exists) {
      console.log("Payload:", {
        userOneId: user.userId,
        userTwoId: receiverId,
      });
      const createResponse = await fetch(
        "https://laundry.vuhai.me/api/Conversations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userOneId: user.userId,
            userTwoId: receiverId,
          }),
        }
      );
      const createData = await createResponse.json();
      setConversationId(createData.conversationId); // Chỉ đặt conversationId sau khi có giá trị

      // Join conversation after setting the conversationId
      connection.invoke("JoinConversation", createData.conversationId);
    } else {
      setConversationId(data.conversationId); // Nếu cuộc trò chuyện đã tồn tại
      connection.invoke("JoinConversation", data.conversationId);
    }
  };

  console.log("conversationId", conversationId);

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (input.trim() && connection && conversationId) {
      // Tạo một đối tượng tin nhắn mới
      const newMessage = {
        user: user.userId, // User gửi tin nhắn
        message: input, // Nội dung tin nhắn
      };

      // Cập nhật tin nhắn vào UI ngay lập tức
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Gửi tin nhắn tới SignalR server
      await connection.invoke(
        "SendMessage",
        user.userId,
        conversationId,
        input
      );

      // Xóa input sau khi gửi
      setInput("");
    }
  };

  console.log("message", messages);

  //get users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Lấy accessToken từ localStorage
        const response = await fetch(
          "https://laundry.vuhai.me/api/users",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`, // Thêm Bearer Token vào header
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log(data);
        setUsers(data.data); // Lưu dữ liệu người dùng vào state
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  console.log("users", users);

  console.log("input", input);

  return (
    <Layout style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
      <Sider
        theme="light"
        className="chat-sider"
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <Text strong style={{ fontSize: "16px" }}>Tin nhắn</Text>
        </div>
        <List
          style={{
            margin: 0,
            padding: "8px 0",
          }}
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(user, index) => (
            <List.Item
              style={{ 
                padding: "10px 16px", 
                cursor: "pointer",
                transition: "background-color 0.3s",
                backgroundColor: activeUserId === user.userId ? "#e6f7ff" : "transparent",
                borderLeft: activeUserId === user.userId ? "3px solid #1890ff" : "3px solid transparent",
              }}
              onClick={() => {
                setActiveUserId(user.userId);
                startConversation(user.userId);
              }}
              className={activeUserId === user.userId ? "active-item" : ""}
            >
              <List.Item.Meta
                avatar={
                  user.avatar ? 
                  <Avatar src={user.avatar} size={42} /> : 
                  <Avatar size={42} style={{ 
                    backgroundColor: user.role === "Staff" ? "#1890ff" : 
                                     user.role === "Driver" ? "#52c41a" : 
                                     "#722ed1",
                    fontSize: "16px",
                    fontWeight: "bold"
                  }}>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </Avatar>
                }
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong style={{ fontSize: "14px" }}>{user.fullName}</Text>
                    {user.role && (
                      <div style={{ 
                        fontSize: "11px", 
                        padding: "2px 8px", 
                        borderRadius: "10px",
                        backgroundColor: user.role === "Staff" ? "#e6f7ff" : 
                                        user.role === "Driver" ? "#f6ffed" : 
                                        "#f9f0ff",
                        color: user.role === "Staff" ? "#1890ff" : 
                               user.role === "Driver" ? "#52c41a" : 
                               "#722ed1",
                        fontWeight: "bold"
                      }}>
                        {user.role}
                      </div>
                    )}
                  </div>
                }
                description={
                  <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>
                    <div style={{ marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontWeight: "500", marginRight: "4px" }}>email:</span> 
                      {user.email != null ? user.email : "Không có"}
                    </div>
                    <div style={{ marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ fontWeight: "500", marginRight: "4px" }}>SĐT:</span> 
                      {user.phoneNumber ? user.phoneNumber : "Chưa cập nhật số điện thoại"}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Sider>
      <Layout style={{ height: "80vh", overflow: "auto", overflowY: "auto" }}>
        <Header style={{ background: "#fff", padding: 0 }}>
          <Menu mode="horizontal" style={{ justifyContent: "center" }}>
            <Menu.Item key="1">Chat</Menu.Item>
          </Menu>
        </Header>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Tin nhắn sẽ được hiển thị ở đây */}
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item
                className={
                  item.userid === user.userId ? "ant-list-item-right" : ""
                } // Tin nhắn của người dùng sẽ hiển thị bên phải
                style={{
                  display: "flex",
                }}
              >
                <Space>
                  <Avatar src={item.avatar} />
                  <div>
                    <Text strong>{item.fullname} </Text>
                    {item.userid === user.userId ? "(Tôi)" : ""}

                    <Tooltip
                      placement="topLeft"
                      title={
                        <>
                          <p style={{ fontSize: "0.8rem", color: "#95a5a6" }}>
                            {" "}
                            {moment(item.creationdate).fromNow()}
                          </p>
                        </>
                      }
                    >
                      <div>{item.message1}</div>
                    </Tooltip>
                  </div>
                </Space>
              </List.Item>
            )}
          />

          <div style={{ width: "100%", marginTop: "auto", paddingTop: "10px" }}>
            <Search
              placeholder="Nhập tin nhắn"
              allowClear
              enterButton="Gửi"
              style={{ width: "100%" }}
              value={input}
              onChange={(e) => setInput(e.target.value)} // Cập nhật giá trị input
              onSearch={sendMessage} // Gọi hàm sendMessage khi nhấn Gửi hoặc Enter
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Chat;
