import { combineSchemas, CustomFormat, detectors } from '@cypress/schema-tools';

import apiErrorSchema from './apiError.schema';
import articleSchema from './article.schema';
import commentSchema from './comment.schema';
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

const objectid: CustomFormat = {
  name: 'objectid',
  description: 'ObjectId from MongoDB',
  detect: /^[a-f0-9]{24}$/,
  example: '5f8d211627b977eec9bc140e',
};

export const schemas = combineSchemas(
  apiErrorSchema,
  userSchema,
  articleSchema,
  commentSchema,
);

export const formats = detectors({ datetime, slug, objectid });
