import type { PopupStatus } from '@/lib/popupStatus';
import type { PostOrderBy } from '@/types/post';

export const POPUP_STATUS_FILTER_OPTIONS: { value: PopupStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'ONGOING', label: '진행중' },
  { value: 'UPCOMING', label: '오픈예정' },
  { value: 'ENDED', label: '종료' },
];

export const POST_ORDER_BY_OPTIONS: { value: PostOrderBy; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'endingSoon', label: '종료임박순' },
];
