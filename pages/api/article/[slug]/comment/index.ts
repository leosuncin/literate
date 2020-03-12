import { CREATED, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article, Comment } from 'models';
import { CommentSchema, Pagination } from 'schemas';
import { NextHttpHandler } from 'types';

const createCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = new Comment(req.body);
  const article = await Article.findOne({ slug: req.query.slug as string });
  comment.article = article;
  comment.author = req.user;

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  await comment.save();

  return res.status(CREATED).json(comment.toJSON());
};

const listCommentHandler: NextHttpHandler = async (req, res) => {
  const { page, size } = await Pagination.validate(req.query);
  const article = await Article.findOne({ slug: req.query.slug as string });
  const comments = await Comment.find({ article })
    .populate('author')
    .limit(size)
    .skip(size * (page - 1));

  if (!article)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  return res.json(comments);
};

export default validateMethod(
  ['GET', 'POST'],
  connectDB((req, res) => {
    try {
      switch (req.method) {
        case 'POST':
          return withAuthentication(
            validateBody(CommentSchema, createCommentHandler),
          )(req, res);
        case 'GET':
          return listCommentHandler(req, res);
      }
    } catch (error) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        statusCode: INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }),
);
