import type { LocationArea } from '@/types/post';

export const LOCATION_AREAS: { value: LocationArea; label: string }[] = [
  { value: 'SEONGSU', label: '성수' },
  { value: 'HONGDAE', label: '홍대' },
  { value: 'YONGSAN', label: '용산' },
  { value: 'SEOUL', label: '서울' },
  { value: 'GYEONGGI', label: '경기' },
  { value: 'INCHEON', label: '인천' },
  { value: 'ETC', label: '기타' },
];

export const LOCATION_AREA_FILTER_OPTIONS: { value: LocationArea | ''; label: string }[] = [
  { value: '', label: '전체' },
  ...LOCATION_AREAS,
];

/** Mirrors backend expandAreaFilter: SEOUL includes inner-Seoul districts. */
const SEOUL_AREA_GROUP: LocationArea[] = ['SEOUL', 'SEONGSU', 'HONGDAE', 'YONGSAN'];

export function expandAreaFilter(area: LocationArea): LocationArea[] {
  if (area === 'SEOUL') {
    return SEOUL_AREA_GROUP;
  }
  return [area];
}

export function getAreaLabel(area: LocationArea): string {
  return LOCATION_AREAS.find((a) => a.value === area)?.label ?? area;
}
