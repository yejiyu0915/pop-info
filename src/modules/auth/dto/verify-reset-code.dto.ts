import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code!: string;
}
