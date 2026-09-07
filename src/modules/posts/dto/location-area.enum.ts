export enum LocationArea {
  SEONGSU = 'SEONGSU',
  HONGDAE = 'HONGDAE',
  YONGSAN = 'YONGSAN',
  SEOUL = 'SEOUL',
  GYEONGGI = 'GYEONGGI',
  INCHEON = 'INCHEON',
  ETC = 'ETC',
}

export const LOCATION_AREA_VALUES = Object.values(LocationArea);

/** Seoul filter includes inner-Seoul districts that are separate radio options. */
const SEOUL_AREA_GROUP: LocationArea[] = [
  LocationArea.SEOUL,
  LocationArea.SEONGSU,
  LocationArea.HONGDAE,
  LocationArea.YONGSAN,
];

/** Expand a filter area to the Prisma `in` list (SEOUL → Seoul + districts). */
export function expandAreaFilter(area: LocationArea): LocationArea[] {
  if (area === LocationArea.SEOUL) {
    return SEOUL_AREA_GROUP;
  }
  return [area];
}
