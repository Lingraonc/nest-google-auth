import { IsEmail, IsString } from 'class-validator';

export class GoogleUserDto {
  @IsString({ message: 'Email must be string' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsString({ message: 'firstName must be string' })
  firstName: string;

  @IsString({ message: 'picture must be string' })
  picture: string;
}
