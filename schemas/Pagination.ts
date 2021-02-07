import { number, NumberSchema, object } from 'yup';

type Pagination = {
  size?: NumberSchema;
  page?: NumberSchema;
};

export const Pagination = object<Pagination>({
  size: number().positive().integer().min(1).nullable().default(10),
  page: number().positive().integer().min(1).nullable().default(1),
}).nullable();
