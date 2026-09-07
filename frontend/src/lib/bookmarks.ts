import { api } from '@/lib/api';
import type { BookmarkToggleResult, PaginatedPosts } from '@/types/post';

export async function toggleBookmark(postId: number) {
  const { data } = await api.post<BookmarkToggleResult>(`/api/posts/${postId}/bookmark`);
  return data;
}

export async function fetchMyBookmarks(page = 1, limit = 12) {
  const { data } = await api.get<PaginatedPosts>('/api/users/me/bookmarks', {
    params: { page, limit },
  });
  return data;
}
