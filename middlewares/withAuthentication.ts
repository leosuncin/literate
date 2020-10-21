import { StatusCodes } from 'http-status-codes';
import { User } from 'models';
import { HttpError, NextHttpHandler } from 'types';
import { decodeJWT } from 'utils/jwt';

export function withAuthentication(handler: NextHttpHandler): NextHttpHandler {
  return async (req, res) => {
    if (typeof req.headers.authorization !== 'string')
      throw new HttpError(
        'Missing authorization header',
        StatusCodes.UNAUTHORIZED,
      );

    const [, token] = req.headers.authorization.split(' ');

    if (!token)
      throw new HttpError(
        'Missing authorization token',
        StatusCodes.UNAUTHORIZED,
      );

    let payload;
    try {
      payload = decodeJWT(token);
    } catch (error) {
      throw new HttpError(
        'Invalid authorization token',
        StatusCodes.FORBIDDEN,
        error,
      );
    }

    const user = await User.findById(payload.id);

    if (!user)
      throw new HttpError('Invalid user from token', StatusCodes.FORBIDDEN);

    req.user = user;

    return handler(req, res);
  };
}
