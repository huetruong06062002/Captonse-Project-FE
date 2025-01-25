import React from "react";
import { InputNumber as AntInputNumber } from "antd";

const InputNumber = (props) => {
  return (
    <AntInputNumber
      {...props}
      formatter={(value) =>
        value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      }
      parser={(value) => value?.toString().replace(/\./g, "")}
      style={{ width: props.width || "100%" }}
      min={props.min || 0}
      addonAfter={props.addonAfter}
      addonBefore={props.addonBefore}
    />
  );
};

export default InputNumber;
