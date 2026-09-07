export interface EditorialArticle {
  slug: string;
  title: string;
  briefing: string;
  meta: string;
  imageUrl: string | null;
  featured?: boolean;
}

/** Mock magazine content until ADMIN CMS / Article model exists. */
export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: 'seongsu-july-radar',
    title: '성수에서 놓치면 아까운 7월 팝업 레이더',
    briefing:
      '에디터가 직접 다녀온 성수 한 켠의 짧은 전시를 한곳에. 이번 주만 열려 있는 스팟을 감도 있게 골랐습니다.',
    meta: 'Editor · 큐레이션',
    imageUrl: '/demo-posters/poster-03.svg',
    featured: true,
  },
  {
    slug: 'hongdae-night-food',
    title: '홍대 밤의 푸드 팝업, 세 가지 코스',
    briefing: '줄 서는 맛과 조용히 즐기기 좋은 코너를 나눠 정리했습니다.',
    meta: '푸드 · 투어',
    imageUrl: '/demo-posters/poster-07.svg',
  },
  {
    slug: 'yongsan-art-walk',
    title: '용산 아트 워크: 주말 코스 메모',
    briefing: '한남·이태원 사이, 걷는 속도에 맞춘 전시 루트.',
    meta: '아트 · 루트',
    imageUrl: '/demo-posters/poster-04.svg',
  },
  {
    slug: 'guest-reviews-live',
    title: '생생 후기: 방문자들이 남긴 한 줄',
    briefing: '현장 온도가 느껴지는 코멘트만 골랐습니다.',
    meta: '리뷰 · 스냅',
    imageUrl: '/demo-posters/poster-09.svg',
  },
  {
    slug: 'editors-notebook',
    title: '에디터 노트: 좋은 팝업을 고르는 기준',
    briefing: '공간·동선·브랜드 메시지 — POPCAST가 보는 세 가지.',
    meta: '에디토리얼',
    imageUrl: '/demo-posters/poster-10.svg',
  },
];

export function getFeaturedEditorial() {
  return EDITORIAL_ARTICLES.find((a) => a.featured) ?? EDITORIAL_ARTICLES[0];
}

/** Home Editor's Pick rail/carousel cap; full `/editors-pick` lists all articles. */
export const HOME_EDITORIAL_SLIDE_LIMIT = 3;

/** Home hero↔rail slider: featured first, then the rest (capped for home). */
export function getEditorialSlides(limit = HOME_EDITORIAL_SLIDE_LIMIT) {
  const featured = getFeaturedEditorial();
  const rest = EDITORIAL_ARTICLES.filter((a) => a.slug !== featured.slug);
  return [featured, ...rest].slice(0, Math.max(1, limit));
}

export function getEditorialSubs(limit = 4) {
  const featured = getFeaturedEditorial();
  return EDITORIAL_ARTICLES.filter((a) => a.slug !== featured.slug).slice(0, limit);
}

export function getEditorialBySlug(slug: string) {
  return EDITORIAL_ARTICLES.find((a) => a.slug === slug);
}
