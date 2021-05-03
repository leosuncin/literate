import slugify from '@sindresorhus/slugify';
import mongoose from 'mongoose';
import type { Document, LeanDocument, Types } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

import type { UserDocument, UserJson } from './User';

export interface ArticleBase {
  title: string;
  slug: string;
  subtitle: string;
  draft: boolean;
  body: string;
  tags: string[];
  author: Types.ObjectId;
}

export interface ArticleDocument extends Document<Types.ObjectId>, ArticleBase {
  author: UserDocument['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticlePopulatedDocument
  extends Omit<ArticleDocument, 'author'> {
  author: UserDocument;
}

export interface ArticleJson
  extends Omit<
    LeanDocument<ArticleDocument>,
    '_id' | 'id' | '__v' | 'author' | 'createdAt' | 'updatedAt'
  > {
  author: string | UserJson;
  createdAt: string;
  updatedAt: string;
}

const ArticleSchema = new mongoose.Schema<ArticleDocument>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    draft: {
      type: Boolean,
      default: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

ArticleSchema.plugin(mongooseUniqueValidator, { message: 'already exists' });

ArticleSchema.pre<ArticleDocument>('validate', function (next) {
  const hash = this.slug
    ? this.slug.substr(this.slug.lastIndexOf('-'))
    : '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

  this.slug = slugify(this.title) + hash;

  next();
});

ArticleSchema.methods.toJSON = function (this: ArticleDocument) {
  const article = this.toObject();

  delete article.__v;
  delete article._id;
  // @ts-expect-error
  article.author = this.author.toJSON();

  return article;
};

/* istanbul ignore if */
if (
  process.env.NODE_ENV !== 'production' &&
  mongoose.modelNames().includes('Article')
) {
  mongoose.deleteModel('Article');
}

export const Article = mongoose.model<ArticleDocument>(
  'Article',
  ArticleSchema,
);
