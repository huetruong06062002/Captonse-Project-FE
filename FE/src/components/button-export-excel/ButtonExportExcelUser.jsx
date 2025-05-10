import React, { useState } from "react";
import { Button, message, Modal } from "antd";
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import * as XLSX from "xlsx";
import { axiosClientVer2 } from '../../config/axiosInterceptor'

const ButtonExportExcelUser = () => {
  const [loading, setLoading] = useState(false);

  // Hàm sinh dữ liệu mẫu trong trường hợp API không hoạt động
  const generateSampleUserData = () => {
    return [
      {
        UserId: "U001",
        "Họ tên": "Nguyễn Văn A",
        "Trạng thái": "Active",
        "Vai trò": "Admin",
        "Hình ảnh": "Chưa có hình ảnh",
        "Ngày sinh": "1990-01-01",
        "Giới tính": "Male",
        "Số điện thoại": "0912345678"
      },
      {
        UserId: "U002",
        "Họ tên": "Trần Thị B",
        "Trạng thái": "Deleted",
        "Vai trò": "Staff",
        "Hình ảnh": "Chưa có hình ảnh",
        "Ngày sinh": "1995-02-02",
        "Giới tính": "Female",
        "Số điện thoại": "0923456789"
      }
    ];
  };

  const convertDateFormat = (dateString) => {
    if (!dateString || dateString === "Chưa có ngày sinh") return "Chưa có ngày sinh";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD to match backend
    } catch {
      return dateString;
    }
  };

  const fetchUsersAndCreateExcel = async () => {
    setLoading(true);
    try {
      // 1. Lấy dữ liệu người dùng từ API
      let userData = [];
      try {
        const response = await fetch("https://laundry.vuhai.me/api/Excels/export-excel-users", {
          method: "GET",
          headers: {
            accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
        console.log(response)
        // if (response.data && Array.isArray(response.data)) {
        //   userData = response.data;
        // } else {
        //   throw new Error("Định dạng dữ liệu không đúng");
        // }
      } catch (apiError) {
        // console.error("Lỗi khi lấy dữ liệu từ API:", apiError);
        // message.warning("Không thể lấy dữ liệu từ server, sử dụng dữ liệu mẫu");
        // userData = generateSampleUserData();
      }

      // 2. Chuyển đổi dữ liệu thành định dạng phù hợp cho Excel
      const excelData = userData.map(user => ({
        UserId: user.UserId || user.userId || "",
        "Họ tên": user["Họ tên"] || user.fullName || user.fullname || "",
        "Trạng thái": user["Trạng thái"] || user.status || "",
        "Vai trò": user["Vai trò"] || user.role || "",
        "Hình ảnh": user["Hình ảnh"] || user.avatar || "Chưa có hình ảnh",
        "Ngày sinh": convertDateFormat(user["Ngày sinh"] || user.dob),
        "Giới tính": user["Giới tính"] || user.gender || "",
        "Số điện thoại": user["Số điện thoại"] || user.phoneNumber || user.phonenumber || ""
      }));

      // 3. Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      // 4. Định dạng worksheet
      // Thiết lập chiều rộng cột
      const columnWidths = [
        { wch: 36 }, // UserId
        { wch: 25 }, // Họ tên
        { wch: 10 }, // Trạng thái
        { wch: 15 }, // Vai trò
        { wch: 50 }, // Hình ảnh
        { wch: 15 }, // Ngày sinh
        { wch: 10 }, // Giới tính
        { wch: 15 }  // Số điện thoại
      ];
      worksheet['!cols'] = columnWidths;

      // 5. Xuất file Excel
      XLSX.writeFile(workbook, "Users.xlsx");
      
      message.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo file Excel:", error);
      Modal.error({
        title: 'Lỗi khi xuất Excel',
        content: 'Không thể tạo file Excel. Vui lòng thử lại sau hoặc liên hệ quản trị viên.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={fetchUsersAndCreateExcel} 
      type="primary" 
      loading={loading}
      style={{ 
        backgroundColor: '#52c41a',
        borderColor: '#52c41a',
        borderRadius: '6px',
        padding: '0 20px',
        height: '40px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 2px 0 rgba(82, 196, 26, 0.1)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '&:hover': {
          backgroundColor: '#73d13d',
          borderColor: '#73d13d',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(82, 196, 26, 0.2)'
        },
        '&:active': {
          backgroundColor: '#389e0d',
          borderColor: '#389e0d',
          transform: 'translateY(0)',
          boxShadow: '0 2px 0 rgba(82, 196, 26, 0.1)'
        }
      }}
      icon={loading ? <LoadingOutlined /> : <DownloadOutlined />}
    >
      Xuất Excel Người Dùng
    </Button>
  );
};

export default ButtonExportExcelUser;