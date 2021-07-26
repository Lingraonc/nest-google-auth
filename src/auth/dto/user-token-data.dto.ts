import { IsEmail, IsNumber, IsString } from 'class-validator';

export class UserTokenDataDto {
  @IsString({ message: 'Email must be string' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsNumber({}, { message: 'Id must be number' })
  id: number;
}
