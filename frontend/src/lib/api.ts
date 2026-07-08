import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let interceptorsInitialized = false;

export function setupApiInterceptors(
  clearAuth: () => void,
): void {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
      const status = error.response?.status;
      const message = error.response?.data?.message ?? 'Unknown error';
      const url = error.config?.url ?? '';
      const isAuthMe = url.includes('/api/auth/me');

      if (status === 401) {
        clearAuth();
        if (!isAuthMe) {
          toast.error('로그인이 필요합니다.');
        }
      } else if (status === 403) {
        toast.error('권한이 없습니다.');
      } else if (status && status >= 500) {
        toast.error('서버 오류가 발생했습니다.');
      } else if (message && message !== 'Unknown error') {
        toast.error(message);
      }

      return Promise.reject(error);
    },
  );
}
