import faker from 'faker';
import {
  CREATED,
  METHOD_NOT_ALLOWED,
  UNPROCESSABLE_ENTITY,
  CONFLICT,
} from 'http-status-codes';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import registerHandler from 'pages/api/auth/register';

describe('[POST] /api/auth/register', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    await mongoose.models.User.findOneAndUpdate(
      { email: 'john@doe.me' },
      { fullName: 'John Doe', email: 'john@doe.me' },
      { upsert: true },
    );
    user = await mongoose.models.User.findOne({ email: 'john@doe.me' });
  });
  it('should validate the method', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await registerHandler(req as any, res);

    expect(res._getStatusCode()).toBe(METHOD_NOT_ALLOWED);
  });

  it('should validate the body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await registerHandler(req as any, res);

    expect(res._getStatusCode()).toBe(UNPROCESSABLE_ENTITY);
  });

  it('should allow to register a new user', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        fullName: faker.name.findName(),
        email: faker.internet.exampleEmail(),
        password: faker.internet.password(8, true),
      },
    });

    await registerHandler(req as any, res);

    expect(res._getStatusCode()).toBe(CREATED);
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

    expect(res._getStatusCode()).toBe(CONFLICT);
  });
});
