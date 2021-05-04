import mongoose from 'mongoose';
import type { Document, LeanDocument, Types } from 'mongoose';
import mongooseIdValidator from 'mongoose-id-validator';

import type { ArticleDocument } from './Article';
import type { UserDocument, UserJson } from './User';

export interface CommentBase {
  body: string;
  author: Types.ObjectId;
  article: Types.ObjectId;
}

export interface CommentDocument extends Document<Types.ObjectId>, CommentBase {
  author: UserDocument['_id'];
  article: ArticleDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentPopulatedDocument
  extends Omit<CommentDocument, 'author'> {
  author: UserDocument;
  article: ArticleDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentJson
  extends Omit<
    LeanDocument<CommentDocument>,
    '_id' | '__v' | 'author' | 'article' | 'createdAt' | 'updatedAt'
  > {
  author: string | UserJson;
  createdAt: string;
  updatedAt: string;
}

const CommentSchema = new mongoose.Schema<CommentDocument>(
  {
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
  },
  { timestamps: true },
);

CommentSchema.plugin(mongooseIdValidator, { message: 'not exits' });

CommentSchema.methods.toJSON = function (this: CommentDocument) {
  const comment = this.toObject();

  comment.id = comment._id;
  delete comment._id;
  delete comment.__v;
  delete comment.article;
  // @ts-expect-error
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

export const Comment = mongoose.model<CommentDocument>(
  'Comment',
  CommentSchema,
);
