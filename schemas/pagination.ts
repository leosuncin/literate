import { InferType, number, object } from 'yup';

export type Pagination = InferType<typeof pagination>;

export const pagination = object({
  size: number().positive().integer().min(1).nullable().default(10),
  page: number().positive().integer().min(1).nullable().default(1),
}).nullable();
