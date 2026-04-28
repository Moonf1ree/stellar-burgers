import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  TLoginData,
  TRegisterData,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi
} from '@api';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';
import { TUser } from '@utils-types';

type TAuthState = {
  user: TUser | null;
  isLoading: boolean;
  isAuthChecked: boolean;
  loginError: string | null;
  registerError: string | null;
  updateUserError: string | null;
};

const initialState: TAuthState = {
  user: null,
  isLoading: false,
  isAuthChecked: false,
  loginError: null,
  registerError: null,
  updateUserError: null
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk<
  TUser,
  TRegisterData,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await registerUserApi(payload);
    saveTokens(data.accessToken, data.refreshToken);
    return data.user;
  } catch (error) {
    return rejectWithValue(
      (error as Error).message || 'Не удалось зарегистрироваться'
    );
  }
});

export const loginUser = createAsyncThunk<
  TUser,
  TLoginData,
  { rejectValue: string }
>('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await loginUserApi(payload);
    saveTokens(data.accessToken, data.refreshToken);
    return data.user;
  } catch (error) {
    return rejectWithValue(
      (error as Error).message || 'Не удалось авторизоваться'
    );
  }
});

export const fetchUser = createAsyncThunk<TUser, void, { rejectValue: string }>(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserApi();
      return data.user;
    } catch (error) {
      return rejectWithValue(
        (error as Error).message || 'Не удалось получить данные пользователя'
      );
    }
  }
);

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('auth/updateUser', async (payload, { rejectWithValue }) => {
  try {
    const data = await updateUserApi(payload);
    return data.user;
  } catch (error) {
    return rejectWithValue(
      (error as Error).message || 'Не удалось обновить данные пользователя'
    );
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      clearTokens();
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Не удалось выйти');
    }
  }
);

export const checkUserAuth = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('auth/checkUserAuth', async (_, { dispatch }) => {
  if (getCookie('accessToken')) {
    await dispatch(fetchUser());
  } else {
    dispatch(setAuthChecked(true));
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.registerError = action.payload || 'Ошибка регистрации';
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginError = action.payload || 'Ошибка входа';
      })
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.updateUserError = action.payload || 'Ошибка обновления профиля';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      });
  }
});

export const { setAuthChecked } = authSlice.actions;
export const authReducer = authSlice.reducer;
