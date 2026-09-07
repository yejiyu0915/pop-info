'use client';

import Link from 'next/link';
import { toast } from 'sonner';

export function AppFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link href="/" className="footer__logo">
            POPCAST
          </Link>
          <p className="footer__caption">
            성수부터 홍대까지, 지금 열려 있는 팝업을 감도 있게 큐레이션합니다.
          </p>
        </div>
        <div className="footer__meta">
          <nav className="footer__links" aria-label="약관">
            <button
              type="button"
              className="footer__link"
              onClick={() => toast.info('이용약관 페이지는 준비 중입니다.')}
            >
              이용약관
            </button>
            <button
              type="button"
              className="footer__link"
              onClick={() => toast.info('개인정보처리방침 페이지는 준비 중입니다.')}
            >
              개인정보처리방침
            </button>
          </nav>
          <p className="footer__copy">Copyright 2026 POPCAST.</p>
        </div>
      </div>
    </footer>
  );
}
