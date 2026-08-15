const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/db/prisma/client');
const mongoose = require('mongoose');

describe('API Health Check', () => {
  it('should return 200 OK for /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });
});

// Avoid dangling open handles after test
afterAll(async () => {
  await prisma.$disconnect();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
