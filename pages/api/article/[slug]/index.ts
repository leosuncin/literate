import { StatusCodes } from 'http-status-codes';
import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import { ArticlePatch, ArticleUpdate } from 'schemas';
import { HttpError, NextHttpHandler } from 'types';

const showArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    throw new HttpError(
      `Not found any article with slug: ${req.query.slug}`,
      StatusCodes.NOT_FOUND,
    );

  return res.json(article.toJSON());
};
const editArticleHandler: NextHttpHandler = async (req, res) => {
  let article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    throw new HttpError(
      `Not found any article with slug: ${req.query.slug}`,
      StatusCodes.NOT_FOUND,
    );

  if (article.author.id !== req.user.id)
    throw new HttpError('You are not the author', StatusCodes.FORBIDDEN);

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
    throw new HttpError(
      `Not found any article with slug: ${req.query.slug}`,
      StatusCodes.NOT_FOUND,
    );

  if (article.author.id !== req.user.id)
    throw new HttpError('You are not the author', StatusCodes.FORBIDDEN);

  await article.remove();

  return res.status(StatusCodes.NO_CONTENT).json(null);
};

const patchArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    throw new HttpError(
      `Not found any article with slug: ${req.query.slug}`,
      StatusCodes.NOT_FOUND,
    );

  if (article.author.id !== req.user.id)
    throw new HttpError('You are not the author', StatusCodes.FORBIDDEN);

  article.draft = req.body.draft;
  await article.save();

  return res.json({ draft: article.draft });
};

export default catchErrors(
  validateMethod(
    ['GET', 'PUT', 'DELETE', 'PATCH'],
    connectDB((req, res) => {
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
    }),
  ),
);
