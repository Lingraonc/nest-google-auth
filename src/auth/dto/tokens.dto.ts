import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../variables';
import { IsString } from 'class-validator';

export class TokensDto {
  @IsString({ message: 'Access token must be string' })
  [ACCESS_TOKEN_COOKIE_NAME]: string;

  @IsString({ message: 'Refresh token must be string' })
  [REFRESH_TOKEN_COOKIE_NAME]: string;
}
