import { Article } from 'models';
import { array, object, string } from 'yup';

type ArticleCreate = Pick<Article, 'title' | 'subtitle' | 'body' | 'tags'>;

export const ArticleCreate = object<ArticleCreate>()
  .shape<ArticleCreate>({
    title: string().min(5).trim().required(),
    subtitle: string().min(8).trim().required(),
    body: string().required(),
    tags: array()
      .of(string().trim().required())
      .min(1)
      .max(5)
      .required()
      .compact(),
  })
  .noUnknown(true)
  .strict(true);
