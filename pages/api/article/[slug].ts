import { FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import { ArticleUpdate } from 'schemas';
import { NextHttpHandler } from 'types';

const showArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({ slug: req.query.slug }).populate(
    'author',
  );

  if (!article)
    res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });
  else res.json(article.toJSON());
};
const editArticleHandler: NextHttpHandler = async (req, res) => {
  let article = await Article.findOne({ slug: req.query.slug }).populate(
    'author',
  );

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

  res.json(article.toJSON());
};

export default validateMethod(
  ['GET', 'PUT'],
  connectDB((req, res) => {
    try {
      switch (req.method) {
        case 'GET':
          return showArticleHandler(req, res);
        case 'PUT':
          return withAuthentication(
            validateBody(ArticleUpdate, editArticleHandler),
          )(req, res);
      }
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({
        statusCode: INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }),
);
