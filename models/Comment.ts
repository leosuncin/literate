import mongoose, { Document, Schema } from 'mongoose';
import mongooseIdValidator from 'mongoose-id-validator';

import { Article, User } from '.';

export interface Comment extends Document {
  body: string;
  author: User;
  article: Article;
}

const CommentSchema = new Schema<Comment>(
  {
    body: {
      type: Schema.Types.String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
  },
  { timestamps: true },
);
CommentSchema.plugin(mongooseIdValidator, { message: 'not exits' });
CommentSchema.methods.toJSON = function (this: Comment) {
  const comment = this.toObject();

  comment.id = comment._id;
  delete comment._id;
  delete comment.__v;
  delete comment.article;
  comment.author = this.author.toJSON();

  return comment;
};

/* istanbul ignore if */
if (
  process.env.NODE_ENV !== 'production' &&
  mongoose.modelNames().includes('Comment')
) {
  mongoose.deleteModel('Comment');
}

export const Comment = mongoose.model<Comment>('Comment', CommentSchema);
