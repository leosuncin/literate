import { CREATED, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article } from 'models';
import { ArticleCreate } from 'schemas';
import { NextHttpHandler } from 'types';

const createArticleHandler: NextHttpHandler = async (req, res) => {
  try {
    const article = new Article(req.body);
    article.author = req.user;
    await article.save();
    res.status(CREATED).json(article.toJSON());
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({
      statusCode: INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

export default validateMethod(
  ['POST', 'GET'],
  connectDB(
    withAuthentication(
      validateBody(ArticleCreate, (req, res) => {
        switch (req.method) {
          case 'POST':
            return createArticleHandler(req, res);
        }
      }),
    ),
  ),
);
