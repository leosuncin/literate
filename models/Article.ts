import slugify from '@sindresorhus/slugify';
import mongoose, { Document, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

import { User } from './User';

export interface Article extends Document {
  title: string;
  slug: string;
  subtitle: string;
  draft: boolean;
  body: string;
  tags: string[];
  author: User;
}

const ArticleSchema = new Schema<Article>(
  {
    title: {
      type: Schema.Types.String,
      required: true,
      index: true,
    },
    slug: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      lowercase: true,
    },
    subtitle: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    draft: {
      type: Schema.Types.Boolean,
      default: true,
    },
    body: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: Schema.Types.String,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

ArticleSchema.plugin(mongooseUniqueValidator, { message: 'already exists' });
ArticleSchema.pre<Article>('validate', function (next) {
  const hash = this.slug
    ? this.slug.substr(this.slug.lastIndexOf('-'))
    : '-' + ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

  this.slug = slugify(this.title) + hash;

  next();
});
ArticleSchema.methods.toJSON = function (this: Article) {
  const article = this.toObject();

  delete article.__v;
  delete article._id;
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

export const Article = mongoose.model<Article>('Article', ArticleSchema);
