import { Button, Space, Popconfirm } from "antd";
import React from "react";

const ButtonsComponent = ({ buttons = [] }) => {
  return (
    <Space>
      {buttons.map((btn, index) => {
        if (btn.render) {
          return <div key={index}>{btn.render()}</div>;
        }
        return (
          <Button
            key={index}
            type={btn.type || "default"}
            style={btn.style}
            onClick={btn.onClick}
            danger={btn.danger}
            icon={btn.icon}
            disabled={btn.disabled}
          >
            {btn.label}
          </Button>
        );
      })}
    </Space>
  );
};

export default ButtonsComponent;
