import { CONFLICT, CREATED, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { connectDB, validateBody, validateMethod } from 'middlewares';
import { User } from 'models';
import log from 'ololog';
import { AuthRegister } from 'schemas';
import { NextHttpHandler } from 'types';
import { signJWT } from 'utils/jwt';

const registerHandle: NextHttpHandler = async (req, res) => {
  try {
    const user = await new User(req.body).save();
    const token = signJWT(user);
    res.setHeader('Authorization', `Bearer ${token}`);

    return res.status(CREATED).json(user.toJSON());
  } catch (error) {
    if (error.name === 'ValidationError' && 'errors' in error)
      return res.status(CONFLICT).json({
        statusCode: CONFLICT,
        message: `Email ${error.errors.email?.message}`,
      });
    else {
      log.error(`[${req.method}] ${req.url}`, error);

      return res.status(INTERNAL_SERVER_ERROR).json({
        statusCode: INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
};

export default validateMethod(
  'POST',
  validateBody(AuthRegister, connectDB(registerHandle)),
);
