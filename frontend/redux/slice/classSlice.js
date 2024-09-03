// features/class/classSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentClassId: null,
};

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    setCurrentClassId(state, action) {
      state.currentClassId = action.payload;
    },
  },
});

export const { setCurrentClassId } = classSlice.actions;
export default classSlice.reducer;