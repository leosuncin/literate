import { UserBase as User } from 'models';
import { AnySchema, object, string } from 'yup';

type AuthRegister = Record<
  keyof Pick<User, 'fullName' | 'email' | 'password'>,
  AnySchema<User['fullName' | 'email' | 'password']>
>;

export const AuthRegister = object<AuthRegister>()
  .shape<AuthRegister>({
    fullName: string().min(3).required(),
    email: string().email().lowercase().required(),
    password: string().min(8).required(),
  })
  .noUnknown(true);
