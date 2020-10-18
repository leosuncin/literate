import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import type { Article, Comment } from 'models';
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import commentApiHandler from 'pages/api/article/[slug]/comment';
import oneCommentApiHandler from 'pages/api/article/[slug]/comment/[id]';
import * as db from 'utils/db';
import { signJWT } from 'utils/jwt';

async function prepareTest() {
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

  const token = signJWT(user);
  const article = await new mongoose.models.Article({
    title: faker.company.catchPhrase(),
    subtitle: faker.lorem.paragraph(),
    body: faker.lorem.paragraphs(),
    tags: faker.lorem.words().split(' '),
    author: user,
  }).save();

  return { token, article };
}

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

describe('[POST] /api/article/[slug]/comment', () => {
  let token: string;
  let article: Article;

  beforeAll(async () => {
    const result = await prepareTest();
    token = result.token;
    article = result.article;
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: faker.lorem.slug(5),
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should add a new comment', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: article.slug,
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
  });
});

describe('[GET] /api/article/[slug]/comment/[id]', () => {
  let comment: Comment;

  beforeAll(async () => {
    const result = await prepareTest();
    const author = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    comment = await new mongoose.models.Comment({
      body: faker.lorem.paragraph(),
      article: result.article,
      author,
    }).save();
  });

  it('should fail when comment not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug: comment.article.slug,
        id: mongoose.Types.ObjectId(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should get one comment', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug: comment.article.slug,
        id: comment.id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });
});

describe('[GET] /api/article/[slug]/comment', () => {
  let article: Article;

  beforeAll(async () => {
    const result = await prepareTest();
    article = result.article;
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug: faker.lorem.slug(5),
      },
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should list the comments', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug: article.slug,
      },
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(Array.isArray(res._getJSONData())).toBe(true);
  });
});

describe('[PUT] /api/article/[slug]/comment/[id]', () => {
  let token: string;
  let comment: Comment;

  beforeAll(async () => {
    const result = await prepareTest();
    const author = await mongoose.models.User.findOne({
      email: 'john@doe.me',
    }).exec();
    token = result.token;
    comment = await new mongoose.models.Comment({
      body: faker.lorem.paragraph(),
      article: result.article,
      author,
    }).save();
  });

  it('should fail when comment not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: comment.article.slug,
        id: mongoose.Types.ObjectId(),
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to edit a comment that belong to other', async () => {
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
        slug: comment.article.slug,
        id: comment.id,
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
  });

  it('should edit a comment', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: comment.article.slug,
        id: comment.id,
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });
});

describe('[DELETE] /api/article/[slug]/comment/[id]', () => {
  let token: string;
  let comment: Comment;

  beforeAll(async () => {
    const result = await prepareTest();
    const author = await new mongoose.models.User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }).save();
    token = signJWT(author);
    comment = await new mongoose.models.Comment({
      body: faker.lorem.paragraph(),
      article: result.article,
      author,
    }).save();
  });

  it('should fail when article not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: faker.lorem.slug(5),
        id: comment.id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should fail when comment not exists', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: comment.article.slug,
        id: mongoose.Types.ObjectId(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to remove a comment that belong to other', async () => {
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
        slug: comment.article.slug,
        id: comment.id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
  });

  it('should remove a comment', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: comment.article.slug,
        id: comment.id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NO_CONTENT);
  });
});
