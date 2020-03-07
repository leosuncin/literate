import jwt from 'jsonwebtoken';
import { User } from 'models';

export type JwtPayload = {
  id: string;
  username: string;
  iat: number;
  exp: number;
  iss: string;
};

export function signJWT(user: User): string {
  return jwt.sign(
    {
      id: user._id,
      displayName: user.displayName,
    },
    process.env.APP_SECRET,
    { expiresIn: '30 days' },
  );
}
