import { api } from '@/lib/api';
import type { Comment } from '@/types/post';

export async function fetchComments(postId: number) {
  const { data } = await api.get<Comment[]>(`/api/posts/${postId}/comments`);
  return data;
}

export async function createComment(postId: number, content: string) {
  const { data } = await api.post<Comment>(`/api/posts/${postId}/comments`, { content });
  return data;
}

export async function updateComment(id: number, content: string) {
  const { data } = await api.patch<Comment>(`/api/comments/${id}`, { content });
  return data;
}

export async function deleteComment(id: number) {
  await api.delete(`/api/comments/${id}`);
}
