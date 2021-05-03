import { StatusCodes } from 'http-status-codes';
import {
  catchErrors,
  connectDB,
  validateBody,
  validateMethod,
  withAuthentication,
} from 'middlewares';
import { Article, Comment } from 'models';
import { commentCreate, pagination } from 'schemas';
import { NextHttpHandler, NotFoundError } from 'types';

const createCommentHandler: NextHttpHandler = async (req, res) => {
  const comment = new Comment(req.body);
  const article = await Article.findOne({ slug: req.query.slug as string });
  comment.article = article._id;
  comment.author = req.user._id;

  if (!article)
    throw new NotFoundError(
      `Not found any article with slug: ${req.query.slug}`,
    );

  await comment.save();

  return res.status(StatusCodes.CREATED).json(comment.toJSON());
};

const listCommentHandler: NextHttpHandler = async (req, res) => {
  const { page, size } = await pagination.validate(req.query);
  const article = await Article.findOne({ slug: req.query.slug as string });
  const comments = await Comment.find({ article: article._id })
    .populate('author')
    .limit(size)
    .skip(size * (page - 1));

  if (!article)
    throw new NotFoundError(
      `Not found any article with slug: ${req.query.slug}`,
    );

  return res.json(comments);
};

export default catchErrors(
  validateMethod(
    ['GET', 'POST'],
    connectDB((req, res) => {
      switch (req.method) {
        case 'POST':
          return withAuthentication(
            validateBody(commentCreate, createCommentHandler),
          )(req, res);
        case 'GET':
          return listCommentHandler(req, res);
      }
    }),
  ),
);
