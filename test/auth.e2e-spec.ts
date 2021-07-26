import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import exp from 'constants';
import { AppModule } from '../src/app.module';

const testUser: CreateUserDto = {
  firstName: 'Test20',
  email: 'test20@test.ru',
  password: 'password',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(200)
      .then(({ body }: request.Response) => {
        userId = body.id;
        expect(userId).toBeDefined();
      });
  });

  afterAll(() => {
    app.close();
  });
});
