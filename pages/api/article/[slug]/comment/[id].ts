import { FORBIDDEN, NOT_FOUND } from 'http-status-codes';
import {
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Comment } from 'models';
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

export default validateMethod(
  ['GET', 'PUT'],
  connectDB((req, res) => {
    switch (req.method) {
      case 'GET':
        return showCommentHandler(req, res);
      case 'PUT':
        return withAuthentication(
          validateBody(CommentSchema, editCommentHandler),
        )(req, res);
    }
  }),
);
