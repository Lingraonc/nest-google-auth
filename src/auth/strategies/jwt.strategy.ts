import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE_NAME } from '../variables';
import { UserTokenDataDto } from '../dto/user-token-data.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies[ACCESS_TOKEN_COOKIE_NAME];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET_KEY'),
      signOptions: {
        expiresIn: configService.get('JWT_ACCESS_EXPIRATION'),
      },
    });
  }

  async validate(payload: any): Promise<UserTokenDataDto> {
    return payload;
  }
}
