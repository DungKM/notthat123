import axios from 'axios';
import { api_url } from '@/src/api/constants';
import { User } from '../types';

const AUTH_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

export const authService = {
  login: async (account: string, password: string): Promise<User | null> => {
    try {
      const res = await axios.post(`${api_url}/api/auth/login`, { account, password });

      if (res.data?.success && res.data?.data) {
        const { user, token } = res.data.data;

        if (user.status === 'INACTIVE') {
          throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        // Lưu token và user vào localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));

        return user as User;
      }

      return null;
    } catch (err: any) {
      // Nếu Backend trả message lỗi cụ thể thì ném ra cho LoginPage xử lý
      const msg = err.response?.data?.message || err.message || 'Lỗi khi đăng nhập';
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(AUTH_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_KEY) && !!localStorage.getItem(TOKEN_KEY);
  }
};
