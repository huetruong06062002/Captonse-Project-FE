import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postRequest } from "@services/api";
import { message } from "antd";
import endPoints from "@routers/router";

// Thunk cho đăng nhập
export const login = createAsyncThunk(
  "auth/login",
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      const response = await postRequest("/Auth/login", {
        phoneNumber,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Helper function để load initial state từ localStorage
const loadAuthFromStorage = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const fullName = localStorage.getItem("fullName");
    const phoneNumber = localStorage.getItem("phoneNumber");
    const image = localStorage.getItem("image");
    
    if (accessToken) {
      return {
        accessToken,
        refreshToken,
        role,
        user: {
          userId,
          fullName,
          phoneNumber,
        },
        image,
      };
    }
  } catch (error) {
    console.error("Error loading auth from storage:", error);
  }
  return {};
};

// Slice cho auth
const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: null,
    fullName: null,
    phoneNumber: null,
    rewardpoints: null,
    role: null,
    image: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    ...loadAuthFromStorage(),
  },
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.fullName = null;
      state.phoneNumber = null;
      state.rewardpoints = null;
      state.role = null;
      state.image = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        const data = action.payload;
        console.log("🔑 Login success:", data);
        
        state.user = {
          userId: data.userId,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          rewardpoints: data.rewardpoints,
        };
        state.accessToken = data.token;
        state.refreshToken = data.refreshToken;
        state.role = data.role;
        state.image = data.image;
        
        // Persist to localStorage
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("phoneNumber", data.phoneNumber);
        if (data.image) localStorage.setItem("image", data.image);
        
        state.isLoading = false;

        // Set redirectPath based on role
        switch (data.role) {
          case "Admin":
            state.redirectPath = endPoints.ALL;
            break;
          case "Hr":
            state.redirectPath = `${endPoints.QUANLYINTERN}/${endPoints.DANHSACHINTERN}`;
            break;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error(action.payload?.message || "Sai số điện thoại hoặc mật khẩu");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
