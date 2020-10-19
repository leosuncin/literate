import { ObjectSchema, versionSchemas } from '@cypress/schema-tools';

import { user100 } from './user.schema';

const comment100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'Comment',
    description: 'Comment response returned by the API',
    properties: {
      id: {
        type: 'string',
        format: 'objectid',
        description: 'The identifier of the comment',
      },
      body: {
        type: 'string',
        description: 'The body of the comment',
      },
      author: {
        ...user100.schema,
        see: user100,
      },
      createdAt: {
        type: 'string',
        format: 'datetime',
        description: 'Created at of the comment',
      },
      updatedAt: {
        type: 'string',
        format: 'datetime',
        description: 'Updated at of the comment',
      },
    },
    required: true,
    additionalProperties: false,
  },
  example: {
    author: {
      avatar: 'https://api.adorable.io/avatars/64/Lamarr%20Workman',
      bio:
        'Lorem Khaled Ipsum is a major key to success. Every chance I get, I water the plants, Lion! Every chance I get',
      createdAt: '2020-10-19T21:31:58.189Z',
      displayName: 'Lamarr Workman',
      email: 'lamarr_workman@example.com',
      fullName: 'Lamarr Workman',
      updatedAt: '2020-10-19T21:31:58.189Z',
    },
    body:
      'Aut assumenda omnis. Inventore corrupti et est consequuntur ut omnis dolorum minima consequatur. Fuga odio optio cupiditate amet et qui.',
    createdAt: '2020-10-19T21:31:18.521Z',
    id: '5f8e05a6c555ebd1dd4782b8',
    updatedAt: '2020-10-19T21:31:18.521Z',
  },
};

export default versionSchemas(comment100);
