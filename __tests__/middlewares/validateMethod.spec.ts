import { validateMethod } from 'middlewares/validateMethod';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { MethodNotAllowedError } from 'types';

describe('validateMethod', () => {
  it('should validate a single string', () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });
    const handler = jest.fn();

    expect(validateMethod('GET', handler).bind(null, req, res)).toThrow(
      MethodNotAllowedError,
    );

    expect(handler).not.toHaveBeenCalled();
  });

  it('should validate an array of methods', () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });
    const handler = jest.fn();

    expect(
      validateMethod(['POST', 'PUT'], handler).bind(null, req, res),
    ).toThrow(MethodNotAllowedError);

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
