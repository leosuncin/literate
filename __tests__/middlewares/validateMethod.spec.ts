import { METHOD_NOT_ALLOWED } from 'http-status-codes';
import { validateMethod } from 'middlewares/validateMethod';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

describe('validateMethod', () => {
  it('should validate a single string', () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });
    const handler = jest.fn();

    validateMethod('GET', handler)(req as any, res);

    expect(res._getStatusCode()).toBe(METHOD_NOT_ALLOWED);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should validate an array of methods', () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });
    const handler = jest.fn();

    validateMethod(['POST', 'PUT'], handler)(req as any, res);

    expect(res._getStatusCode()).toBe(METHOD_NOT_ALLOWED);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should call next handler', () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });
    const handler = jest.fn();

    validateMethod('GET', handler)(req as any, res);

    expect(handler).toHaveBeenCalledWith(req, res);
  });
});
