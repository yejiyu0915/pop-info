import { api } from '@/lib/api';
import type {
  CreatePostInput,
  PaginatedPosts,
  Post,
  PostFilters,
} from '@/types/post';

export async function fetchPosts(filters: PostFilters = {}) {
  const { page = 1, limit = 12, q, area, category, status, orderBy } = filters;
  const params: Record<string, string | number> = { page, limit };
  if (q) params.q = q;
  if (area) params.area = area;
  if (category) params.category = category;
  if (status) params.status = status;
  if (orderBy) params.orderBy = orderBy;

  const { data } = await api.get<PaginatedPosts>('/api/posts', { params });
  return data;
}

export async function fetchKvPosts() {
  const { data } = await api.get<{ data: Post[] }>('/api/posts/kv');
  return data.data;
}

export async function fetchPost(id: number) {
  const { data } = await api.get<Post>(`/api/posts/${id}`);
  return data;
}

export async function createPost(input: CreatePostInput) {
  const { data } = await api.post<Post>('/api/posts', input);
  return data;
}

export async function updatePost(id: number, input: CreatePostInput) {
  const { data } = await api.patch<Post>(`/api/posts/${id}`, input);
  return data;
}

export async function deletePost(id: number) {
  await api.delete(`/api/posts/${id}`);
}
