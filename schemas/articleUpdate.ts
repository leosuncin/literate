import { array, InferType, object, string } from 'yup';

export type ArticleUpdate = InferType<typeof articleUpdate>;

export const articleUpdate = object({
  title: string().min(5).trim(),
  subtitle: string().min(8).trim(),
  body: string(),
  tags: array().of(string().trim().required()).min(1).max(5).compact(),
})
  .noUnknown(true)
  .strict(true);
