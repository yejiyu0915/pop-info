export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  author: { id: number; email: string; name: string | null };
  _count?: { comments: number };
}

export interface PaginatedPosts {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
