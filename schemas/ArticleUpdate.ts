import { Article } from 'models';
import { array, object, string } from 'yup';

type ArticleUpdate = Pick<Article, 'title' | 'subtitle' | 'body' | 'tags'>;

export const ArticleUpdate = object<ArticleUpdate>()
  .shape<ArticleUpdate>({
    title: string().min(5).trim(),
    subtitle: string().min(8).trim(),
    body: string(),
    tags: array().of(string().trim().required()).min(1).max(5).compact(),
  })
  .noUnknown(true)
  .strict(true);
