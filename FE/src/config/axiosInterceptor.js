import { message } from "antd";
import axios from "axios";

let accessToken = localStorage.getItem("accessToken");
let isRefreshing = false;
let refreshPromise = null;

export const axiosClientVer2 = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
  },
});

async function refreshToken() {
  try {
    const response = await axiosClientVer2.post("auth/refresh-token", {
      accessToken,
    });
    accessToken = response.data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    isRefreshing = false;
    refreshPromise = null;
    return accessToken;
  } catch (error) {
    console.error("Refresh token failed", error);
    throw error;
  }
}

axiosClientVer2.interceptors.request.use(
  (config) => {
    accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClientVer2.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log("🚀 ~ Response in Error (in axiosClientVer2):", error);
    if (error.response.status === 400) {
      message.error(error.response.data.errorMessage);
    }
    if (error.response.status === 401) {
      message.error(error.response.data.errorMessage);
    }
    if (error.response.status === 409) {
      message.error(error.response.data.errorMessage);
    }
    if (error.response.status === 403) {
      message.error(
        error.response.data.errorMessage ||
          "Tài khoản này không có quyền thực hiện hành động này!!"
      );
    }
    if (error.response.status === 404) {
      message.error(
        error.response.data.errorMessage || "Không tìm thấy dữ liệu"
      );
    }
    if (error.response.status === 405) {
      message.error(error.response.data.errorMessage || "Lỗi ");
    }
    const refreshToken_current = localStorage.getItem("refreshToken");
    const originalRequest = error.config;
    if (refreshToken_current) {
      if (error.response.status === 401 && !originalRequest._retry) {
        console.log("Start get RefreshToken!");
        if (!isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;
          try {
            const newToken = await refreshToken();
            console.log("newToken", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClientVer2(originalRequest);
          } catch (refreshError) {
            handleDangXuat();
            message.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        } else {
          if (!refreshPromise) {
            refreshPromise = refreshToken();
          }
          return refreshPromise.then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosClientVer2(originalRequest);
          });
        }
      }
      return Promise.reject(error);
    } else {
      return Promise.reject(error);
    }
  }
);

export const handleDangNhap = (newToken) => {
  accessToken = newToken;
  axiosClientVer2.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${accessToken}`;
  localStorage.setItem("accessToken", accessToken);
};

export const handleDangXuat = () => {
  localStorage.clear();
  accessToken = null;
  axiosClientVer2.defaults.headers.common["Authorization"] = undefined;
};
