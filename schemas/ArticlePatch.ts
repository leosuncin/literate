import { Article } from 'models';
import { AnySchema, boolean, object } from 'yup';

type ArticlePatch = Record<
  keyof Pick<Article, 'draft'>,
  AnySchema<Article['draft']>
>;

export const ArticlePatch = object<ArticlePatch>({
  draft: boolean().required(),
}).noUnknown();
