export type KvBgVariant = 'grass' | 'cream' | 'ink' | 'coral' | 'paper';

/** Subtle cream/grass/ink rotations for post KV slides (by slide index). */
export const KV_POST_BG_ROTATION: KvBgVariant[] = [
  'cream',
  'grass',
  'paper',
  'coral',
  'ink',
];

export interface KvFeatureSlide {
  id: string;
  type: 'feature';
  eyebrow: string;
  title: string;
  briefing: string;
  ctaLabel: string;
  href: string;
  imageUrl?: string | null;
  /** Banner stage wash — keeps rotating slides visually distinct. */
  bgVariant: KvBgVariant;
}

/** Curated exhibition / editorial KV slides (mock CMS). */
export const KV_FEATURE_SLIDES: KvFeatureSlide[] = [
  {
    id: 'feature-editors-pick',
    type: 'feature',
    eyebrow: '기획전',
    title: "Editor's Pick — 이번 시즌 감도 체크",
    briefing: '에디터가 고른 팝업과 현장 후기를 매거진처럼 모았습니다.',
    ctaLabel: '에디터 픽 보러가기',
    href: '/editors-pick',
    imageUrl: null,
    bgVariant: 'grass',
  },
  {
    id: 'feature-live-reviews',
    type: 'feature',
    eyebrow: '생생 후기',
    title: '다녀온 사람들이 남긴 한 줄',
    briefing: '줄 길이부터 공간 분위기까지, 현장 온도가 담긴 코멘트만 모았어요.',
    ctaLabel: '후기 큐레이션 보기',
    href: '/editors-pick/guest-reviews-live',
    imageUrl: null,
    bgVariant: 'coral',
  },
  {
    id: 'feature-explore',
    type: 'feature',
    eyebrow: '발견',
    title: '필터로 원하는 팝업만 골라보기',
    briefing: '지역·카테고리·상태로 정밀하게 탐색하세요.',
    ctaLabel: '팝업 탐색',
    href: '/explore',
    imageUrl: null,
    bgVariant: 'ink',
  },
];

export function resolveKvBgVariant(slideIndex: number, featureVariant?: KvBgVariant): KvBgVariant {
  if (featureVariant) return featureVariant;
  return KV_POST_BG_ROTATION[slideIndex % KV_POST_BG_ROTATION.length] ?? 'cream';
}
