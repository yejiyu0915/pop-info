import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AppFooter } from '@/components/layout/AppFooter';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'POPCAST',
  description: '팝업 큐레이션 플랫폼 POPCAST',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          {children}
          <AppFooter />
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
