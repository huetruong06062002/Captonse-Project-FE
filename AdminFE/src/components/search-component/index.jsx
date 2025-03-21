import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Collapse, Input, Select, Space } from "antd";
import React, { useState } from "react";
import "./index.css";
import { customFilterOption } from "../../utils/searchFilter";

const SearchComponent = ({ searchFields = [], onSearch }) => {
  const initialSearchValues = searchFields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});

  const [searchValues, setSearchValues] = useState(initialSearchValues);

  const handleInputChange = (key, value) => {
    setSearchValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    onSearch(searchValues);
  };

  const handleClear = () => {
    setSearchValues(initialSearchValues);
    onSearch(initialSearchValues);
  };

  const items = [
    {
      key: "1",
      label: "Tìm kiếm",
      children: (
        <Space align="center" className="searchFieldsContainer">
          {searchFields.map((field, index) => {
            if (field.type === "select") {
              return (
                <Select
                  className="searchField"
                  key={index}
                  style={{ width: 200 }}
                  placeholder={field.placeholder}
                  onChange={(value) => handleInputChange(field.key, value)}
                  value={searchValues[field.key] || undefined}
                  options={field.options}
                  allowClear
                  showSearch
                  filterOption={customFilterOption}
                />
              );
            } else {
              return (
                <Input
                  className="searchField"
                  key={field.key || index}
                  placeholder={field.placeholder}
                  style={{ width: 200 }}
                  value={searchValues[field.key]}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                />
              );
            }
          })}
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
          <Button
            type="default"
            danger
            icon={<CloseOutlined />}
            onClick={handleClear}
          >
            Hủy bỏ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Collapse defaultActiveKey={["1"]} size="small" items={items} />
    </div>
  );
};

export default SearchComponent;
