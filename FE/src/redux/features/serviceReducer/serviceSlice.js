import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteRequest, getRequest, postRequestMultipartFormData, putRequestMultipartFormData } from "@services/api"; // Giả sử bạn có hàm getRequest
import { message } from "antd";
import endPoints from "@routers/router";

// Thunk cho việc lấy dữ liệu dịch vụ
export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequest("/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk cho việc thêm dịch vụ mới (POST)
export const addService = createAsyncThunk(
  "services/addService",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      // formData is already prepared in the component
      const response = await postRequestMultipartFormData("/categories", formData);

      // Thêm dịch vụ mới vào state mà không cần gọi lại API
      dispatch(serviceSlice.actions.addServiceToList(response.data)); 

      return response.data;  // Trả về dữ liệu thành công
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Đã có lỗi xảy ra" });
    }
  }
);

// Thunk cho việc xóa dịch vụ (DELETE)
export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await deleteRequest(`/categories/${id}`);
      dispatch(serviceSlice.actions.removeService(id)); // Loại bỏ dịch vụ khỏi state
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      // data is already a FormData object prepared in the component
      const response = await putRequestMultipartFormData(`/categories/${id}`, data);

      // Cập nhật dữ liệu vào store
      dispatch(serviceSlice.actions.updateServiceInList(response));

      return response.data;
    } catch (error) {
      // Xử lý lỗi trả về từ API
      console.log("error", error);
      return rejectWithValue(error.response?.data || { message: "Đã có lỗi xảy ra" });
    }
  }
)

// Slice cho services
const serviceSlice = createSlice({
  name: "services",
  initialState: {
    services: [],  // Dữ liệu dịch vụ
    isLoading: false,  // Trạng thái loading
    error: null,  // Dữ liệu lỗi (nếu có)
  },
  reducers: {
    addServiceToList: (state, action) => {
      state.services.push(action.payload);  // Thêm dịch vụ mới vào danh sách
    },
    removeService: (state, action) => {
      state.services = state.services.filter(service => service.categoryId !== action.payload);  // Loại bỏ dịch vụ
    },
    updateServiceInList: (state, action) => {
      console.log("check action", action);
      const index = state.services.findIndex(service => service.categoryId === action.payload.categoryid);
      if (index !== -1) {
        state.services[index] = action.payload;  // Cập nhật dịch vụ trong state
      }
    }
  },
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
        state.error = action.payload;  // Lưu lỗi vào store
        message.error(action.payload?.message || "Failed to fetch services");  // Hiển thị lỗi nếu có
      })
      .addCase(addService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.isLoading = false;
        message.success("Service added successfully");
      })
      .addCase(addService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error(action.payload?.message || "Failed to add service");
      })
      .addCase(deleteService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteService.fulfilled, (state) => {
        state.isLoading = false;
        message.success("Dịch vụ đã được xóa thành công.");
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isLoading = false;
        message.error(action.payload?.message || "Không thể xóa dịch vụ.");
      })
      .addCase(updateService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateService.fulfilled, (state) => {
        state.isLoading = false;
        message.success("Dịch vụ đã được cập nhật thành công.");
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isLoading = false;
        message.error(action.payload?.message || "Không thể cập nhật dịch vụ.");
      });
  },
});

export default serviceSlice.reducer;
