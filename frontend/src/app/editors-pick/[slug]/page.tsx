import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { getEditorialBySlug } from '@/lib/editorial';

export default async function EditorsPickDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getEditorialBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="home page-shell">
      <AppHeader />
      <article className="container editors-detail">
        <p className="editors-detail__meta">{article.meta}</p>
        <h1 className="editors-detail__title">{article.title}</h1>
        <p className="editors-detail__brief">{article.briefing}</p>
        <div className="editors-detail__body">
          <p>
            이 페이지는 에디토리얼 CMS 연동 전 플레이스홀더입니다. 추후 ADMIN이 등록하는 매거진
            본문이 이곳에 연결됩니다.
          </p>
        </div>
        <Link href="/editors-pick" className="home__cta-chip">
          목록으로
        </Link>
      </article>
    </main>
  );
}
