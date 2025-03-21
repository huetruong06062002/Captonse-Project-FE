import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import { message } from "antd";

// Thunk để lấy danh sách extra categories
export const getExtraCategories = createAsyncThunk(
  "extraCategories/getExtraCategories",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axiosClientVer2.get("/extra-categories", {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      return response.data; // Trả về dữ liệu
    } catch (error) {
      return rejectWithValue(error.response.data); // Trả về lỗi nếu có
    }
  }
);

// Slice cho extra-categories
const extraCategoriesSlice = createSlice({
  name: "extraCategories",
  initialState: {
    categories: [], // Dữ liệu categories
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getExtraCategories.pending, (state) => {
        state.isLoading = true; // Đang tải dữ liệu
      })
      .addCase(getExtraCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload; // Lưu dữ liệu vào state
      })
      .addCase(getExtraCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Lưu lỗi nếu có
        message.error("Failed to load extra categories");
      });
  },
});

export default extraCategoriesSlice.reducer;
