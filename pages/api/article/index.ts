import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import log from 'ololog';
import { ArticleCreate, Pagination } from 'schemas';
import { NextHttpHandler } from 'types';

const createArticleHandler: NextHttpHandler = async (req, res) => {
  const article = new Article(req.body);
  article.author = req.user;
  await article.save();

  return res.status(StatusCodes.CREATED).json(article.toJSON());
};
const findArticleHandler: NextHttpHandler = async (req, res) => {
  try {
    const { page, size } = await Pagination.validate(req.query);
    const articles = await Article.find()
      .populate('author')
      .limit(size)
      .skip(size * (page - 1));

    return res.json(articles);
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      statusCode: StatusCodes.BAD_REQUEST,
      message: getReasonPhrase(StatusCodes.BAD_REQUEST),
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
      log.error(`[${req.method}] ${req.url}`, error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }),
);
