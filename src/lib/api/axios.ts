import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  token: string;
  refresh_token: string;
  user: {
    role: string;
  };
};

let refreshPromise: Promise<RefreshResponse> | null = null;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'The server took too long to respond. Please try again.';
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const refreshToken = Cookies.get('refresh_token');
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      refreshToken
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            })
            .then((response) => response.data?.data as RefreshResponse)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const authData = await refreshPromise;

        if (!authData?.token || !authData?.refresh_token || !authData?.user?.role) {
          throw new Error('Invalid refresh response');
        }

        Cookies.set('token', authData.token, { expires: 7 });
        Cookies.set('refresh_token', authData.refresh_token, { expires: 7 });
        Cookies.set('user_role', authData.user.role, { expires: 7 });
        originalRequest.headers.Authorization = `Bearer ${authData.token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        Cookies.remove('token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_role');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
