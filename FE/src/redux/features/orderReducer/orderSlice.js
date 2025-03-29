// src/redux/features/orderReducer/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@services/api";
import { message } from "antd";

// Thunk gọi API lấy danh sách đơn hàng
export const fetchAllOrders = createAsyncThunk(
  "order/fetchAllOrders",
  async ({ status = "", page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (status) query.append("status", status);
      query.append("page", page);
      query.append("pageSize", pageSize);

      const response = await getRequest(`/orders/all-orders?${query.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Lỗi không xác định" });
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    isLoading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,

    // ✅ Các state cũ vẫn giữ nguyên
    orderedChoosen: [],
    selectedDriver: null,
    orderedChoosenReceivered: [],
    selectedStaff: null
  },
  reducers: {
    setOrderedChoosen: (state, action) => {
      state.orderedChoosen = action.payload;
    },
    setSelectedDriver: (state, action) => {
      state.selectedDriver = action.payload;
    },
    setOrderedChoosenReceivered: (state, action) => {
      state.orderedChoosenReceivered = action.payload;
    },
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;        // ✅ Mảng đơn hàng
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error(action.payload?.message || "Không thể tải đơn hàng");
      });
  }
});

// ✅ Export đầy đủ action cũ
export const {
  setOrderedChoosen,
  setSelectedDriver,
  setOrderedChoosenReceivered,
  setSelectedStaff
} = orderSlice.actions;

export default orderSlice.reducer;
