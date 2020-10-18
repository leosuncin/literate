import { StatusCodes } from 'http-status-codes';
import { connectDB, validateBody, validateMethod } from 'middlewares';
import { User } from 'models';
import log from 'ololog';
import { AuthLogin } from 'schemas';
import { NextHttpHandler } from 'types';
import { signJWT } from 'utils/jwt';

const loginHandler: NextHttpHandler = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: `There isn't any user with email: ${req.body.email}`,
      });

    if (!user.comparePassword(req.body.password)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: `Wrong password for user with email: ${req.body.email}`,
      });
    }

    const token = signJWT(user);
    res.setHeader('Authorization', `Bearer ${token}`);

    return res.json(user.toJSON());
  } catch (error) {
    log.error(`[${req.method}] ${req.url}`, error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

export default validateMethod(
  'POST',
  validateBody(AuthLogin, connectDB(loginHandler)),
);
