import {
  BAD_REQUEST,
  CREATED,
  getStatusText,
  INTERNAL_SERVER_ERROR,
} from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import { ArticleCreate, Pagination } from 'schemas';
import { NextHttpHandler } from 'types';

const createArticleHandler: NextHttpHandler = async (req, res) => {
  const article = new Article(req.body);
  article.author = req.user;
  await article.save();
  res.status(CREATED).json(article.toJSON());
};
const findArticleHandler: NextHttpHandler = async (req, res) => {
  try {
    const { page, size } = await Pagination.validate(req.query);
    const articles = await Article.find()
      .populate('author')
      .limit(size)
      .skip(size * (page - 1));

    res.json(articles);
  } catch (error) {
    res.status(BAD_REQUEST).json({
      statusCode: BAD_REQUEST,
      message: getStatusText(BAD_REQUEST),
      errors: error.errors,
    });
  }
};

export default validateMethod(
  ['POST', 'GET'],
  connectDB((req, res) => {
    try {
      switch (req.method) {
        case 'POST':
          return withAuthentication(
            validateBody(ArticleCreate, createArticleHandler),
          )(req, res);
        case 'GET':
          return findArticleHandler(req, res);
      }
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({
        statusCode: INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }),
);
