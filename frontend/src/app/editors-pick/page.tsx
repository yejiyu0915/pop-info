'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { EDITORIAL_ARTICLES } from '@/lib/editorial';

export default function EditorsPickIndexPage() {
  return (
    <main className="home page-shell">
      <AppHeader />
      <div className="container editors-page">
        <header className="editors-page__intro">
          <h1 className="home__section-title">Editor&apos;s Pick</h1>
          <p className="editors-page__lead">
            에디터가 고른 기획전·후기·루트 노트를 모았습니다. (모킹 콘텐츠)
          </p>
        </header>

        <ul className="editors-page__list">
          {EDITORIAL_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link href={`/editors-pick/${article.slug}`} className="editors-page__card">
                <div className="editors-page__thumb" aria-hidden />
                <div className="editors-page__body">
                  <span className="editors-page__meta">{article.meta}</span>
                  <h2 className="editors-page__title">{article.title}</h2>
                  <p className="editors-page__brief">{article.briefing}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
