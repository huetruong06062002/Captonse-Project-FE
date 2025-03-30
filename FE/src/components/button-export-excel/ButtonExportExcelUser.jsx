import React, { useState } from "react";
import { Button } from "antd";
import * as XLSX from "xlsx";

const ButtonExportExcelUser = () => {
  const [loading, setLoading] = useState(false);
  const downloadExcel = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://laundryserviceapi.azurewebsites.net/api/Excels/export", {
        method: "GET",
        headers: {
          accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải file");
      }

      const arrayBuffer = await response.arrayBuffer(); // Lấy dữ liệu dạng ArrayBuffer
      const data = new Uint8Array(arrayBuffer); // Chuyển đổi dữ liệu thành Uint8Array

      // Đọc dữ liệu thành workbook sử dụng thư viện xlsx
      const workbook = XLSX.read(data, { type: "array" });

      // Lấy worksheet đầu tiên
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log("worksheet", worksheet);

      // Danh sách các cột cần chỉnh style (A1 đến H1)
      const columns = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1"];

      // Style áp dụng cho các ô
      const headerStyle = {
        fill: { fgColor: { rgb: "6495ED" } }, // Màu nền xanh
        font: { bold: true, color: { rgb: "FFFFFF" } }, // Chữ trắng, in đậm
        alignment: { horizontal: "center" }, // Căn giữa
      };

      // Áp dụng style cho từng ô trong danh sách
      columns.forEach((col) => {
        if (worksheet[col]) {
          worksheet[col].s = headerStyle;
        }
      });

      // Để căn chỉnh các cột
      worksheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
      ]; // Thiết lập chiều rộng cho các cột

      // Tạo một file Excel và bắt đầu tải về
      XLSX.writeFile(workbook, "Users.xlsx");
    } catch (error) {
      console.error("Lỗi khi tải file Excel:", error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <Button onClick={downloadExcel} type="primary" loading={loading}>
      Xuất Excel
    </Button>
  );
};

export default ButtonExportExcelUser;
