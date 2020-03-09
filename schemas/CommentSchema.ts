import { Comment } from 'models';
import { object, string } from 'yup';

export const CommentSchema = object<Pick<Comment, 'body'>>({
  body: string().required(),
})
  .noUnknown(true)
  .strict(true);
