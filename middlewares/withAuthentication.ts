import { FORBIDDEN } from 'http-status-codes';
import { User } from 'models';
import { NextHttpHandler } from 'types';
import { decodeJWT } from 'utils/jwt';

export function withAuthentication(handler: NextHttpHandler): NextHttpHandler {
  return async (req, res) => {
    if (typeof req.headers.authorization !== 'string')
      return res.status(FORBIDDEN).json({
        statusCode: FORBIDDEN,
        message: 'Missing authorization header',
      });

    const [, token] = req.headers.authorization.split(' ');

    if (!token)
      return res.status(FORBIDDEN).json({
        statusCode: FORBIDDEN,
        message: 'Missing authorization token',
      });

    const payload = decodeJWT(token);
    const user = await User.findById(payload.id);

    if (!user)
      return res.status(FORBIDDEN).json({
        statusCode: FORBIDDEN,
        message: 'Invalid token',
      });

    req.user = user;

    handler(req, res);
  };
}
