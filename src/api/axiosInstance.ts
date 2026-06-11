import axios, { type InternalAxiosRequestConfig } from 'axios';
import i18n from '@/src/i18n';
import { authService } from '@/src/auth/services/authService';
import { getOrCreateSessionId } from '../utils/session';
import { api_url } from './constants';

// ─── Axios Instance ───
const api = axios.create({
  baseURL: `${api_url}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CLIENT_LANG_PARAM_MAP: Record<string, string> = {
  vi: 'vie',
  'vi-vn': 'vie',
  en: 'en',
  zh: 'zh',
  'zh-cn': 'zh',
  'zh-tw': 'zh',
};

const isAdminContext = () => {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname;
  return pathname.startsWith('/quan-tri') || pathname === '/login';
};

const getClientLangParam = () => {
  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'vi').toLowerCase();
  const baseLanguage = currentLanguage.split('-')[0];

  return CLIENT_LANG_PARAM_MAP[currentLanguage] || CLIENT_LANG_PARAM_MAP[baseLanguage] || 'vie';
};

const getLangParam = () => (isAdminContext() ? 'vie' : getClientLangParam());

const attachClientLangParam = (config: InternalAxiosRequestConfig) => {
  if (typeof config.url === 'string' && /(?:\?|&)lang=/.test(config.url)) return;

  const lang = getLangParam();

  if (config.params instanceof URLSearchParams) {
    if (!config.params.has('lang')) {
      config.params.set('lang', lang);
    }
    return;
  }

  if (config.params?.lang) return;

  config.params = {
    ...(config.params || {}),
    lang,
  };
};

// ─── Request Interceptor: Tự gắn token ───
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const sessionId = getOrCreateSessionId();
    config.headers['x-session-id'] = sessionId;
    attachClientLangParam(config);

    // Nếu payload là FormData (upload file), xóa Content-Type
    // để trình duyệt tự set multipart/form-data kèm boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Xử lý lỗi chung ───
api.interceptors.response.use(
  (response) => response.data, // Trả về data luôn, không cần .data
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token hết hạn → logout
      authService.logout();
      window.location.href = '/login';
    }

    // Trả về error message từ server hoặc message mặc định
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Đã xảy ra lỗi. Vui lòng thử lại.';

    return Promise.reject(new Error(message));
  }
);

export default api;
