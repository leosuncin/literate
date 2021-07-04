import mongoose from 'mongoose';
import type { Document, LeanDocument, Model, Types } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import { compare, hash } from 'utils/encrypt';

export interface UserBase {
  fullName: string;
  displayName: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
}

export interface UserDocument extends Document<Types.ObjectId>, UserBase {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plainPassword: string): boolean;
}

export type UserModel = Model<UserDocument>;

export interface UserJson
  extends Omit<
    LeanDocument<UserDocument>,
    | '_id'
    | 'id'
    | '__v'
    | 'password'
    | 'comparePassword'
    | 'createdAt'
    | 'updatedAt'
  > {
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new mongoose.Schema<UserDocument, UserModel, UserBase>(
  {
    fullName: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      default(this: UserDocument) {
        return this.fullName;
      },
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: false,
      default: null,
    },
    avatar: {
      type: String,
      required: false,
      default(this: UserDocument) {
        return `https://api.adorable.io/avatars/64/${encodeURIComponent(
          this.displayName,
        )}`;
      },
    },
  },
  { timestamps: true },
);

UserSchema.plugin(mongooseUniqueValidator, { message: 'is already taken' });

UserSchema.methods.comparePassword = function (plainPassword: string): boolean {
  return compare(this.password, plainPassword);
};

UserSchema.methods.toJSON = function (this: UserDocument) {
  const obj = this.toObject();

  delete obj.password;
  delete obj.__v;
  delete obj._id;

  return obj;
};

UserSchema.index({ displayName: 1, email: 1 });

UserSchema.pre<UserDocument>('save', function (next) {
  if (!this.isModified('password')) return next();

  this.password = hash(this.password, 512);

  return next();
});

/* istanbul ignore if */
if (
  process.env.NODE_ENV !== 'production' &&
  mongoose.modelNames().includes('User')
) {
  mongoose.deleteModel('User');
}

export const User = mongoose.model<UserDocument>('User', UserSchema);
