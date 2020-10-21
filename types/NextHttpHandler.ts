import type { User } from 'models';
import type { NextApiRequest, NextApiResponse } from 'next';

import type { ErrorResponse } from './HttpError';

export type NextHttpHandler<T = Record<string, any>> = (
  req: NextApiRequest & { user: Readonly<User> | undefined },
  res: NextApiResponse<T | ErrorResponse>,
) => void | Promise<void>;
