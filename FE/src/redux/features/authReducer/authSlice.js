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

// Slice cho auth
const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: null,
    fullName: null,
    phoneNumber: null,
    rewardpoints: null,
    role: false,
    refreshToken: null,
  },
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.fullName = null;
      state.phoneNumber = null;
      state.rewardpoints = null;
      state.role = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        const data  = action.payload;
        console.log("check login", data);
        state.user = {
          userId: data.userId,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          rewardpoints: data.rewardpoints,
        };
        state.accessToken = data.token;
        state.refreshToken = data.refreshToken;
        state.role = data.role;
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        state.isLoading = false;

        // Set redirectPath based on role
        switch (data.role) {
          case "Admin":
            state.redirectPath = endPoints.ADMIN;
            break;
          case "Hr":
            state.redirectPath = `${endPoints.QUANLYINTERN}/${endPoints.DANHSACHINTERN}`;
            break;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        message.error(action.payload?.message || "Login failed");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
