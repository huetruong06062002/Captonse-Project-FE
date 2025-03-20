import { Button, Drawer, Space, Spin, message } from "antd";
import { useEffect, useState } from "react";
import TreeServicesDetail from './TreeServicesDetail';
import { axiosClientVer2 } from '../../../config/axiosInterceptor';




export const ServicesDetail = (props) => {
  const { openDrawerDetail, setOpenDrawerDetail, servicesDetail } = props;

  const [serviceDetailFull, setServiceDetailFull] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  // Hàm đóng Drawer
  const onClose = () => {
    setOpenDrawerDetail(false);
  };

  // Hàm lấy dữ liệu chi tiết dịch vụ từ API
  const getServiceDetail = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClientVer2.get(`categories/${servicesDetail.categoryId}`);
      console.log("check response", response.data);
      setServiceDetailFull(response.data); // Cập nhật state với dữ liệu trả về từ API
    } catch (err) {
      setError("Failed to load service details");
      message.error("Failed to load service details");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Khi mở Drawer, gọi API để lấy chi tiết dịch vụ
  useEffect(() => {
    if (openDrawerDetail) {
      getServiceDetail();
    }
  }, [openDrawerDetail]);

  console.log("serviceDetailFull", serviceDetailFull);
  return (
    <>
      <Drawer
        title={
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <strong>Xem chi tiết dịch vụ</strong>
            <p style={{ color: "green" }}>{servicesDetail?.name}</p>
            <img src={servicesDetail?.icon} width={25} alt="" />
          </div>
        }
        placement={"right"}
        onClose={onClose}
        open={openDrawerDetail}
        width={1000}
        extra={
          <Space>
            <Button onClick={onClose}>Đóng</Button>
            <Button type="primary" onClick={onClose}>OK</Button>
          </Space>
        }
      >
        {isLoading ? (
          <Spin tip="Đang xử lý dữ liệu" />
        ) : error ? (
          <p>{error}</p>
        ) : (
          <TreeServicesDetail serviceDetailFull={serviceDetailFull} />
        )}
      </Drawer>
    </>
  );
};
