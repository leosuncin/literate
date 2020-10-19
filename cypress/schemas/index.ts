import { combineSchemas, CustomFormat, detectors } from '@cypress/schema-tools';

import apiErrorSchema from './apiError.schema';
import articleSchema from './article.schema';
import userSchema from './user.schema';

const datetime: CustomFormat = {
  name: 'datetime',
  description: 'Date time ISO format',
  detect: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  example: new Date().toISOString(),
};

const slug: CustomFormat = {
  name: 'slug',
  description: 'Date time ISO format',
  detect: /[a-z0-9]+-?/,
  example: 'lorem-ipsum-dolorem',
};

export const schemas = combineSchemas(
  apiErrorSchema,
  userSchema,
  articleSchema,
);

export const formats = detectors({ datetime, slug });
