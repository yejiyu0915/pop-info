'use client';

import Link from 'next/link';
import { Compass, LayoutGrid, LogIn, LogOut, Plus, Sparkles, User, UserPlus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useId, useRef, useState } from 'react';
import { isCreatorOrAbove } from '@/lib/roles';
import { useAuthStore } from '@/store/useAuthStore';

const PRIMARY_NAV = [
  { href: '/', label: '메인', Icon: LayoutGrid },
  { href: '/explore', label: '팝업 탐색', Icon: Compass },
  { href: '/editors-pick', label: "Editor's Pick", Icon: Sparkles },
] as const;

function useHeaderScrolled() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-8px 0px 0px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, scrolled };
}

function navIsActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AppHeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { sentinelRef, scrolled } = useHeaderScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const displayName = user?.name ?? user?.email ?? '사용자';
  const initial = displayName.charAt(0).toUpperCase();
  const showActions = isLoading || !isAuthenticated || isCreatorOrAbove(user?.role);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!profileWrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.refresh();
  };

  return (
    <>
      <div ref={sentinelRef} className="header-sticky-sentinel" aria-hidden />
      <div className={`header-sticky${scrolled ? ' header-sticky--scrolled' : ''}`}>
        <div className="container">
          <header className="header">
            <div className="header__left">
              <Link href="/" className="header__logo">
                POPCAST
              </Link>
              <nav className="header__menu" aria-label="주요 메뉴">
                {PRIMARY_NAV.map(({ href, label, Icon }) => {
                  const isActive = navIsActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`header__menu-link${isActive ? ' header__menu-link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                        <Icon className="icon-line" size={14} strokeWidth={1.5} />
                      </span>
                      <span className="header__menu-text">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="header__right">
              {showActions && (
                <nav className="header__actions" aria-label="계정">
                  {isLoading ? (
                    <span className="header__loading">...</span>
                  ) : isAuthenticated ? (
                    <Link href="/posts/write" className="header__link">
                      <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                        <Plus className="icon-line" size={14} strokeWidth={1.5} />
                      </span>
                      <span className="header__link-text">팝업 등록</span>
                    </Link>
                  ) : (
                    <>
                      <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="header__link">
                        <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                          <LogIn className="icon-line" size={14} strokeWidth={1.5} />
                        </span>
                        <span className="header__link-text">로그인</span>
                      </Link>
                      <Link href="/register" className="header__link">
                        <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                          <UserPlus className="icon-line" size={14} strokeWidth={1.5} />
                        </span>
                        <span className="header__link-text">회원가입</span>
                      </Link>
                    </>
                  )}
                </nav>
              )}

              {isAuthenticated && user && !isLoading && (
                <div className="header__profile-wrap" ref={profileWrapRef}>
                  <button
                    type="button"
                    className="header__profile"
                    aria-label={`${displayName} 계정 메뉴`}
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <span className="header__profile-avatar" aria-hidden>
                      {initial}
                    </span>
                    <span className="header__profile-name" title={displayName}>
                      {displayName}
                    </span>
                  </button>

                  {menuOpen && (
                    <div id={menuId} role="menu" className="header__profile-menu" aria-label="계정 메뉴">
                      <Link
                        href="/mypage"
                        role="menuitem"
                        className="header__profile-menu-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                          <User className="icon-line" size={14} strokeWidth={1.5} />
                        </span>
                        마이페이지
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="header__profile-menu-item"
                        onClick={handleLogout}
                      >
                        <span className="icon-wrapper icon-wrapper--sm" aria-hidden>
                          <LogOut className="icon-line" size={14} strokeWidth={1.5} />
                        </span>
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
        </div>
      </div>
    </>
  );
}

export function AppHeader() {
  return (
    <Suspense
      fallback={
        <div className="header-sticky">
          <div className="container">
            <header className="header">
              <Link href="/" className="header__logo">
                POPCAST
              </Link>
            </header>
          </div>
        </div>
      }
    >
      <AppHeaderInner />
    </Suspense>
  );
}
