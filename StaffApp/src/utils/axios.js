// src/utils/axios.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Tạo instance Axios
const axiosInstance = axios.create({
  baseURL: 'https://laundryserviceapi.azurewebsites.net/api', // URL gốc của API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để gửi token (nếu có) trong header của request
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy token từ AsyncStorage thay vì localStorage
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Thêm token vào header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
axiosInstance.interceptors.response.use(
  async (response) => {
    // Kiểm tra nếu có dữ liệu token trong response và lưu vào AsyncStorage
    if (response.data.token) {
      // Lưu các giá trị vào AsyncStorage
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('userId', response.data.userId);
      await AsyncStorage.setItem('fullName', response.data.fullName);
      await AsyncStorage.setItem('phoneNumber', response.data.phoneNumber);
      await AsyncStorage.setItem('role', response.data.role);
      await AsyncStorage.setItem('rewardpoints', String(response.data.rewardpoints)); // Chuyển rewardpoints thành string để lưu vào AsyncStorage

      // Nếu bạn sử dụng Redux, có thể dispatch action để lưu token và các dữ liệu vào store (nếu cần)
      // dispatch(setCredentials({
      //   token: response.data.token,
      //   userId: response.data.userId,
      //   fullName: response.data.fullName,
      //   phoneNumber: response.data.phoneNumber,
      //   role: response.data.role,
      // }));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
