// src/redux/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderedChoosen: [],
  selectedDriver: null,
  orderedChoosenReceivered: [],
  selectedStaff: null
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
    setOrderedChoosenReceivered: (state, action) => {
      state.orderedChoosenReceivered = action.payload;
    },
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload;  // Lưu staff đã chọn
    },
  },
});

export const { setOrderedChoosen, setSelectedDriver, setOrderedChoosenReceivered,  setSelectedStaff} = orderSlice.actions;
export default orderSlice.reducer;
