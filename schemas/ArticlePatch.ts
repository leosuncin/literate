import { Article } from 'models';
import { boolean, object } from 'yup';

export const ArticlePatch = object<Pick<Article, 'draft'>>({
  draft: boolean().required(),
}).noUnknown();
