import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'password must contain letters and numbers',
  })
  newPassword!: string;
}
