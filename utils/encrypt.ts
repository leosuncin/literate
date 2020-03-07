import { pbkdf2Sync, randomBytes } from 'crypto';

const defaultIterations = 10e3;
const digest = 'sha512';

function genSalt(length = 16): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex');
}

export function hash(password: string, length = 16): string {
  const salt = genSalt(length);

  const hash = pbkdf2Sync(password, salt, defaultIterations, length, digest);
  const tmpBuffer = Buffer.from(hash.toString('hex') + ':' + salt);

  return tmpBuffer.toString('base64');
}

export function compare(hash: string, password: string) {
  const auxBuffer = Buffer.from(hash, 'base64');
  const [key, salt] = auxBuffer.toString('utf-8').split(':');
  const tmpHash = pbkdf2Sync(
    password,
    salt,
    defaultIterations,
    salt.length,
    digest,
  );

  return key === tmpHash.toString('hex');
}
