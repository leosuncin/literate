import { ObjectSchema, versionSchemas } from '@cypress/schema-tools';

import { user100 } from './user.schema';

const article100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  schema: {
    type: 'object',
    title: 'Article',
    description: 'Article response returned by the API',
    properties: {
      draft: {
        type: 'boolean',
        defaultValue: true,
        description: 'Is article a draft',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'The tags of the article',
      },
      title: {
        type: 'string',
        description: 'The title of the article',
      },
      subtitle: {
        type: 'string',
        description: 'The subtitle of the article',
      },
      body: {
        type: 'string',
        description: 'The body of the article',
      },
      slug: {
        type: 'string',
        format: 'slug',
        description: 'The body of the article',
      },
      author: {
        ...user100.schema,
        see: user100,
      },
      createdAt: {
        type: 'string',
        format: 'datetime',
        description: 'Created at of the article',
      },
      updatedAt: {
        type: 'string',
        format: 'datetime',
        description: 'Updated at of the article',
      },
    },
    required: true,
    additionalProperties: false,
  },
  example: {
    draft: true,
    tags: ['wireless', 'cross-platform', 'digital'],
    title: 'fugiat soluta ea',
    subtitle: 'Qui rerum laborum et possimus temporibus nemo.',
    body:
      'Suscipit illum minima. Ut totam consectetur omnis minima quo vitae quas temporibus itaque. At error corporis quo. Esse error omnis quia reiciendis id debitis totam voluptate. Minima consequuntur nobis omnis eos quam a. Qui quis illo earum et sed laborum.',
    author: {
      bio:
        'Bacon ipsum dolor amet cow esse veniam incididunt officia, swine sausage. Brisket deserunt lorem ullamco, do cupidatat bresaola nulla alcatra minim chicken laborum eu ground round pork. Rump beef ribs in tempor velit aliqua beef est nostrud lorem pork chop ad frankfurter boudin esse. Cillum commodo buffalo, pariatur ground round quis t-bone lorem chicken eiusmod.',
      fullName: 'John Doe',
      displayName: 'John',
      email: 'john@doe.me',
      avatar: 'https://api.adorable.io/avatars/64/John%20Doe',
      createdAt: '2020-10-19T00:49:01.725Z',
      updatedAt: '2020-10-19T00:49:01.725Z',
    },
    slug: 'fugiat-soluta-ea-nxg8n7',
    createdAt: '2020-10-19T04:54:51.141Z',
    updatedAt: '2020-10-19T04:54:51.141Z',
  },
};

export default versionSchemas(article100);
