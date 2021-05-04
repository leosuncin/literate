import { boolean, InferType, object } from 'yup';

export type ArticlePatch = InferType<typeof articlePatch>;

export const articlePatch = object({
  draft: boolean().required(),
})
  .noUnknown(true)
  .strict(true);
