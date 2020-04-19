import { User } from 'models';
import { object, string } from 'yup';

type AuthLogin = Pick<User, 'email' | 'password'>;

export const AuthLogin = object<AuthLogin>()
  .shape<AuthLogin>({
    email: string().email().lowercase().required(),
    password: string().min(8).required(),
  })
  .noUnknown(true);
