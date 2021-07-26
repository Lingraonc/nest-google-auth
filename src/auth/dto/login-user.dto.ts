import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'test@test.ru',
    description: 'User email ',
  })
  @IsString({ message: 'Email must be string' })
  @IsEmail({}, { message: 'Invalid email' })
  readonly email: string;

  @ApiProperty({
    example: 'ThisIsThueSavePassword',
    description: 'User password',
  })
  @IsString({ message: 'Must be string' })
  @Length(4, 30, { message: 'Cannot be low 4 or more 30' })
  readonly password: string;
}
