import { InferType, object, string } from 'yup';

export type CommentCreate = InferType<typeof commentCreate>;

export const commentCreate = object({
  body: string().required(),
})
  .noUnknown(true)
  .strict(true);
