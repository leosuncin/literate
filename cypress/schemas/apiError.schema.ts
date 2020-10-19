import { ObjectSchema, versionSchemas } from '@cypress/schema-tools';

const apiError100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'ApiError',
    description: 'Error response returned by the API',
    properties: {
      statusCode: {
        type: 'integer',
        minimum: 100,
        maximum: 599,
        description: 'The status code of the error',
      },
      message: {
        type: 'string',
        description: 'The message of the error',
      },
      errors: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'Validation error messages',
      },
    },
    required: ['statusCode', 'message'],
    additionalProperties: false,
  },
  example: {
    statusCode: 422,
    message: 'Unprocessable Entity',
    errors: [
      'fullName must be at least 3 characters',
      'email must be a valid email',
      'password must be at least 8 characters',
    ],
  },
};

export default versionSchemas(apiError100);
