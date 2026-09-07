import { api } from '@/lib/api';

interface SendVerificationCodePayload {
  email: string;
  password: string;
  name: string;
}

interface VerifyEmailPayload {
  email: string;
  code: string;
}

interface RegisterPayload {
  email: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface VerifyResetCodePayload {
  email: string;
  code: string;
}

interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

interface RegisterResponse {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
}

export async function sendVerificationCode(payload: SendVerificationCodePayload) {
  const { data } = await api.post<{ message: string }>('/api/auth/send-verification-code', payload);
  return data;
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const { data } = await api.post<{ verified: boolean }>('/api/auth/verify-email', payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<RegisterResponse>('/api/auth/register', payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const { data } = await api.post<{ message: string }>('/api/auth/forgot-password', payload);
  return data;
}

export async function verifyResetCode(payload: VerifyResetCodePayload) {
  const { data } = await api.post<{ verified: boolean }>('/api/auth/verify-reset-code', payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await api.post<{ message: string }>('/api/auth/reset-password', payload);
  return data;
}
