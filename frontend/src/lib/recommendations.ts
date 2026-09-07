import { fetchMyBookmarks } from '@/lib/bookmarks';
import { fetchPosts } from '@/lib/posts';
import type { LocationArea, PopupCategory, Post } from '@/types/post';

const SEOUL_CLUSTER: LocationArea[] = ['SEOUL', 'SEONGSU', 'HONGDAE', 'YONGSAN'];

function areasRelated(a: LocationArea, b: LocationArea) {
  if (a === b) return true;
  return SEOUL_CLUSTER.includes(a) && SEOUL_CLUSTER.includes(b);
}

function preferenceScore(
  post: Post,
  areas: Map<LocationArea, number>,
  categories: Map<PopupCategory, number>,
) {
  let score = 0;
  for (const [area, weight] of areas) {
    if (areasRelated(post.area, area)) score += weight * 3;
  }
  const catWeight = categories.get(post.category) ?? 0;
  score += catWeight * 4;
  score += Math.min(post._count?.bookmarks ?? 0, 20) * 0.1;
  return score;
}

function buildPreferenceMaps(bookmarked: Post[]) {
  const areas = new Map<LocationArea, number>();
  const categories = new Map<PopupCategory, number>();
  for (const post of bookmarked) {
    areas.set(post.area, (areas.get(post.area) ?? 0) + 1);
    categories.set(post.category, (categories.get(post.category) ?? 0) + 1);
  }
  return { areas, categories };
}

/**
 * Personalized ranking without schema changes:
 * - Logged-in with bookmarks → weight by bookmarked area/category
 * - Guest / empty bookmarks → popular, then latest fill
 */
export async function fetchPersonalizedPosts(options: {
  isAuthenticated: boolean;
  limit?: number;
}): Promise<Post[]> {
  const limit = options.limit ?? 6;

  const popular = await fetchPosts({ page: 1, limit: 40, orderBy: 'popular' });
  const pool = [...popular.data];

  if (pool.length < limit) {
    const latest = await fetchPosts({ page: 1, limit: 40, orderBy: 'latest' });
    const seen = new Set(pool.map((p) => p.id));
    for (const post of latest.data) {
      if (!seen.has(post.id)) {
        pool.push(post);
        seen.add(post.id);
      }
    }
  }

  if (!options.isAuthenticated) {
    return pool.slice(0, limit);
  }

  let bookmarked: Post[] = [];
  try {
    const result = await fetchMyBookmarks(1, 50);
    bookmarked = result.data;
  } catch {
    return pool.slice(0, limit);
  }

  if (bookmarked.length === 0) {
    return pool.slice(0, limit);
  }

  const bookmarkedIds = new Set(bookmarked.map((p) => p.id));
  const { areas, categories } = buildPreferenceMaps(bookmarked);
  const candidates = pool.filter((p) => !bookmarkedIds.has(p.id));

  candidates.sort((a, b) => {
    const diff = preferenceScore(b, areas, categories) - preferenceScore(a, areas, categories);
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (candidates.length >= limit) {
    return candidates.slice(0, limit);
  }

  // Preferential pool exhausted — fill with popular including weaker matches
  const fill = pool.filter((p) => !candidates.some((c) => c.id === p.id));
  return [...candidates, ...fill].slice(0, limit);
}
