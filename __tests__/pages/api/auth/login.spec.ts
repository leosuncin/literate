import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import { User, UserDocument, UserJson } from 'models/User';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import loginHandler from 'pages/api/auth/login';
import { ErrorResponse } from 'types';
import * as db from 'utils/db';

describe('[POST] /api/auth/login', () => {
  let user: UserDocument;

  beforeAll(async () => {
    await db.connect();
    user = new User({
      fullName: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password: 'Pa$$w0rd!',
      bio: faker.lorem.paragraph(),
    });
    await user.save();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should validate the method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "message": "Allowed method(s): POST",
        "statusCode": 405,
      }
    `);
  });

  it('should validate the body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          "email is a required field",
          "password is a required field",
        ],
        "message": "Validation errors",
        "statusCode": 422,
      }
    `);
  });

  it('should fail to log with unregistered email', async () => {
    const body = {
      email: faker.internet.exampleEmail().toLowerCase(),
      password: 'Pa$$w0rd!',
    };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body,
    });

    await loginHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `There isn't any user with email: ${body.email}`,
      statusCode: 401,
    });
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

    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `Wrong password for user with email: ${user.email}`,
      statusCode: res._getStatusCode(),
    });
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

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getJSONData()).toMatchObject<UserJson>({
      fullName: user.fullName,
      displayName: user.displayName,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  });
});
