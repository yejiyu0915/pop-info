import type { PopupCategory, Post } from '@/types/post';

export type SubTagId = 'reservation' | 'freeEntry' | 'pets' | 'goods' | 'alcohol';

export const SUB_TAG_OPTIONS: ReadonlyArray<{ id: SubTagId; label: string }> = [
  { id: 'reservation', label: '예약 필수' },
  { id: 'freeEntry', label: '입장료 무료' },
  { id: 'pets', label: '반려동물 동반' },
  { id: 'goods', label: '굿즈 증정' },
  { id: 'alcohol', label: '주류 시음' },
] as const;

const CATEGORY_BIAS: Record<PopupCategory, SubTagId[]> = {
  FASHION: ['goods', 'reservation'],
  FOOD: ['alcohol', 'reservation', 'freeEntry'],
  ART: ['freeEntry', 'pets'],
  LIFESTYLE: ['pets', 'goods', 'freeEntry'],
  ETC: ['reservation', 'goods'],
};

/** Deterministic mock tags from post id + category (no schema). */
export function getPostSubTags(post: Post): SubTagId[] {
  const pool = CATEGORY_BIAS[post.category] ?? ['reservation', 'freeEntry'];
  const count = (post.id % 3) + 1;
  const tags: SubTagId[] = [];

  for (let i = 0; i < count; i += 1) {
    const tag = pool[(post.id + i) % pool.length];
    if (!tags.includes(tag)) tags.push(tag);
  }

  // Spread remaining catalog for variety when id is even.
  if (post.id % 2 === 0) {
    const extra = SUB_TAG_OPTIONS[(post.id * 3) % SUB_TAG_OPTIONS.length].id;
    if (!tags.includes(extra)) tags.push(extra);
  }

  return tags;
}

export function postHasAllSubTags(post: Post, selected: string[]) {
  if (!selected.length) return true;
  const tags = new Set(getPostSubTags(post));
  return selected.every((id) => tags.has(id as SubTagId));
}
