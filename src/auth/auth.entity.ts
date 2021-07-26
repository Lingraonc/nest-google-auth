import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToOne((type) => User, { primary: true })
  @JoinColumn({ name: 'userId' })
  userId: User;

  @Column({ type: 'varchar', nullable: false })
  refreshToken: string;
}
