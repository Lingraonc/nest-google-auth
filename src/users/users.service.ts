import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserTokenDataDto } from '../auth/dto/user-token-data.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    return this.usersRepository.save(dto);
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUser({ id }: UserTokenDataDto): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { id } });
  }
}
