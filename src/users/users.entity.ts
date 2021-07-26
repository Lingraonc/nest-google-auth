import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: '1',
    description: 'Unique primary integer param',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Alexander',
    description: 'User name ',
  })
  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @ApiProperty({
    example: 'test@test.ru',
    description: 'User email ',
  })
  @Column({ type: 'varchar', nullable: false })
  email: string;

  @ApiProperty({
    example: 'ThisIsThueSavePassword',
    description: 'User password',
  })
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @ApiProperty({
    example: 'false',
    description: 'Is user activate account',
  })
  @Column({ type: 'boolean', default: false })
  isActive: boolean;
}
