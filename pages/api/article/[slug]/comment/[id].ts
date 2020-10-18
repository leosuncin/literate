import { StatusCodes } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article, Comment } from 'models';
import log from 'ololog';
import { CommentSchema } from 'schemas';
import { NextHttpHandler } from 'types';

const showCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');

  if (!comment)
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: StatusCodes.NOT_FOUND,
      message: `Not found any comment with id: ${req.query.id}`,
    });

  return res.json(comment.toJSON());
};
const editCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');

  if (!comment)
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: StatusCodes.NOT_FOUND,
      message: `Not found any comment with id: ${req.query.id}`,
    });

  if (comment.author.id !== req.user.id)
    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      message: 'You are not the author',
    });

  comment.body = req.body.body;

  return res.json(await comment.save());
};
const removeCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');
  const article = await Article.findOne({
    slug: req.query.slug as string,
  }).populate('author');

  if (!article)
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: StatusCodes.NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  if (!comment)
    return res.status(StatusCodes.NOT_FOUND).json({
      statusCode: StatusCodes.NOT_FOUND,
      message: `Not found any comment with id: ${req.query.id}`,
    });

  const hasAuthorization =
    req.user.id === article.author.id || req.user.id === comment.author.id;

  if (!hasAuthorization)
    return res.status(StatusCodes.FORBIDDEN).json({
      statusCode: StatusCodes.FORBIDDEN,
      message: 'You are not the author of the article or comment',
    });

  return res.status(StatusCodes.NO_CONTENT).json(await article.remove());
};

export default validateMethod(
  ['GET', 'PUT', 'DELETE'],
  connectDB((req, res) => {
    try {
      switch (req.method) {
        case 'GET':
          return showCommentHandler(req, res);
        case 'PUT':
          return withAuthentication(
            validateBody(CommentSchema, editCommentHandler),
          )(req, res);
        case 'DELETE':
          return withAuthentication(removeCommentHandler)(req, res);
      }
    } catch (error) {
      log.error(`[${req.method}] ${req.url}`);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }),
);
