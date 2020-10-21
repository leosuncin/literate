import { StatusCodes } from 'http-status-codes';
import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
} from 'middlewares';
import { User } from 'models';
import { AuthLogin } from 'schemas';
import { HttpError, NextHttpHandler } from 'types';
import { signJWT } from 'utils/jwt';

const loginHandler: NextHttpHandler = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw new HttpError(
      `There isn't any user with email: ${req.body.email}`,
      StatusCodes.UNAUTHORIZED,
    );

  if (!user.comparePassword(req.body.password))
    throw new HttpError(
      `Wrong password for user with email: ${req.body.email}`,
      StatusCodes.UNAUTHORIZED,
    );

  const token = signJWT(user);
  res.setHeader('Authorization', `Bearer ${token}`);

  return res.json(user.toJSON());
};

export default catchErrors(
  validateMethod('POST', validateBody(AuthLogin, connectDB(loginHandler))),
);
