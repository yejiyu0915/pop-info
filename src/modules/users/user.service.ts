import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { AppError } from '../../middlewares/error.middleware';

const SALT_ROUNDS = 10;

export class UserService {
  async createUser(dto: CreateUserDto) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new AppError(409, 'Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  }

  async createUserFromPasswordHash(email: string, passwordHash: string, name: string) {
    const user = await prisma.user.create({
      data: { email, password: passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return user;
  }
}

export const userService = new UserService();
