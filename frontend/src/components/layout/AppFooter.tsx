import Link from 'next/link';

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
            <Link href="#" className="footer__link">
              이용약관
            </Link>
            <Link href="#" className="footer__link">
              개인정보처리방침
            </Link>
          </nav>
          <p className="footer__copy">Copyright 2026 POPCAST.</p>
        </div>
      </div>
    </footer>
  );
}
