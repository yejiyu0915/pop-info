import type { PopupCategory } from '@/types/post';

export const POPUP_CATEGORIES: { value: PopupCategory; label: string }[] = [
  { value: 'FASHION', label: '패션' },
  { value: 'FOOD', label: '푸드' },
  { value: 'ART', label: '아트' },
  { value: 'LIFESTYLE', label: '라이프스타일' },
  { value: 'ETC', label: '기타' },
];

export function getCategoryLabel(category: PopupCategory): string {
  return POPUP_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}
