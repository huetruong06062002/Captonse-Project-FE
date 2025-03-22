import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.username = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectAuth = (state) => state.auth;

export default authSlice.reducer;