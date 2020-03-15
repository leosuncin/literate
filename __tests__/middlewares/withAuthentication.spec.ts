import faker from 'faker';
import { FORBIDDEN, UNAUTHORIZED } from 'http-status-codes';
import { withAuthentication } from 'middlewares/withAuthentication';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { signJWT } from 'utils/jwt';

describe('withAuthentication', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    user = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }).save();
  });

  it('should require the `Authorization` header', async () => {
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await withAuthentication(handler)(req as any, res);

    expect(res._getStatusCode()).toBe(UNAUTHORIZED);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should require the token', async () => {
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {
        authorization: 'Not-Valid',
      },
    });

    await withAuthentication(handler)(req as any, res);

    expect(res._getStatusCode()).toBe(UNAUTHORIZED);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should validate the token', async () => {
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {
        authorization: `Basic ${Buffer.from(
          user.email + ':' + user.password,
        ).toString('base64')}`,
      },
    });

    await withAuthentication(handler)(req as any, res);

    expect(res._getStatusCode()).toBe(FORBIDDEN);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should verify the token', async () => {
    const token = signJWT(({
      _id: mongoose.Types.ObjectId(),
      displayName: 'John Doe',
    } as unknown) as any);
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    await withAuthentication(handler)(req as any, res);

    expect(res._getStatusCode()).toBe(FORBIDDEN);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call next handler', async () => {
    const token = signJWT(({
      _id: user._id,
      displayName: user.fullName,
    } as unknown) as any);
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    await withAuthentication(handler)(req as any, res);

    expect(handler).toHaveBeenCalledWith(req, res);
  });
});
