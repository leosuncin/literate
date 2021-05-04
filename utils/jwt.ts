import jwt from 'jsonwebtoken';
import type { UserDocument as User } from 'models';

export type JwtPayload = {
  id: string;
  displayName: string;
  iat: number;
  exp: number;
  iss: string;
};

export function signJWT(user: Pick<User, '_id' | 'displayName'>): string {
  return jwt.sign(
    {
      id: user._id,
      displayName: user.displayName,
    },
    process.env.APP_SECRET,
    { expiresIn: '30 days' },
  );
}

export function decodeJWT(token: string): JwtPayload {
  return jwt.verify(token, process.env.APP_SECRET) as JwtPayload;
}
