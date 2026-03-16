import { mockUsers } from '../mockUsers';
import { User } from '../types';

const AUTH_KEY = 'auth_user';

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (user.status === 'INACTIVE') {
        throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(AUTH_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }
    
    return null;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
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
    return !!localStorage.getItem(AUTH_KEY);
  }
};
