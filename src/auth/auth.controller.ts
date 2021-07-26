import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { REFRESH_TOKEN_COOKIE_NAME } from './variables';
import { GoogleUserDto } from './dto/google-user.dto';
import { TokensDto } from './dto/tokens.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../users/users.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Open google oauth' })
  @ApiResponse({ status: 301 })
  @HttpCode(301)
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @ApiOperation({
    summary: 'Login with google data. Redirected by google oauth',
  })
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) {
      throw new NotFoundException('Google user not exists!');
    }
    const loginData: TokensDto = await this.authService.googleLogin(
      <GoogleUserDto>req.user,
    );
    if (!loginData[REFRESH_TOKEN_COOKIE_NAME]) {
      return loginData;
    }
    this.authService.addTokensToCookie(res, loginData);
    return;
  }

  @ApiOperation({
    summary: 'Login using email and password',
  })
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/login')
  async login(
    @Body() userDto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = await this.authService.validateUser(userDto);
    const tokens = await this.authService.login(payload);
    this.authService.addTokensToCookie(res, tokens);
    return;
  }

  @ApiOperation({
    summary: 'Logout',
  })
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
    await this.authService.logout(refreshToken);
    this.authService.removeTokensFromCookie(res);
    return;
  }

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Refresh access_token and refresh_token',
  })
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
      console.log(req.cookies);
      if (!refreshToken) {
        return new UnauthorizedException('Unauthorized');
      }
      const tokens = await this.authService.refreshTokens(refreshToken);
      this.authService.addTokensToCookie(res, tokens);
      return;
    } catch (err) {
      this.authService.removeTokensFromCookie(res);
      throw new BadRequestException(err);
    }
  }

  @ApiOperation({
    summary: 'Register user',
  })
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Post('/register')
  register(@Body() userDto: CreateUserDto) {
    try {
      return this.authService.register(userDto);
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
