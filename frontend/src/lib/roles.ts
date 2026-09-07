export type UserRole = 'USER' | 'CREATOR' | 'ADMIN';

export function isCreatorOrAbove(role?: UserRole): boolean {
  return role === 'CREATOR' || role === 'ADMIN';
}

export function isAdmin(role?: UserRole): boolean {
  return role === 'ADMIN';
}
