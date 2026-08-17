import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

const databaseUrl = process.env.TEST_DATABASE_URL;
const integration = describe.skipIf(!databaseUrl);
let app: Express;

integration('API authorization integration', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = databaseUrl!;
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    ({ app } = await import('../src/app.js'));
    const { prisma } = await import('../src/config/prisma.js');
    await prisma.user.deleteMany();
  });

  it('registers, authenticates, and prevents cross-user project access', async () => {
    const first = await request(app).post('/api/v1/auth/register').send({ name: 'First User', email: 'first@example.com', password: 'password123' }).expect(201);
    const second = await request(app).post('/api/v1/auth/register').send({ name: 'Second User', email: 'second@example.com', password: 'password123' }).expect(201);
    const project = await request(app).post('/api/v1/projects').set('authorization', `Bearer ${first.body.token}`).send({ name: 'Private API' }).expect(201);

    await request(app).get(`/api/v1/projects/${project.body.id}`).expect(401);
    await request(app).get(`/api/v1/projects/${project.body.id}`).set('authorization', `Bearer ${second.body.token}`).expect(404);
    await request(app).get(`/api/v1/projects/${project.body.id}`).set('authorization', `Bearer ${first.body.token}`).expect(200);
  });
});
