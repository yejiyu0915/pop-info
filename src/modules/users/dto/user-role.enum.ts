export const UserRole = {
  USER: 'USER',
  CREATOR: 'CREATOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_VALUES = Object.values(UserRole);

export function isCreatorOrAbove(role: string): boolean {
  return role === UserRole.CREATOR || role === UserRole.ADMIN;
}

export function isAdmin(role: string): boolean {
  return role === UserRole.ADMIN;
}
