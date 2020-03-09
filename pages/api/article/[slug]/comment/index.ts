import { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article, Comment } from 'models';
import { CommentSchema } from 'schemas';
import { NextHttpHandler } from 'types';

const createCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = new Comment(req.body);
  const article = await Article.findOne({ slug: req.query.slug });
  comment.article = article;
  comment.author = req.user;

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  await comment.save();

  res.status(CREATED).json(comment.toJSON());
};

export default validateMethod(
  'POST',
  connectDB((req, res) => {
    try {
      switch (req.method) {
        case 'POST':
          return withAuthentication(
            validateBody(CommentSchema, createCommentHandler),
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
