import { validate } from '@cypress/schema-tools';
import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

import { formats, schemas } from '../../../schemas';

const validateErrorSchema = validate(schemas)('ApiError', '1.0.0');
const validateUserSchema = validate(schemas, formats)('User', '1.0.0');

describe('Login API', () => {
  const url = '/api/auth/login';

  it('should sign in with correct credentials', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        email: Cypress.env('USER_EMAIL') ?? 'john@doe.me',
        password: Cypress.env('USER_PASSWORD') ?? 'Pa$$w0rd!',
      },
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.OK);
      expect(validateUserSchema(body)).to.equal(true);
    });
  });

  it('should validate the payload', () => {
    cy.api({
      url: '/api/auth/login',
      method: 'POST',
      body: {
        email: faker.internet.userName(),
        password: 'short',
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });

  it('should fail to sign in', () => {
    cy.api({
      url: '/api/auth/login',
      method: 'POST',
      body: {
        email: faker.internet.email(),
        password: faker.internet.password(16),
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.UNAUTHORIZED);
      expect(validateErrorSchema(body)).to.equal(true);
    });

    cy.api({
      url: '/api/auth/login',
      method: 'POST',
      body: {
        email: Cypress.env('USER_EMAIL') || 'john@doe.me',
        password: faker.internet.password(16),
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.UNAUTHORIZED);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });
});
