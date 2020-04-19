import { FORBIDDEN, NO_CONTENT, NOT_FOUND } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article, Comment } from 'models';
import { CommentSchema } from 'schemas';
import { NextHttpHandler } from 'types';

const showCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');

  if (!comment)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any comment with id: ${req.query.id}`,
    });

  return res.json(comment.toJSON());
};
const editCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');

  if (!comment)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any comment with id: ${req.query.id}`,
    });

  if (comment.author.id !== req.user.id)
    return res.status(FORBIDDEN).json({
      statusCode: FORBIDDEN,
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
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });

  if (!comment)
    return res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any comment with id: ${req.query.id}`,
    });

  const hasAuthorization =
    req.user.id === article.author.id || req.user.id === comment.author.id;

  if (!hasAuthorization)
    return res.status(FORBIDDEN).json({
      statusCode: FORBIDDEN,
      message: 'You are not the author of the article or comment',
    });

  return res.status(NO_CONTENT).json(await article.remove());
};

export default validateMethod(
  ['GET', 'PUT', 'DELETE'],
  connectDB((req, res) => {
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
  }),
);
