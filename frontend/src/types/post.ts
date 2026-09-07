export type PopupCategory = 'FASHION' | 'FOOD' | 'ART' | 'LIFESTYLE' | 'ETC';

export type LocationArea =
  | 'SEONGSU'
  | 'HONGDAE'
  | 'YONGSAN'
  | 'SEOUL'
  | 'GYEONGGI'
  | 'INCHEON'
  | 'ETC';

export type PopupStatusFilter = 'ONGOING' | 'UPCOMING' | 'ENDED';

export type PostOrderBy = 'latest' | 'popular' | 'endingSoon';

export interface PostAuthor {
  id: number;
  email: string;
  name: string | null;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  location: string;
  area: LocationArea;
  category: PopupCategory;
  imageUrl: string | null;
  isKv: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor;
  isBookmarked?: boolean;
  _count?: { comments: number; bookmarks: number };
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  postId: number;
  createdAt: string;
  author: PostAuthor;
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

export interface PostFilters {
  page?: number;
  limit?: number;
  q?: string;
  area?: LocationArea;
  category?: PopupCategory | '';
  status?: PopupStatusFilter;
  orderBy?: PostOrderBy;
  /** Explore-only: `YYYY-MM-DD` — client filter, not sent to API. */
  targetDate?: string;
  /** Explore-only: sub-tag ids — client filter, not sent to API. */
  subTags?: string[];
}

export interface TimelineFilters {
  area?: LocationArea;
  category?: PopupCategory | '';
  orderBy?: PostOrderBy;
}

export interface CreatePostInput {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  location: string;
  area: LocationArea;
  category: PopupCategory;
  imageUrl?: string;
  isKv?: boolean;
}

export interface BookmarkToggleResult {
  bookmarked: boolean;
}
