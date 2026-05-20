import Cookies from 'js-cookie';
import { api } from '../lib/api/methods';
import { ENDPOINTS } from '@/constants/endpoints.const';

export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'AGENT' | 'OWNER' | 'TENANT';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  profile: {
    full_name: string;
    phone_number: string;
    avatar_url?: string;
  };
}

interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

type RegisterRequest = Record<string, unknown>;

interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export const authApi = {
  register: async (data: RegisterRequest) => {
    return api.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  login: async (data: LoginRequest) => {
    const authData = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);

    // Set cookie for middleware access
    Cookies.set('token', authData.token, { expires: 7 });
    Cookies.set('refresh_token', authData.refresh_token, { expires: 7 });
    Cookies.set('user_role', authData.user.role, { expires: 7 });

    return authData;
  },

  refreshToken: async (refreshToken: string) => {
    const authData = await api.post<LoginResponse>(ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    Cookies.set('token', authData.token, { expires: 7 });
    Cookies.set('refresh_token', authData.refresh_token, { expires: 7 });
    Cookies.set('user_role', authData.user.role, { expires: 7 });

    return authData;
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_role');
    window.location.href = '/login';
  },

  verifyEmail: (token: string) => {
    return api.post<User>(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  forgotPassword: (email: string) => {
    return api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: (data: ResetPasswordRequest) => {
    return api.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  getCurrentUser: () => {
    return api.get<User>(ENDPOINTS.AUTH.ME);
  },
};
