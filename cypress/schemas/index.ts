import { combineSchemas, CustomFormat, detectors } from '@cypress/schema-tools';

import apiErrorSchema from './apiError.schema';
import userSchema from './user.schema';

const datetime: CustomFormat = {
  name: 'datetime',
  description: 'Date time ISO format',
  detect: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
  example: new Date().toISOString(),
};

export const schemas = combineSchemas(apiErrorSchema, userSchema);

export const formats = detectors({ datetime });
