import React, { useState, useEffect } from "react";
import { Table, Avatar, Button, Image, Tag } from "antd";
import { axiosClientVer2 } from "../../config/axiosInterceptor";

function Users() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosClientVer2.get("/users");
        setUsers(response.data.data); // Assuming the response body is as per your provided example
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Active") return "green";
    if (status === "Deleted") return "red";
    return "blue";
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => <Image src={avatar} width={"3rem"} />,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (email ? email : "Not Provided"),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Date Created",
      dataIndex: "dateCreated",
      key: "dateCreated",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }} // Blue button
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    // Handle viewing user details logic here
    console.log("User details:", record);
  };

  return (
    <div>
      <h2>Users</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="userId"
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        rowClassName={(record, index) =>
          index % 2 === 0 ? "ant-table-row-light" : "ant-table-row-dark"
        } // Adding alternate row colors
      />
    </div>
  );
}

export default Users;
