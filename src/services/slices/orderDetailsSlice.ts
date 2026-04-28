import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';

type TOrderDetailsState = {
  orderData: TOrder | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderDetailsState = {
  orderData: null,
  isLoading: false,
  error: null
};

export const fetchOrderByNumber = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('orderDetails/fetchByNumber', async (number, { rejectWithValue }) => {
  try {
    const data = await getOrderByNumberApi(number);
    const order = data.orders[0];

    if (!order) {
      return rejectWithValue('Заказ не найден');
    }

    return order;
  } catch (error) {
    return rejectWithValue(
      (error as Error).message || 'Не удалось загрузить заказ'
    );
  }
});

export const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {
    clearOrderData: (state) => {
      state.orderData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.orderData = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.orderData = null;
        state.isLoading = false;
        state.error = action.payload || 'Не удалось получить заказ';
      });
  }
});

export const { clearOrderData } = orderDetailsSlice.actions;
export const orderDetailsReducer = orderDetailsSlice.reducer;
