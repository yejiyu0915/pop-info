import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  csrfToken = token || null;
}

api.interceptors.request.use((config) => {
  if (csrfToken && !['get', 'head', 'options'].includes(config.method?.toLowerCase() ?? 'get')) {
    config.headers.set('X-CSRF-Token', csrfToken);
  }
  return config;
});

let interceptorsInitialized = false;

export function setupApiInterceptors(
  clearAuth: () => void,
): void {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; errors?: string[] }>) => {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message ?? 'Unknown error';
      const detail = data?.errors?.find((e) => typeof e === 'string' && e.trim());
      const url = error.config?.url ?? '';
      const isAuthMe = url.includes('/api/auth/me');
      const isAuthLogin = url.includes('/api/auth/login');
      const isRegisterFlow =
        url.includes('/api/auth/send-verification-code') ||
        url.includes('/api/auth/verify-email') ||
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/forgot-password') ||
        url.includes('/api/auth/verify-reset-code') ||
        url.includes('/api/auth/reset-password');

      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          toast.error('요청 시간이 초과되었습니다. 다시 시도해 주세요.');
        } else {
          toast.error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
        }
      } else if (status === 401) {
        if (!isAuthLogin) {
          setCsrfToken(null);
          clearAuth();
          if (!isAuthMe) {
            toast.error('로그인이 필요합니다.');
          }
        }
      } else if (status === 403) {
        toast.error('권한이 없습니다.');
      } else if (status && status >= 500) {
        toast.error('서버 오류가 발생했습니다.');
      } else if (!isRegisterFlow && (detail || (message && message !== 'Unknown error'))) {
        toast.error(detail ?? message);
      }

      return Promise.reject(error);
    },
  );
}
