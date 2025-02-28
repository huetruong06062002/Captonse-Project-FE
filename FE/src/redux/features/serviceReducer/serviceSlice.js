import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRequest } from "@services/api"; // Giả sử bạn có hàm getRequest
import { message } from "antd";
import endPoints from "@routers/router";

// Thunk cho việc lấy dữ liệu dịch vụ
export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequest("/Service/services"); // API endpoint theo ảnh
      return response.data; // Trả về dữ liệu thành công
    } catch (error) {
      return rejectWithValue(error.response.data); // Nếu có lỗi, trả về dữ liệu lỗi
    }
  }
);

// Slice cho services
const serviceSlice = createSlice({
  name: "services",
  initialState: {
    services: [],  // Dữ liệu dịch vụ
    isLoading: false,  // Trạng thái loading
    error: null,  // Dữ liệu lỗi (nếu có)
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;  // Lưu dữ liệu dịch vụ vào store
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Lưu lỗi vào store
        message.error(action.payload?.message || "Failed to fetch services"); // Hiển thị lỗi nếu có
      });
  },
});

export default serviceSlice.reducer;
