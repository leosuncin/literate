import { StatusCodes } from 'http-status-codes';
import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import { articleCreate, pagination } from 'schemas';
import { NextHttpHandler } from 'types';

const createArticleHandler: NextHttpHandler = async (req, res) => {
  const article = new Article({ ...req.body, author: req.user });
  await article.save();

  return res.status(StatusCodes.CREATED).json(article.toJSON());
};

const findArticleHandler: NextHttpHandler = async (req, res) => {
  const { page, size } = await pagination.validate(req.query);
  const articles = await Article.find()
    .populate('author')
    .limit(size)
    .skip(size * (page - 1));

  return res.json(articles);
};

export default catchErrors(
  validateMethod(
    ['POST', 'GET'],
    connectDB((req, res) => {
      switch (req.method) {
        case 'POST':
          return withAuthentication(
            validateBody(articleCreate, createArticleHandler),
          )(req, res);
        case 'GET':
          return findArticleHandler(req, res);
      }
    }),
  ),
);
