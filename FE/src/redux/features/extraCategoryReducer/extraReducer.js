import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { message } from "antd";
import { axiosClientVer2 } from "../../../config/axiosInterceptor";
import { postRequestMultipartFormData, putRequestMultipartFormData } from '@services/api';

// Thunk để lấy thông tin chi tiết về một Extra
export const getExtraDetails = createAsyncThunk(
  "extras/getExtraDetails",
  async (extraId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axiosClientVer2.get(`/extras/${extraId}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk để xóa Extra theo ID
export const deleteExtra = createAsyncThunk(
  "extras/deleteExtra",
  async (extraId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axiosClientVer2.delete(`/extras/${extraId}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
      message.success("Dịch vụ đã được xóa thành công");
      return extraId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk để tạo mới một Extra
export const createExtra = createAsyncThunk(
  "extras/createExtra",
  async (extraData, { rejectWithValue, getState }) => {
    try {
      const response = await postRequestMultipartFormData("/extras", extraData, {});
      // message.success("Dịch vụ đã được tạo thành công");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk để cập nhật Extra
export const updateExtra = createAsyncThunk(
  "extras/updateExtra",
  async (extraData, { rejectWithValue, getState }) => {
    try {

      // Tạo đối tượng FormData
      const formData = new FormData();
      formData.append("ExtraId", extraData.extraId);
      formData.append("Name", extraData.name);
      formData.append("Price", extraData.price);
      formData.append("Description", extraData.description);

      // Nếu có ảnh, thêm vào formData
      if (extraData.imageUrl) {
        formData.append("Image", extraData.imageUrl);
      }

      // Gửi PUT request với formData
      const response = await putRequestMultipartFormData("/extras", formData, {}, null);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice cho extras
const extrasSlice = createSlice({
  name: "extras",
  initialState: {
    extras: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Case cho lấy thông tin chi tiết extra
      .addCase(getExtraDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.extras = state.extras.map((extra) =>
          extra.extraId === action.payload.extraId ? action.payload : extra
        );
      })
      .addCase(getExtraDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Case cho xóa extra
      .addCase(deleteExtra.fulfilled, (state, action) => {
        state.isLoading = false;
        state.extras = state.extras.filter(
          (extra) => extra.extraId !== action.payload
        );
        message.success("Dịch vụ đã được xóa thành công");
      })
      .addCase(deleteExtra.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Case cho tạo mới extra
      .addCase(createExtra.fulfilled, (state, action) => {
        state.isLoading = false;
        state.extras.push(action.payload);
        // message.success("Dịch vụ đã được tạo thành công");
      })
      .addCase(createExtra.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Case cho cập nhật extra
      .addCase(updateExtra.fulfilled, (state, action) => {
        state.isLoading = false;
        state.extras = state.extras.map((extra) =>
          extra.extraId === action.payload.extraId ? action.payload : extra
        );
        message.success("Dịch vụ đã được cập nhật thành công");
      })
      .addCase(updateExtra.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default extrasSlice.reducer;
