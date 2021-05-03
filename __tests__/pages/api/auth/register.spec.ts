import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import { User, UserDocument, UserJson } from 'models/User';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import registerHandler from 'pages/api/auth/register';
import * as db from 'utils/db';

describe('[POST] /api/auth/register', () => {
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

    await registerHandler(req as any, res);

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

    await registerHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          "fullName is a required field",
          "email is a required field",
          "password is a required field",
        ],
        "message": "Validation errors",
        "statusCode": 422,
      }
    `);
  });

  it('should allow to register a new user', async () => {
    const body = {
      fullName: faker.name.findName(),
      email: faker.internet.exampleEmail().toLowerCase(),
      password: faker.internet.password(8, true),
    };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body,
    });

    await registerHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(res._getJSONData()).toMatchObject<UserJson>({
      bio: null,
      fullName: body.fullName,
      email: body.email,
      displayName: body.fullName,
      avatar: expect.stringContaining('https://api.adorable.io/avatars/64/'),
      createdAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
      updatedAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
    });
  });

  it('should fail to register a duplicate email', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        fullName: faker.name.findName(),
        email: user.email,
        password: faker.internet.password(8, true),
      },
    });

    await registerHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.CONFLICT);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          "email is already taken",
        ],
        "message": "Conflict",
        "statusCode": 409,
      }
    `);
  });
});
