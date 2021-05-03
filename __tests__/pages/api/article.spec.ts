import faker from 'faker';
import users from 'fixtures/users';
import { StatusCodes } from 'http-status-codes';
import type { ArticleJson, UserDocument } from 'models';
import type { LeanDocument } from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import Fixtures from 'node-mongodb-fixtures';
import articleApiHandler from 'pages/api/article';
import oneArticleApiHandler from 'pages/api/article/[slug]';
import { ErrorResponse } from 'types';
import * as db from 'utils/db';
import { signJWT } from 'utils/jwt';

const fixtures = new Fixtures({ mute: true });

const user = users[0] as LeanDocument<UserDocument>;

const anotherUser = users[users.length - 1] as LeanDocument<UserDocument>;

beforeAll(async () => {
  await fixtures.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await fixtures.unload();
  await fixtures.load();
  await fixtures.disconnect();
});

afterAll(async () => {
  await db.disconnect();
});

describe('[POST] /api/article', () => {
  let token: string;

  beforeAll(async () => {
    token = signJWT(user);
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "message": "Missing authorization header",
        "statusCode": 401,
      }
    `);
  });

  it('should validate the body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {},
    });

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          "subtitle is a required field",
          "title is a required field",
          "body is a required field",
          "tags is a required field",
        ],
        "message": "Validation errors",
        "statusCode": 422,
      }
    `);
  });

  it('should create an article', async () => {
    const body = {
      title: faker.company.catchPhrase(),
      subtitle: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
      tags: faker.lorem.words().split(' '),
    };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body,
    });

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(res._getJSONData()).toMatchObject<ArticleJson>({
      title: body.title,
      slug: expect.stringContaining(
        faker.helpers.slugify(body.title).toLowerCase(),
      ),
      subtitle: body.subtitle,
      draft: true,
      body: body.body,
      tags: expect.arrayContaining(body.tags),
      author: expect.stringMatching(/[\da-f]{24}/),
      createdAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
      updatedAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
    });
  });
});

describe('[GET] /api/article/[slug]', () => {
  it('should fail when article not exists', async () => {
    const query = {
      slug: faker.helpers.slugify(faker.hacker.phrase()),
    };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query,
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `Not found any article with slug: ${query.slug}`,
      statusCode: StatusCodes.NOT_FOUND,
    });
  });

  it('should get one article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        slug: '2020-nagorno-karabakh-conflict-nxg8n7',
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getJSONData()).toHaveProperty('author');
  });
});

describe('[GET] /api/article', () => {
  it('should validate pagination', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        page: -1,
        size: -10,
      },
    });

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.BAD_REQUEST);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "errors": Array [
          "page must be greater than or equal to 1",
        ],
        "message": "Bad Request",
        "statusCode": 400,
      }
    `);
  });

  it('should list the articles', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });
});

describe('[PUT] /api/article/[slug]', () => {
  let token: string;

  beforeAll(async () => {
    token = signJWT(user);
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      query: {
        slug: 'optio-et-voluptatibus-stv3jn',
      },
      body: {},
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should validate the body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: 'optio-et-voluptatibus-stv3jn',
      },
      body: {
        title: null,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: faker.helpers.slugify(faker.hacker.phrase()),
      },
      body: {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to edit an article that belong to other', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${signJWT(anotherUser)}`,
      },
      query: {
        slug: 'optio-et-voluptatibus-stv3jn',
      },
      body: {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
  });

  it('should edit an article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: 'optio-et-voluptatibus-stv3jn',
      },
      body: {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });
});

describe('[PATCH] /api/article/[slug]', () => {
  let token: string;

  beforeAll(async () => {
    token = signJWT(user);
  });

  it('should fail when article not exists', async () => {
    const slug = faker.helpers.slugify(faker.hacker.phrase()).toLowerCase();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: { slug },
      body: {
        draft: false,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `Not found any article with slug: ${slug}`,
      statusCode: 404,
    });
  });

  it('should not allow to change state of an article that belong to other', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${signJWT(anotherUser)}`,
      },
      query: {
        slug: 'funneling-branding-in-order-to-disrupt-the-balance-h7bs3m',
      },
      body: {
        draft: false,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "message": "You are not the author",
        "statusCode": 403,
      }
    `);
  });

  it('should change the state of an article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: 'funneling-branding-in-order-to-disrupt-the-balance-h7bs3m',
      },
      body: {
        draft: false,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getJSONData()).toHaveProperty('draft', false);
  });
});

describe('[DELETE] /api/article/[slug]', () => {
  let token: string;

  beforeAll(async () => {
    token = signJWT(user);
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      query: {
        slug: '2020-nagorno-karabakh-conflict-nxg8n7',
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: faker.helpers.slugify(faker.hacker.phrase()),
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to remove an article that belong to other', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${signJWT(anotherUser)}`,
      },
      query: {
        slug: '2020-nagorno-karabakh-conflict-nxg8n7',
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
  });

  it('should remove an article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: '2020-nagorno-karabakh-conflict-nxg8n7',
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NO_CONTENT);
  });
});
