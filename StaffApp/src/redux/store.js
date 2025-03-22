import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/features/authReducer/authSlice';
import { createLogger } from 'redux-logger';

// Tạo instance của logger
const logger = createLogger({
  level: 'info',
  collapsed: true,  // Cấu hình để các log actions bị thu gọn, giúp dễ đọc
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger), // Thêm Redux Logger vào middleware
});