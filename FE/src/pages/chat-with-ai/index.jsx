import React, { useState } from "react";
import { Input, Button, message, Card } from "antd";
import axios from "axios";
import { axiosClientVer2 } from '../../config/axiosInterceptor';


const { TextArea } = Input;

function ChatWithAi() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
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

      console.log("check res",typeof res.data);

     // Nếu res.data là chuỗi, cần parse thành object
     const parsedData = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

     if (parsedData?.choices?.[0]?.message?.reasoning) {
       // Lấy reasoning từ dữ liệu trả về
       setResponse(parsedData.choices[0].message.reasoning);
       message.success("AI trả lời thành công");
     } else {
       message.error("Không tìm thấy reasoning trong phản hồi");
     }
    } catch (error) {
      message.error("Error calling API");
      console.error("API Error: ", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      <Card title="Chat với AI hỗ trợ" bordered={false} style={{ width: "100%" }}>
        <TextArea
          rows={4}
          placeholder="Ask something..."
          value={query}
          onChange={handleInputChange}
        />
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          style={{ marginTop: "10px" }}
        >
          Gửi
        </Button>
        {response && (
          <div style={{ marginTop: "20px" }}>
            <Card title="AI Response" bordered={true}>
              <p>{response}</p>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ChatWithAi;
