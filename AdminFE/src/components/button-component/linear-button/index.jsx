import React from 'react';
import { AntDesignOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Space } from 'antd';
import { createStyles } from 'antd-style';

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `,
}));

const LinearButton = ({ buttons = [] }) => {
  const { styles } = useStyle();
  return (
    <ConfigProvider
      button={{
        className: styles.linearGradientButton,
      }}
    >
      <Space>
        {buttons.map((btn, index) => (
          <Button
            key={index}
            type={btn.type || "primary"}
            size="large"
            style={btn.style}
            onClick={btn.onClick}
            danger={btn.danger}
            icon={btn.icon}
            disabled={btn.disabled}
          >
            {btn.label}
          </Button>
        ))}
      </Space>
    </ConfigProvider>
  );
};

export default LinearButton;