import { StatusCodes } from 'http-status-codes';
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

    return res.status(StatusCodes.CREATED).json(user.toJSON());
  } catch (error) {
    if (error.name === 'ValidationError' && 'errors' in error)
      return res.status(StatusCodes.CONFLICT).json({
        statusCode: StatusCodes.CONFLICT,
        message: `Email ${error.errors.email?.message}`,
      });
    else {
      log.error(`[${req.method}] ${req.url}`, error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
};

export default validateMethod(
  'POST',
  validateBody(AuthRegister, connectDB(registerHandle)),
);
