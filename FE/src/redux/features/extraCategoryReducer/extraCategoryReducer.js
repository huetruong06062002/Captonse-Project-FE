import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import { message } from "antd";
import { getRequest } from '@services/api';

// Thunk để lấy danh sách extra categories
export const getExtraCategories = createAsyncThunk(
  "extraCategories/getExtraCategories",
  async (_, { rejectWithValue, getState }) => {
    try {
      ///extra-categories
      const { auth } = getState();
      const response = await getRequest("/extra-categories");
      return response.data; // Trả về dữ liệu
    } catch (error) {
      return rejectWithValue(error.response.data); // Trả về lỗi nếu có
    }
  }
);

// Thunk để tạo mới một extra category
export const createExtraCategory = createAsyncThunk(
  "extraCategories/createExtraCategory",
  async (name, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();

      console.log("check auth", auth);
      const response = await axiosClientVer2.post(
        "/extra-categories",
        {
          name,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      message.success("Tạo dịch vụ thành công");
      return response.data; // Trả về dữ liệu khi tạo thành công
    } catch (error) {
      return rejectWithValue(error.response.data); // Trả về lỗi nếu có
    }
  }
);

// Thunk để xóa extra category
export const deleteExtraCategory = createAsyncThunk(
  "extraCategories/deleteExtraCategory",
  async (extraCategoryId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axiosClientVer2.delete(
        `/extra-categories/${extraCategoryId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      return extraCategoryId; // Trả về ID của category đã xóa
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
      // Case cho lấy danh sách extra-categories
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
      })
      // Case cho tạo extra-category
      .addCase(createExtraCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExtraCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload); // Thêm extra category mới vào state
      })
      .addCase(createExtraCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error("Failed to create extra category");
      })
      // Case cho xóa extra-category
      .addCase(deleteExtraCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteExtraCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(
          (category) => category.extraCategoryId !== action.payload
        ); // Xóa category khỏi state
        message.success("Extra category deleted successfully!");
      })
      .addCase(deleteExtraCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error("Failed to delete extra category");
      });
  },
});

export default extraCategoriesSlice.reducer;
