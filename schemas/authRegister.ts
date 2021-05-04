import { InferType, object, string } from 'yup';

export type AuthRegister = InferType<typeof authRegister>;

export const authRegister = object({
  fullName: string().min(3).required(),
  email: string().email().lowercase().required(),
  password: string().min(8).required(),
})
  .noUnknown(true)
  .strict(true);
