import { IsEmail, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'password must contain letters and numbers',
  })
  password!: string;

  @IsString()
  @MaxLength(50)
  name!: string;
}
