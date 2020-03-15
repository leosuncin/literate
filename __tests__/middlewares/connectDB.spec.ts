import { connectDB } from 'middlewares/connectDB';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

describe('connectDB', () => {
  it('should connect', async () => {
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await connectDB(handler)(req as any, res);

    expect(handler).toHaveBeenCalled();
  });
});
