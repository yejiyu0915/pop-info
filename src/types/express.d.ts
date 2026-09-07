export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string | null;
        role?: import('../modules/users/dto/user-role.enum').UserRole;
      };
    }
  }
}
