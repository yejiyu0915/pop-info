import { api } from '@/lib/api';
import type { PaginatedPosts, Post } from '@/types/post';

export async function fetchPosts(page = 1, limit = 10) {
  const { data } = await api.get<PaginatedPosts>('/api/posts', {
    params: { page, limit },
  });
  return data;
}

export async function createPost(title: string, content: string) {
  const { data } = await api.post<Post>('/api/posts', { title, content });
  return data;
}
