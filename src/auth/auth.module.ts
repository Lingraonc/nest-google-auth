import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Auth } from './auth.entity';

@Module({
  providers: [AuthService, GoogleStrategy, ConfigService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    UsersModule,
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Auth]),
  ],
})
export class AuthModule {}
