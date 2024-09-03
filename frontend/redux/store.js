import { configureStore } from '@reduxjs/toolkit';
import classReducer from './slice/classSlice';

const store = configureStore({
  reducer: {
    class: classReducer,
    // other reducers can be added here
  },
});

export default store;