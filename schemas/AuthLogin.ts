import type { UserBase as User } from 'models';
import { AnySchema, object, string } from 'yup';

type AuthLogin = Record<
  keyof Pick<User, 'email' | 'password'>,
  AnySchema<User['email' | 'password']>
>;

export const AuthLogin = object<AuthLogin>()
  .shape<AuthLogin>({
    email: string().email().lowercase().required(),
    password: string().min(8).required(),
  })
  .noUnknown(true);
