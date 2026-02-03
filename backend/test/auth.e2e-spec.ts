import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from './../src/app.module';

interface RegisterResponse {
  data: {
    register: {
      accessToken: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    };
  };
}

interface LoginResponse {
  data: {
    login: {
      accessToken: string;
      user: {
        email: string;
      };
    };
  };
}

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const randomEmail = `test-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  it('should register a new user', () => {
    const query = `
      mutation {
        register(registerInput: {
          email: "${randomEmail}",
          password: "${password}",
          name: "${name}"
        }) {
          accessToken
          user {
            id
            email
            name
            role
          }
        }
      }
    `;

    return request(app.getHttpServer() as unknown as Server)
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        const data = (res.body as RegisterResponse).data.register;
        expect(data.accessToken).toBeDefined();
        expect(data.user.email).toBe(randomEmail);
        expect(data.user.name).toBe(name);
      });
  });

  it('should login with the new user', () => {
    const query = `
      mutation {
        login(loginInput: {
          email: "${randomEmail}",
          password: "${password}"
        }) {
          accessToken
          user {
            email
          }
        }
      }
    `;

    return request(app.getHttpServer() as unknown as Server)
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        const data = (res.body as LoginResponse).data.login;
        expect(data.accessToken).toBeDefined();
        expect(data.user.email).toBe(randomEmail);
      });
  });
});
