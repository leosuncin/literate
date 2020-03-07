import { object, string } from 'yup';
import { User } from 'models';

type AuthLogin = Pick<User, 'email' | 'password'>;

export const AuthLogin = object<AuthLogin>()
  .shape<AuthLogin>({
    email: string()
      .email()
      .lowercase()
      .required(),
    password: string()
      .min(8)
      .required(),
  })
  .noUnknown(true);
