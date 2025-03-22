

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  userId: null,
  fullName: null,
  phoneNumber: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, userId, fullName, phoneNumber, role } = action.payload;
      state.token = token;
      state.userId = userId;
      state.fullName = fullName;
      state.phoneNumber = phoneNumber;
      state.role = role;
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.fullName = null;
      state.phoneNumber = null;
      state.role = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
