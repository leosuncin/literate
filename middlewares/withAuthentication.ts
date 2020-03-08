import { FORBIDDEN, UNAUTHORIZED } from 'http-status-codes';
import { User } from 'models';
import { NextHttpHandler } from 'types';
import { decodeJWT } from 'utils/jwt';

export function withAuthentication(handler: NextHttpHandler): NextHttpHandler {
  return async (req, res) => {
    if (typeof req.headers.authorization !== 'string')
      return res.status(UNAUTHORIZED).json({
        statusCode: UNAUTHORIZED,
        message: 'Missing authorization header',
      });

    const [, token] = req.headers.authorization.split(' ');

    if (!token)
      return res.status(UNAUTHORIZED).json({
        statusCode: UNAUTHORIZED,
        message: 'Missing authorization token',
      });

    let payload;
    try {
      payload = decodeJWT(token);
    } catch (error) {
      return res.status(FORBIDDEN).json({
        statusCode: FORBIDDEN,
        message: 'Invalid authorization token',
      });
    }

    const user = await User.findById(payload.id);

    if (!user)
      return res.status(FORBIDDEN).json({
        statusCode: FORBIDDEN,
        message: 'Invalid user from token',
      });

    req.user = user;

    return handler(req, res);
  };
}
