import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TUser } from './types';

const DEFAULT_API_URL = 'https://norma.education-services.ru/api';
const URL = process.env.BURGER_API_URL || DEFAULT_API_URL;
const checkResponse = async <T>(res: Response): Promise<T> => {
  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  const isJsonResponse = contentType.includes('application/json');

  if (!isJsonResponse) {
    const error = {
      message:
        'Сервер вернул не JSON. Проверь BURGER_API_URL и доступность API.',
      url: res.url,
      status: res.status,
      contentType,
      bodyPreview: rawText.slice(0, 180)
    };
    return Promise.reject(error);
  }

  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch (parseError) {
    const error = {
      message: 'Не удалось распарсить JSON-ответ сервера',
      url: res.url,
      status: res.status,
      parseError,
      bodyPreview: rawText.slice(0, 180)
    };
    return Promise.reject(error);
  }

  if (res.ok) {
    return data as T;
  }

  return Promise.reject(data);
};

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

export const refreshToken = async (): Promise<TRefreshResponse> => {
  try {
    const res = await fetch(`${URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        token: localStorage.getItem('refreshToken')
      })
    });
    const refreshData = await checkResponse<TRefreshResponse>(res);
    if (!refreshData.success) {
      return Promise.reject(refreshData);
    }
    localStorage.setItem('refreshToken', refreshData.refreshToken);
    setCookie('accessToken', refreshData.accessToken);
    return refreshData;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
) => {
  try {
    const res = await fetch(url, options);
    const data = await checkResponse<T>(res);
    return data;
  } catch (err) {
    if ((err as { message: string }).message === 'jwt expired') {
      const refreshData = await refreshToken();
      if (options.headers) {
        (options.headers as { [key: string]: string }).authorization =
          refreshData.accessToken;
      }
      const res = await fetch(url, options);
      const data = await checkResponse<T>(res);
      return data;
    } else {
      return Promise.reject(err);
    }
  }
};

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

export const getIngredientsApi = async () => {
  try {
    const res = await fetch(`${URL}/ingredients`);
    const data = await checkResponse<TIngredientsResponse>(res);
    if (data?.success) {
      const normalizedIngredients = data.data.filter((item) => {
        const isValid =
          Boolean(item._id) &&
          Boolean(item.name) &&
          Boolean(item.type) &&
          Boolean(item.image);
        return isValid;
      });
      return normalizedIngredients;
    }
    return Promise.reject(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getFeedsApi = async () => {
  try {
    const res = await fetch(`${URL}/orders/all`);
    const data = await checkResponse<TFeedsResponse>(res);
    if (data?.success) {
      return data;
    }
    return Promise.reject(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getOrdersApi = async () => {
  try {
    const data = await fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: getCookie('accessToken')
      } as HeadersInit
    });
    if (data?.success) {
      return data.orders;
    }
    return Promise.reject(data);
  } catch (error) {
    return Promise.reject(error);
  }
};

type TOwner = {
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type TNewOrder = {
  _id: string;
  status: string;
  name: string;
  owner: TOwner;
  createdAt: string;
  updatedAt: string;
  number: number;
  price: number;
};

type TNewOrderResponse = TServerResponse<{
  order: TNewOrder;
  name: string;
}>;

export const orderBurgerApi = async (data: string[]) => {
  try {
    const response = await fetchWithRefresh<TNewOrderResponse>(
      `${URL}/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          authorization: getCookie('accessToken')
        } as HeadersInit,
        body: JSON.stringify({
          ingredients: data
        })
      }
    );
    if (response?.success) {
      return response;
    }
    return Promise.reject(response);
  } catch (error) {
    return Promise.reject(error);
  }
};

type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = async (number: number) => {
  try {
    const res = await fetch(`${URL}/orders/${number}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await checkResponse<TOrderResponse>(res);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const registerUserApi = async (data: TRegisterData) => {
  try {
    const res = await fetch(`${URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const response = await checkResponse<TAuthResponse>(res);
    if (response?.success) return response;
    return Promise.reject(response);
  } catch (error) {
    return Promise.reject(error);
  }
};

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = async (data: TLoginData) => {
  try {
    const res = await fetch(`${URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const response = await checkResponse<TAuthResponse>(res);
    if (response?.success) return response;
    return Promise.reject(response);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const forgotPasswordApi = async (data: { email: string }) => {
  try {
    const res = await fetch(`${URL}/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const response = await checkResponse<TServerResponse<{}>>(res);
    if (response?.success) return response;
    return Promise.reject(response);
  } catch (error) {
    return Promise.reject(error);
  }
};

export const resetPasswordApi = async (data: {
  password: string;
  token: string;
}) => {
  try {
    const res = await fetch(`${URL}/password-reset/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const response = await checkResponse<TServerResponse<{}>>(res);
    if (response?.success) return response;
    return Promise.reject(response);
  } catch (error) {
    return Promise.reject(error);
  }
};

type TUserResponse = TServerResponse<{ user: TUser }>;

export const getUserApi = async () => {
  try {
    const data = await fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
      headers: {
        authorization: getCookie('accessToken')
      } as HeadersInit
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const updateUserApi = async (user: Partial<TRegisterData>) => {
  try {
    const data = await fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: getCookie('accessToken')
      } as HeadersInit,
      body: JSON.stringify(user)
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const logoutApi = async () => {
  try {
    const res = await fetch(`${URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        token: localStorage.getItem('refreshToken')
      })
    });
    const data = await checkResponse<TServerResponse<{}>>(res);
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};
