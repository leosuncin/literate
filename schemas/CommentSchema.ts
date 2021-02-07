import { Comment } from 'models';
import { AnySchema, object, string } from 'yup';

type CommentSchema = Record<
  keyof Pick<Comment, 'body'>,
  AnySchema<Comment['body']>
>;

export const CommentSchema = object<CommentSchema>({
  body: string().required(),
})
  .noUnknown(true)
  .strict(true);
