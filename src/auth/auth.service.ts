import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './auth.entity';
import { User } from '../users/users.entity';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  JWT_ACCESS_EXPIRATION,
  JWT_ACCESS_SECRET_KEY,
  JWT_REFRESH_EXPIRATION,
  JWT_REFRESH_SECRET_KEY,
  REFRESH_TOKEN_COOKIE_NAME,
} from './variables';
import { Response } from 'express';
import { TokensDto } from './dto/tokens.dto';
import { GoogleUserDto } from './dto/google-user.dto';
import { UserTokenDataDto } from './dto/user-token-data.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
  ) {}

  async register(user: CreateUserDto) {
    const salt = await genSalt(10);
    const hashPassword = await hash(user.password, salt);
    const existsUser = await this.usersService.getUserByEmail(user.email);
    if (existsUser) {
      throw new BadRequestException('User already registered');
    }
    return this.usersService.createUser({ ...user, password: hashPassword });
  }

  async validateUser({ email, password }: LoginUserDto): Promise<User> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isCorrectPassword = await compare(password, user.password);
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Incorrect password');
    }
    return user;
  }

  async login(payload: User): Promise<TokensDto> {
    const { refreshToken, accessToken } = await this.getTokens(payload);
    let refreshTokenData: Auth | undefined = await this.getRefreshTokenById(
      payload.id,
    );
    if (!refreshTokenData) {
      refreshTokenData = new Auth();
      refreshTokenData.userId = payload;
    }
    await this.saveToken(refreshTokenData, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    const refreshTokenData: Auth | undefined =
      await this.getRefreshTokenByToken(refreshToken);
    if (refreshTokenData) {
      await this.authRepository.remove([refreshTokenData]);
    }
  }

  async refreshTokens(refreshTokenCookie: string) {
    const userData: UserTokenDataDto = await this.verifyRefreshToken(
      refreshTokenCookie,
    );
    const refreshTokenData: Auth | undefined =
      await this.getRefreshTokenByToken(refreshTokenCookie);
    if (!userData || !refreshTokenData) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { refreshToken, accessToken } = await this.getTokens(userData);
    await this.saveToken(refreshTokenData, refreshToken);
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      });
    } catch (err) {
      return null;
    }
  }

  addTokensToCookie(res: Response, tokens: TokensDto) {
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens[ACCESS_TOKEN_COOKIE_NAME], {
      maxAge: this.configService.get('JWT_ACCESS_EXPIRATION'),
      httpOnly: true,
    });
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens[REFRESH_TOKEN_COOKIE_NAME], {
      maxAge: this.configService.get('JWT_REFRESH_EXPIRATION'),
      httpOnly: true,
    });
  }

  removeTokensFromCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  }

  async googleLogin(user: GoogleUserDto) {
    const userData = await this.usersService.getUserByEmail(user.email);
    if (!userData) {
      throw new NotFoundException({
        errorCode: 404,
        message: 'Google user not register',
        user,
      });
    }

    return await this.login(userData);
  }

  async getTokens({ id, email }: UserTokenDataDto) {
    try {
      const accessToken = await this.generateToken(
        { id, email },
        JWT_ACCESS_SECRET_KEY,
        JWT_ACCESS_EXPIRATION,
      );
      const refreshToken = await this.generateToken(
        { id, email },
        JWT_REFRESH_SECRET_KEY,
        JWT_REFRESH_EXPIRATION,
      );
      return { accessToken, refreshToken };
    } catch (err) {
      throw new BadRequestException('Get tokens failed: ', err);
    }
  }

  async generateToken(
    payload: UserTokenDataDto,
    tokenType: string,
    tokenExpiration: string,
  ): Promise<string> {
    try {
      return this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get(tokenExpiration),
        secret: this.configService.get(tokenType),
      });
    } catch (err) {
      throw new BadRequestException('Creating token error: ' + err);
    }
  }

  async getRefreshTokenById(userId: number): Promise<Auth | undefined> {
    const refreshTokenData = await this.authRepository.findOne({
      where: { userId },
      relations: ['userId'],
    });
    return refreshTokenData;
  }

  async getRefreshTokenByToken(
    refreshToken: string,
  ): Promise<Auth | undefined> {
    const refreshTokenData = await this.authRepository.findOne({
      where: { refreshToken },
      relations: ['userId'],
    });
    return refreshTokenData;
  }

  async saveToken(refreshTokenData: Auth, refreshToken: string) {
    refreshTokenData.refreshToken = refreshToken;
    await this.authRepository.save(refreshTokenData);
  }
}
