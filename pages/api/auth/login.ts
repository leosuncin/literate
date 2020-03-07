import {
  getStatusText,
  INTERNAL_SERVER_ERROR,
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
} from 'http-status-codes';
import { connectDB } from 'middlewares';
import { User } from 'models';
import { AuthLogin } from 'schemas';
import { NextHttpHandler } from 'types';
import { signJWT } from 'utils/jwt';

const loginHandler: NextHttpHandler = async (req, res) => {
  if (req.method !== 'POST')
    return res.status(METHOD_NOT_ALLOWED).json({
      statusCode: METHOD_NOT_ALLOWED,
      message: getStatusText(METHOD_NOT_ALLOWED),
    });

  try {
    const payload = await AuthLogin.validate(req.body, {
      abortEarly: false,
    });

    try {
      const user = await User.findOne({ email: payload.email });

      if (!user)
        return res.status(UNAUTHORIZED).json({
          statusCode: UNAUTHORIZED,
          message: `There isn't any user with email: ${payload.email}`,
        });

      if (!user.comparePassword(payload.password)) {
        return res.status(UNAUTHORIZED).json({
          statusCode: UNAUTHORIZED,
          message: `Wrong password for user with email: ${payload.email}`,
        });
      }

      const token = signJWT(user);
      res.setHeader('Authorization', `Bearer ${token}`);
      res.json(user.toJSON());
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({
        statusCode: INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(UNPROCESSABLE_ENTITY).json({
      statusCode: UNPROCESSABLE_ENTITY,
      message: getStatusText(UNPROCESSABLE_ENTITY),
      errors: error.errors,
    });
  }
};

export default connectDB(loginHandler);
