import {
  CONFLICT,
  getStatusText,
  INTERNAL_SERVER_ERROR,
  METHOD_NOT_ALLOWED,
  UNPROCESSABLE_ENTITY,
} from 'http-status-codes';
import { connectDB } from 'middlewares';
import { User } from 'models';
import { AuthRegister } from 'schemas';
import { NextHttpHandler } from 'types';
import { signJWT } from 'utils/jwt';

const registerHandle: NextHttpHandler = async (req, res) => {
  if (req.method !== 'POST')
    return res.status(METHOD_NOT_ALLOWED).json({
      statusCode: METHOD_NOT_ALLOWED,
      message: getStatusText(METHOD_NOT_ALLOWED),
    });

  try {
    const payload = await AuthRegister.validate(req.body, {
      abortEarly: false,
    });

    try {
      const user = await new User(payload).save();
      const token = signJWT(user);
      res.setHeader('Authorization', `Bearer ${token}`);
      res.json(user.toJSON());
    } catch (error) {
      if (error.name === 'ValidationError' && 'errors' in error)
        res.status(CONFLICT).json({
          statusCode: CONFLICT,
          message: `Email ${error.errors.email?.message}`,
        });
      else
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

export default connectDB(registerHandle);
