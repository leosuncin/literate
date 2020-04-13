import faker from 'faker';
import {
  METHOD_NOT_ALLOWED,
  OK,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
} from 'http-status-codes';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import loginHandler from 'pages/api/auth/login';
import * as db from 'utils/db';

describe('[POST] /api/auth/login', () => {
  let user;

  beforeAll(async () => {
    await db.connect();
    user = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.exampleEmail(),
      password: 'Pa$$w0rd!',
    }).save();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should validate the method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(METHOD_NOT_ALLOWED);
  });

  it('should validate the body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(UNPROCESSABLE_ENTITY);
  });

  it('should fail to log with unregistered email', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: faker.internet.exampleEmail(),
        password: 'Pa$$w0rd!',
      },
    });

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(UNAUTHORIZED);
  });

  it('should fail to log with invalid password', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: user.email,
        password: faker.internet.password(),
      },
    });

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(UNAUTHORIZED);
  });

  it('should allow to log in existing user', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        email: user.email,
        password: 'Pa$$w0rd!',
      },
    });

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(OK);
  });
});