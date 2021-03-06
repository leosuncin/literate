import faker from 'faker';
import { validateBody } from 'middlewares/validateBody';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { UnprocessableEntityError } from 'types';
import * as yup from 'yup';

describe('validateBody', () => {
  it('should validate the body', async () => {
    const schema = yup
      .object()
      .shape({
        name: yup.string().required(),
      })
      .noUnknown(true);
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await expect(
      validateBody(schema, handler)(req as any, res),
    ).rejects.toThrow(UnprocessableEntityError);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should call next handler', async () => {
    const schema = yup
      .object()
      .shape({
        name: yup.string().required(),
      })
      .noUnknown(true);
    const handler = jest.fn();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        name: faker.name.findName(),
      },
    });

    await validateBody(schema, handler)(req as any, res);

    expect(handler).toHaveBeenCalledWith(req, res);
  });
});
