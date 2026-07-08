'use client';

import { useEffect } from 'react';
import { setupApiInterceptors } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    setupApiInterceptors(clearAuth);
    checkAuth();
  }, [checkAuth, clearAuth]);

  return <>{children}</>;
}
