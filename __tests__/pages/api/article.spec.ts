import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import type { Article } from 'models';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import articleApiHandler from 'pages/api/article';
import oneArticleApiHandler from 'pages/api/article/[slug]';
import * as db from 'utils/db';
import { signJWT } from 'utils/jwt';

async function createToken() {
  const queryUser = { email: 'john@doe.me' };
  await mongoose.models.User.findOneAndUpdate(
    queryUser,
    {
      fullName: 'John Doe',
      email: 'john@doe.me',
      password: 'Pa$$w0rd!',
    },
    {
      upsert: true,
    },
  ).exec();
  const user = await mongoose.models.User.findOne(queryUser).exec();

  return signJWT(user);
}

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

describe('[POST] /api/article', () => {
  let token: string;

  beforeAll(async () => {
    token = await createToken();
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {},
    });

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
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
  });

  it('should create an article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
      },
    });

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
  });
});

describe('[GET] /api/article/[slug]', () => {
  let article: Article;

  beforeAll(async () => {
    const user = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    article = await new mongoose.models.Article({
      title: faker.company.catchPhrase(),
      subtitle: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
      tags: faker.lorem.words().split(' '),
      author: user,
    }).save();
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        slug: faker.helpers.slugify(faker.hacker.phrase()),
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should get one article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: {
        slug: article.slug,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getJSONData()).toHaveProperty('author');
  });
});

describe('[GET] /api/article', () => {
  beforeAll(async () => {
    const user = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    await mongoose.models.Article.insertMany([
      {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
        author: user,
      },
      {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
        author: user,
      },
      {
        title: faker.company.catchPhrase(),
        subtitle: faker.lorem.paragraph(),
        body: faker.lorem.paragraphs(),
        tags: faker.lorem.words().split(' '),
        author: user,
      },
    ]);
  });

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
  });

  it('should list the articles', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    await articleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });
});

describe('[PUT] /api/article/[slug]', () => {
  let article: Article;
  let token: string;

  beforeAll(async () => {
    token = await createToken();
    const user = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    article = await new mongoose.models.Article({
      title: faker.company.catchPhrase(),
      subtitle: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
      tags: faker.lorem.words().split(' '),
      author: user,
    }).save();
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      query: {
        slug: article.slug,
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
        slug: article.slug,
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
    const other = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    }).save();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${signJWT(other)}`,
      },
      query: {
        slug: article.slug,
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
        slug: article.slug,
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
  let article: Article;
  let token: string;

  beforeAll(async () => {
    token = await createToken();
    const user = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    article = await new mongoose.models.Article({
      title: faker.company.catchPhrase(),
      subtitle: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
      tags: faker.lorem.words().split(' '),
      author: user,
    }).save();
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: faker.helpers.slugify(faker.hacker.phrase()),
      },
      body: {
        draft: false,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to change state of an article that belong to other', async () => {
    const other = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    }).save();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${signJWT(other)}`,
      },
      query: {
        slug: article.slug,
      },
      body: {
        draft: false,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
  });

  it('should change the state of an article', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: article.slug,
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
  let article: Article;
  let token: string;

  beforeAll(async () => {
    token = await createToken();
    const user = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    article = await new mongoose.models.Article({
      title: faker.company.catchPhrase(),
      subtitle: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
      tags: faker.lorem.words().split(' '),
      author: user,
    }).save();
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      query: {
        slug: article.slug,
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
    const other = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    }).save();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${signJWT(other)}`,
      },
      query: {
        slug: article.slug,
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
        slug: article.slug,
      },
    });

    await oneArticleApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NO_CONTENT);
  });
});
