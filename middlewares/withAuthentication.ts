import { User } from 'models';
import { ForbiddenError, NextHttpHandler, UnauthorizedError } from 'types';
import { decodeJWT } from 'utils/jwt';

export function withAuthentication(handler: NextHttpHandler): NextHttpHandler {
  return async (req, res) => {
    if (typeof req.headers.authorization !== 'string')
      throw new UnauthorizedError('Missing authorization header');

    const [, token] = req.headers.authorization.split(' ');

    if (!token) throw new UnauthorizedError('Missing authorization token');

    let payload;
    try {
      payload = decodeJWT(token);
    } catch (error) {
      throw new ForbiddenError('Invalid authorization token', error);
    }

    const user = await User.findById(payload.id);

    if (!user) throw new ForbiddenError('Invalid user from token');

    req.user = user;

    return handler(req, res);
  };
}
