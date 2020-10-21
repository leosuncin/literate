import { StatusCodes } from 'http-status-codes';
import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article, Comment } from 'models';
import { CommentSchema } from 'schemas';
import { ForbiddenError, NextHttpHandler, NotFoundError } from 'types';

const showCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');

  if (!comment)
    throw new NotFoundError(`Not found any comment with id: ${req.query.id}`);

  return res.json(comment.toJSON());
};

const editCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id).populate('author');

  if (!comment)
    throw new NotFoundError(`Not found any comment with id: ${req.query.id}`);

  if (comment.author.id !== req.user.id)
    throw new ForbiddenError('You are not the author');

  comment.body = req.body.body;

  return res.json(await comment.save());
};

const removeCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = await Comment.findById(req.query.id);
  const article = await Article.findOne({
    slug: req.query.slug as string,
  });

  if (!article)
    throw new NotFoundError(
      `Not found any article with slug: ${req.query.slug}`,
    );

  if (!comment)
    throw new NotFoundError(`Not found any comment with id: ${req.query.id}`);

  const hasAuthorization =
    req.user.id === article.author.toString() ||
    req.user.id === comment.author.toString();

  if (!hasAuthorization)
    throw new ForbiddenError(
      'You are not the author of the article or comment',
    );

  await comment.remove();

  return res.status(StatusCodes.NO_CONTENT).json(null);
};

export default catchErrors(
  validateMethod(
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
  ),
);
