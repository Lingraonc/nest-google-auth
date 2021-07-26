import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from './auth/variables';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Google and jwt auth example')
    .setDescription(
      'Simple auth with google and JWT token. Using refresh and access tokens.',
    )
    .setVersion('1.0')
    .addTag('Lingraonc auth')
    .addCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(3000);
}
bootstrap();
