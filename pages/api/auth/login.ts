import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
} from 'middlewares';
import { User } from 'models';
import { authLogin } from 'schemas';
import { NextHttpHandler, UnauthorizedError } from 'types';
import { signJWT } from 'utils/jwt';

const loginHandler: NextHttpHandler = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    throw new UnauthorizedError(
      `There isn't any user with email: ${req.body.email}`,
    );

  if (!user.comparePassword(req.body.password))
    throw new UnauthorizedError(
      `Wrong password for user with email: ${req.body.email}`,
    );

  const token = signJWT(user);
  res.setHeader('Authorization', `Bearer ${token}`);

  return res.json(user.toJSON());
};

export default catchErrors(
  validateMethod('POST', validateBody(authLogin, connectDB(loginHandler))),
);
