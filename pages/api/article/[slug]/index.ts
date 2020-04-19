import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NO_CONTENT,
  NOT_FOUND,
} from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import { ArticlePatch, ArticleUpdate } from 'schemas';
import { NextHttpHandler } from 'types';

const showArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  return res.json(article.toJSON());
};
const editArticleHandler: NextHttpHandler = async (req, res) => {
  let article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  if (article.author.id !== req.user.id)
    return res.status(FORBIDDEN).json({
      statusCode: FORBIDDEN,
      message: 'You are not the author',
    });

  for (const property in req.body) {
    article[property] = req.body[property];
  }

  if (article.isModified('title'))
    res.setHeader('Location', `/api/article/${article.slug}`);

  article = await article.save();

  return res.json(article.toJSON());
};
const removeArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  if (article.author.id !== req.user.id)
    return res.status(FORBIDDEN).json({
      statusCode: FORBIDDEN,
      message: 'You are not the author',
    });

  return res.status(NO_CONTENT).json(await article.remove());
};
const patchArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  if (article.author.id !== req.user.id)
    return res.status(FORBIDDEN).json({
      statusCode: FORBIDDEN,
      message: 'You are not the author',
    });

  article.draft = req.body.draft;
  await article.save();

  return res.json({ draft: article.draft });
};

export default validateMethod(
  ['GET', 'PUT', 'DELETE', 'PATCH'],
  connectDB((req, res) => {
    try {
      switch (req.method) {
        case 'GET':
          return showArticleHandler(req, res);
        case 'PUT':
          return withAuthentication(
            validateBody(ArticleUpdate, editArticleHandler),
          )(req, res);
        case 'DELETE':
          return withAuthentication(removeArticleHandler)(req, res);
        case 'PATCH':
          return withAuthentication(
            validateBody(ArticlePatch, patchArticleHandler),
          )(req, res);
      }
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        statusCode: INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }),
);
