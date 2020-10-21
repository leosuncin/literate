import { StatusCodes } from 'http-status-codes';
import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
} from 'middlewares';
import { User } from 'models';
import { AuthRegister } from 'schemas';
import { NextHttpHandler } from 'types';
import { signJWT } from 'utils/jwt';

const registerHandle: NextHttpHandler = async (req, res) => {
  const user = await new User(req.body).save();
  const token = signJWT(user);
  res.setHeader('Authorization', `Bearer ${token}`);

  return res.status(StatusCodes.CREATED).json(user.toJSON());
};

export default catchErrors(
  validateMethod('POST', validateBody(AuthRegister, connectDB(registerHandle))),
);
