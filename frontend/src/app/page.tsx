'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { EditorsPickSection } from '@/components/posts/EditorsPickSection';
import { KvBannerSlider } from '@/components/posts/KvBannerSlider';
import { PersonalizedFeed } from '@/components/posts/PersonalizedFeed';
import { ThisWeekSection } from '@/components/posts/ThisWeekSection';

export default function HomePage() {
  return (
    <main className="home page-shell">
      <AppHeader />
      <div className="container home__curation">
        <KvBannerSlider />
        <ThisWeekSection />
        <PersonalizedFeed />
        <EditorsPickSection />
      </div>
    </main>
  );
}
