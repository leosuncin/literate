import { InferType, object, string } from 'yup';

export type AuthLogin = InferType<typeof authLogin>;

export const authLogin = object({
  email: string().email().lowercase().required(),
  password: string().min(8).required(),
})
  .noUnknown(true)
  .strict(true);
