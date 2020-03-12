import { NOT_FOUND } from 'http-status-codes';
import { connectDB, validateMethod } from 'middlewares';
import { Comment } from 'models';
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

export default validateMethod('GET', connectDB(showCommentHandler));
