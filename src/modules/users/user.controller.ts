import { Request, Response, NextFunction } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { userService } from './user.service';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as CreateUserDto;
      const user = await userService.createUser(dto);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
