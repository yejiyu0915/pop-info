'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { ExplorePageContent } from '@/components/posts/ExploreFeed';

export default function ExplorePage() {
  return (
    <main className="home page-shell">
      <AppHeader />
      <div className="container">
        <header className="explore__intro">
          <h1 className="home__section-title">팝업 탐색</h1>
          <p className="explore__lead">지역·카테고리·날짜·혜택 조건으로 원하는 팝업을 찾아보세요.</p>
        </header>
        <ExplorePageContent />
      </div>
    </main>
  );
}
