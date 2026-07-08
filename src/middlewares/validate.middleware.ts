import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

function formatValidationErrors(errors: ValidationError[]) {
  return errors.flatMap((error) =>
    Object.values(error.constraints ?? {}),
  );
}

export function validateBody(DtoClass: new () => object) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: formatValidationErrors(errors),
      });
    }

    req.body = dto;
    next();
  };
}
