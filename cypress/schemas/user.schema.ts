import { ObjectSchema, versionSchemas } from '@cypress/schema-tools';

const user100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'User',
    description: 'User response returned by the API',
    properties: {
      bio: {
        type: ['string', 'null'],
        description: 'The biography of the user',
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'The email of the user',
      },
      fullName: {
        type: 'string',
        description: 'The full name of the user',
      },
      displayName: {
        type: 'string',
        description: 'The display name of the user',
      },
      avatar: {
        type: 'string',
        format: 'url',
        description: 'The avatar URL of the user',
      },
      createdAt: {
        type: 'string',
        format: 'datetime',
        description: 'Created at of the user',
      },
      updatedAt: {
        type: 'string',
        format: 'datetime',
        description: 'Updated at of the user',
      },
    },
    required: true,
    additionalProperties: false,
  },
  example: {
    bio: null,
    email: 'ramon_barton28@example.org',
    fullName: 'Philip Wisozk',
    displayName: 'Philip Wisozk',
    avatar: 'https://api.adorable.io/avatars/64/Philip%20Wisozk',
    createdAt: '2020-10-19T02:25:56.834Z',
    updatedAt: '2020-10-19T02:25:56.834Z',
  },
};

export default versionSchemas(user100);
