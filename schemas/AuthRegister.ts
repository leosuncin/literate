import { User } from 'models';
import { object, string } from 'yup';

type AuthRegister = Pick<User, 'fullName' | 'email' | 'password'>;

export const AuthRegister = object<AuthRegister>()
  .shape<AuthRegister>({
    fullName: string().min(3).required(),
    email: string().email().lowercase().required(),
    password: string().min(8).required(),
  })
  .noUnknown(true);
