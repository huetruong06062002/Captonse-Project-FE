import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteRequest, getRequest, postRequestMultipartFormData, putRequestMultipartFormData } from "@services/api"; // Giả sử bạn có hàm getRequest
import { message } from "antd";
import endPoints from "@routers/router";

// Thunk cho việc lấy dữ liệu dịch vụ
export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequest("/Service/services");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk cho việc thêm dịch vụ mới (POST)
export const addService = createAsyncThunk(
  "services/addService",
  async (newService, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("Name", newService.name);
      formData.append("Icon", newService.icon);  // Icon phải là file (từ input file)
      
      const response = await postRequestMultipartFormData("/Service/services", formData);

      // Thêm dịch vụ mới vào state mà không cần gọi lại API
      dispatch(serviceSlice.actions.addServiceToList(response.data)); 

      return response.data;  // Trả về dữ liệu thành công
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk cho việc xóa dịch vụ (DELETE)
export const deleteService = createAsyncThunk(
  "services/deleteService",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await deleteRequest(`/Service/services${id}`);
      dispatch(serviceSlice.actions.removeService(id)); // Loại bỏ dịch vụ khỏi state
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateService = createAsyncThunk(
  "services/updateService",
  async ({ id, updatedService }, { dispatch, rejectWithValue }) => {
    console.log("updatedService", updatedService);  // Kiểm tra dữ liệu truyền vào
    try {
      // Tạo đối tượng FormData
      const formData = new FormData();
      
      // Append các tham số vào FormData
      if (updatedService.name) formData.append("Name", updatedService.name);
      if (updatedService.icon) formData.append("Icon", updatedService.icon);  // Nếu có icon thì thêm vào FormData

      // Truyền formData vào hàm putRequestMultipartFormData
      const response = await putRequestMultipartFormData(`/Service/services${id}`, {}, formData);

      // Cập nhật dịch vụ trong store
      dispatch(serviceSlice.actions.updateServiceInList(response.data)); 
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
  reducers: {
    addServiceToList: (state, action) => {
      state.services.push(action.payload);  // Thêm dịch vụ mới vào danh sách
    },
    removeService: (state, action) => {
      state.services = state.services.filter(service => service.categoryid !== action.payload);  // Loại bỏ dịch vụ
    },
    updateServiceInList: (state, action) => {
      const index = state.services.findIndex(service => service.categoryid === action.payload.categoryid);
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
