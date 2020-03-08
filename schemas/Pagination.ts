import { number, object } from 'yup';

type Pagination = {
  size?: number;
  page?: number;
};

export const Pagination = object<Pagination>({
  size: number()
    .positive()
    .integer()
    .min(1)
    .nullable()
    .default(10),
  page: number()
    .positive()
    .integer()
    .min(1)
    .nullable()
    .default(1),
}).nullable();
