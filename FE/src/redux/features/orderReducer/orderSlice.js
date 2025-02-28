// src/redux/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderedChoosen: [],
  selectedDriver: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderedChoosen: (state, action) => {
      state.orderedChoosen = action.payload;
    },
    setSelectedDriver: (state, action) => {
      state.selectedDriver = action.payload;  // Lưu tài xế đã chọn
    },
  },
});

export const { setOrderedChoosen, setSelectedDriver } = orderSlice.actions;
export default orderSlice.reducer;
