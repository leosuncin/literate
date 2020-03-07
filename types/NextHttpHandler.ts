import type { NextApiRequest, NextApiResponse } from 'next';
import type { HttpError } from './HttpError';

export type NextHttpHandler<T = Record<string, any>> = (
  req: NextApiRequest,
  res: NextApiResponse<T | HttpError>,
) => void | Promise<void>;
