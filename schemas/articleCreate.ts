import { array, InferType, object, string } from 'yup';

export type ArticleCreate = InferType<typeof articleCreate>;

export const articleCreate = object({
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
