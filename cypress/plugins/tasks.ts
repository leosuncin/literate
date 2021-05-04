import faker from 'faker';
import { Secret, sign, SignOptions } from 'jsonwebtoken';
import { Article, ArticleBase, User } from 'models';
import Fixtures, { Options } from 'node-mongodb-fixtures';
import * as db from 'utils/db';
import { signJWT } from 'utils/jwt';

export type SignParams = {
  payload: string | Record<string, any>;
  secret?: string;
  options?: SignOptions;
};

interface JwtTask {
  /**
   * Sign a new JWT
   *
   * @param {SignParams} params
   * @returns {string} JSON Web Token
   */
  signToken(params: SignParams): string;
  /**
   * Create a JWT from user
   *
   * @param {Object} user
   * @returns {string} JSON Web Token
   */
  signUser(user: Parameters<typeof signJWT>[0]): string;
}

/**
 * Task to create JSON Web Tokens
 *
 * @param {Secret}      secretOrPrivateKey      Secret string o private encrypt key
 * @param {SignOptions} [defaultSingOptions={}] Default sign options to use later
 * @returns {JwtTask} Tasks object
 */
export function jwtTask(
  secretOrPrivateKey: Secret,
  defaultSingOptions: SignOptions = {},
): JwtTask {
  if (!secretOrPrivateKey) throw new Error('Secret or private key is required');

  return {
    signToken({ payload, secret, options = {} }) {
      return sign(
        payload,
        secret ?? secretOrPrivateKey,
        Object.assign(options, defaultSingOptions),
      );
    },
    signUser(user) {
      return signJWT(user);
    },
  };
}

export async function loadFixtures(options: Options = {}) {
  const fixtures = new Fixtures({ ...options, mute: true });

  if (!process.env.MONGODB_URL) return false;

  await fixtures.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await fixtures.unload();
  await fixtures.load();
  await fixtures.disconnect();

  return true;
}

export async function createArticle(overrides: Partial<ArticleBase> = {}) {
  await db.connect();

  if (!overrides.author) {
    const author = new User({
      fullName: faker.name.findName(),
      email: faker.internet.exampleEmail().toLowerCase(),
      password: faker.internet.password(),
    });

    await author.save();

    overrides.author = author._id;
  }

  const article = new Article({
    title: faker.company.catchPhrase(),
    subtitle: faker.lorem.paragraph(),
    body: faker.lorem.paragraphs(),
    tags: faker.lorem.words().split(' '),
    ...overrides,
  });

  await article.save();

  await db.disconnect();

  return article.toJSON();
}
