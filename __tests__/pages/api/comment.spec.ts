import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import type {
  ArticleDocument,
  CommentDocument,
  CommentJson,
  UserDocument,
} from 'models';
import { Article, Comment, User } from 'models';
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import commentApiHandler from 'pages/api/article/[slug]/comment';
import oneCommentApiHandler from 'pages/api/article/[slug]/comment/[id]';
import { ErrorResponse } from 'types';
import * as db from 'utils/db';
import { signJWT } from 'utils/jwt';

async function prepareTest() {
  const user = new User({
    fullName: faker.name.findName(),
    email: faker.internet.exampleEmail(),
    password: faker.internet.password(),
  });

  await user.save();

  const article = new Article({
    title: faker.company.catchPhrase(),
    subtitle: faker.lorem.paragraph(),
    body: faker.lorem.paragraphs(),
    tags: faker.lorem.words().split(' '),
    author: user._id,
  });

  await article.save();

  const token = signJWT(user);

  return { token, article, user };
}

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

describe('[POST] /api/article/[slug]/comment', () => {
  let token: string;
  let article: ArticleDocument;

  beforeAll(async () => {
    const result = await prepareTest();
    token = result.token;
    article = result.article;
  });

  it('should fail when article not exists', async () => {
    const slug = faker.lorem.slug(5);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: { slug },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `Not found any article with slug: ${slug}`,
      statusCode: res._getStatusCode(),
    });
  });

  it('should add a new comment', async () => {
    const body = {
      body: faker.lorem.paragraph(),
    };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: article.slug,
      },
      body,
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.CREATED);
    expect(res._getJSONData()).toMatchObject<CommentJson>({
      id: expect.stringMatching(/[\da-f]{24}/),
      body: body.body,
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

describe('[GET] /api/article/[slug]/comment/[id]', () => {
  let comment: CommentDocument;
  let article: ArticleDocument;

  beforeAll(async () => {
    const result = await prepareTest();
    comment = new Comment({
      body: faker.lorem.paragraph(),
      article: result.article,
      author: result.user,
    });
    await comment.save();
    article = result.article;
  });

  it('should fail when comment not exists', async () => {
    const id = faker.datatype.hexaDecimal(24).substr(2);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug: article.slug,
        id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `Not found any comment with id: ${id}`,
      statusCode: res._getStatusCode(),
    });
  });

  it('should get one comment', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug: article.slug,
        id: comment.id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });
});

describe('[GET] /api/article/[slug]/comment', () => {
  let article: ArticleDocument;

  beforeAll(async () => {
    const result = await prepareTest();
    article = result.article;
  });

  it('should fail when article not exists', async () => {
    const slug = faker.lorem.slug(5);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      query: {
        slug,
      },
    });

    await commentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
    expect(res._getJSONData()).toMatchObject<ErrorResponse>({
      message: `Not found any article with slug: ${slug}`,
      statusCode: res._getStatusCode(),
    });
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
  let comment: CommentDocument;
  let article: ArticleDocument;
  let user: UserDocument;

  beforeAll(async () => {
    const result = await prepareTest();
    token = result.token;
    article = result.article;
    user = result.user;
    comment = new Comment({
      body: faker.lorem.paragraph(),
      article: result.article,
      author: user,
    });
    await comment.save();
  });

  it('should fail when comment not exists', async () => {
    const id = faker.datatype.hexaDecimal(24).substr(2);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: article.slug,
        id,
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to edit a comment that belong to other', async () => {
    const otherUser = await new User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    }).save();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${signJWT(otherUser)}`,
      },
      query: {
        slug: article.slug,
        id: comment.id,
      },
      body: {
        body: faker.lorem.paragraph(),
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.FORBIDDEN);
    expect(res._getJSONData()).toMatchInlineSnapshot(`
      Object {
        "message": "You are not the author",
        "statusCode": 403,
      }
    `);
  });

  it('should edit a comment', async () => {
    const body = {
      body: faker.lorem.paragraph(),
    };
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: article.slug,
        id: comment.id,
      },
      body,
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.OK);
    expect(res._getJSONData()).toMatchObject<CommentJson>({
      id: expect.stringMatching(/[\da-f]{24}/),
      body: body.body,
      author: {
        avatar: user.avatar,
        bio: user.bio,
        displayName: user.displayName,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      createdAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
      updatedAt: expect.stringMatching(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/,
      ),
    });
  });
});

describe('[DELETE] /api/article/[slug]/comment/[id]', () => {
  let token: string;
  let comment: CommentDocument;
  let article: ArticleDocument;

  beforeAll(async () => {
    const result = await prepareTest();
    article = result.article;
    token = result.token;
    comment = await new Comment({
      body: faker.lorem.paragraph(),
      article: result.article,
      author: result.user,
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
    const id = faker.datatype.hexaDecimal(24).substr(2);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${token}`,
      },
      query: {
        slug: article.slug,
        id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NOT_FOUND);
  });

  it('should not allow to remove a comment that belong to other', async () => {
    const otherUser = await new User({
      fullName: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
    }).save();
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${signJWT(otherUser)}`,
      },
      query: {
        slug: article.slug,
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
        slug: article.slug,
        id: comment.id,
      },
    });

    await oneCommentApiHandler(req as any, res);

    expect(res._getStatusCode()).toBe(StatusCodes.NO_CONTENT);
  });
});
