import { message } from "antd";
import axios from "axios";

let accessToken = localStorage.getItem("accessToken");
let isRefreshing = false;
let refreshSubscribers = [];

export const axiosClientVer2 = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
  },
});

// 📌 Hàm đăng ký subscriber để chờ refresh token xong
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// 📌 Hàm làm mới token
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken"); // Chỉ lấy, không khai báo lại
    if (!refreshToken) throw new Error("No refresh token found!");

    const response = await axios.post(`${import.meta.env.VITE_APP_BASE_URL}/auth/refresh-token`, {
      refreshToken: refreshToken,
    });

 

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

    // Cập nhật token mới vào localStorage
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    accessToken = newAccessToken;

    // Cập nhật token mới cho tất cả request đang đợi
    onRefreshed(newAccessToken);
    isRefreshing = false;
    return newAccessToken;
  } catch (error) {
    isRefreshing = false;
    handleDangXuat();
    message.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.");
    window.location.href = "/login";
    return Promise.reject(error);
  }
}

// 📌 Interceptor request - luôn gắn accessToken vào request
axiosClientVer2.interceptors.request.use(
  (config) => {
    accessToken = localStorage.getItem("accessToken"); // Lấy lại accessToken mới nhất
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 📌 Interceptor response - xử lý lỗi 401 và refresh token
axiosClientVer2.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    if (!response) return Promise.reject(error);

    // 📌 Xử lý thông báo lỗi từ API
    const { status, data } = response;
    const errorMessage = data?.errorMessage || "Có lỗi xảy ra";
    if ([400, 401, 403, 404, 405, 409].includes(status)) {
      message.error(errorMessage);
    }

    // 📌 Kiểm tra lỗi 401 và xử lý refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại

      // Kiểm tra xem liệu có đang làm mới token hay không
      if (isRefreshing) {
        // Nếu có, đợi cho đến khi refresh xong
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            // Cập nhật lại Authorization header
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClientVer2(originalRequest)); // Thực hiện lại request
          });
        });
      }

      // Nếu không đang làm mới token, bắt đầu làm mới
      isRefreshing = true;
      try {
        const newToken = await refreshToken(); // Gọi refresh token
        originalRequest.headers.Authorization = `Bearer ${newToken}`; // Cập nhật lại token
        return axiosClientVer2(originalRequest); // Thực hiện lại request với token mới
      } catch (refreshError) {
        return Promise.reject(refreshError); // Nếu không thể refresh, trả về lỗi
      }
    }

    return Promise.reject(error); // Trả về lỗi nếu không phải lỗi 401
  }
);

// 📌 Hàm xử lý đăng nhập - cập nhật accessToken và refreshToken mới
export const handleDangNhap = (newAccessToken, newRefreshToken) => {
  accessToken = newAccessToken;
  axiosClientVer2.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  localStorage.setItem("accessToken", newAccessToken);
  localStorage.setItem("refreshToken", newRefreshToken);
};

// 📌 Hàm xử lý đăng xuất - xóa token và redirect
export const handleDangXuat = () => {
  localStorage.clear();
  accessToken = null;
  axiosClientVer2.defaults.headers.common["Authorization"] = undefined;
};
