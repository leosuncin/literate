import faker from 'faker';
import { withAuthentication } from 'middlewares/withAuthentication';
import type { User } from 'models';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { ForbiddenError, UnauthorizedError } from 'types';
import * as db from 'utils/db';
import { signJWT } from 'utils/jwt';

describe('withAuthentication', () => {
  let user: User;

  beforeAll(async () => {
    await db.connect();
    user = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }).save();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  it('should require the `Authorization` header', async () => {
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await expect(withAuthentication(handler)(req as any, res)).rejects.toThrow(
      UnauthorizedError,
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('should require the token', async () => {
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      headers: {
        authorization: 'Not-Valid',
      },
    });

    await expect(withAuthentication(handler)(req as any, res)).rejects.toThrow(
      UnauthorizedError,
    );

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

    await expect(withAuthentication(handler)(req as any, res)).rejects.toThrow(
      ForbiddenError,
    );

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

    await expect(withAuthentication(handler)(req as any, res)).rejects.toThrow(
      ForbiddenError,
    );

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
