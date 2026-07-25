
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Create test admin
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'test.admin@example.com',
        password: hashedPassword,
        fullName: 'Test Admin',
        role: UserRole.ADMIN,
      },
    });

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: admin.email, password: 'testpassword' });
    testAdminToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.activity.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('Auth', () => {
    it('/auth/login (POST) - valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test.admin@example.com', password: 'testpassword' });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('/auth/login (POST) - invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test.admin@example.com', password: 'wrongpassword' });
      expect(response.status).toBe(401);
    });
  });

  describe('Leads', () => {
    it('/leads/public (POST) - valid lead', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/leads/public')
        .send({
          fullName: 'Test Lead',
          email: 'test.lead@example.com',
          source: 'WEBSITE',
        });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test.lead@example.com');
    });

    it('/leads (GET) - authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/leads')
        .set('Authorization', `Bearer ${testAdminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('/leads (GET) - unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/leads');
      expect(response.status).toBe(401);
    });
  });
});
