import mongoose, { Document, Query, Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import { compare, hash } from 'utils/encrypt';

export interface User extends Document {
  fullName: string;
  displayName: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
  comparePassword(plainPassword: string): boolean;
}

const UserSchema = new Schema<User>(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    displayName: {
      type: Schema.Types.String,
      required: true,
      default(this: User) {
        return this.fullName;
      },
    },
    email: {
      type: Schema.Types.String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    bio: {
      type: Schema.Types.String,
      required: false,
      default: null,
    },
    avatar: {
      type: Schema.Types.String,
      required: false,
      default(this: User) {
        return `https://api.adorable.io/avatars/64/${encodeURIComponent(
          this.displayName,
        )}`;
      },
    },
  },
  { timestamps: true },
);

UserSchema.plugin(mongooseUniqueValidator, { message: 'is already taken' });
UserSchema.methods.comparePassword = function (
  this: User,
  plainPassword: string,
): boolean {
  return compare(this.password, plainPassword);
};
UserSchema.methods.toJSON = function (this: User) {
  const obj = this.toObject();

  delete obj.password;
  delete obj.__v;
  delete obj._id;

  return obj;
};
UserSchema.index({ displayName: 1, email: 1 });
UserSchema.pre<User>('save', function (next) {
  if (!this.isModified('password')) return next();

  this.password = hash(this.password, 512);

  return next();
});
UserSchema.pre<Query<User>>('findOneAndUpdate', function (next) {
  if ('password' in this.getUpdate())
    this.getUpdate().password = hash(this.getUpdate().password, 512);

  return next();
});

/* istanbul ignore if */
if (
  process.env.NODE_ENV !== 'production' &&
  mongoose.modelNames().includes('User')
) {
  mongoose.deleteModel('User');
}

export const User = mongoose.model<User>('User', UserSchema);
