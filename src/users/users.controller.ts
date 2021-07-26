import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserTokenDataDto } from '../auth/dto/user-token-data.dto';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './users.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all users.' })
  @ApiResponse({ status: 200, type: [User] })
  @UseGuards(AuthGuard('jwt'))
  @Get('/all')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user.' })
  @ApiResponse({ status: 200, type: User })
  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  getUser(@Req() { user }: Request) {
    return this.usersService.getUser(<UserTokenDataDto>user);
  }
}
