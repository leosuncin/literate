import { validate } from '@cypress/schema-tools';
import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

import { formats, schemas } from '../../../schemas';

const validateErrorSchema = validate(schemas)('ApiError', '1.0.0');
const validateUserSchema = validate(schemas, formats)('User', '1.0.0');

describe('Register API', () => {
  const url = '/api/auth/register';

  it('should register a new user', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        fullName: faker.name.findName(),
        email: faker.internet.exampleEmail().toLowerCase(),
        password: faker.internet.password(8, true),
      },
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.CREATED);
      expect(validateUserSchema(body)).to.equal(true);
    });
  });

  it('should fail to register a duplicate user', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        fullName: faker.name.findName(),
        email: Cypress.env('USER_EMAIL') ?? 'jane@doe.me',
        password: faker.internet.password(8, true),
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.CONFLICT);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });

  it('should validate the payload', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        fullName: 'no',
        email: 'john',
        password: 'short',
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });

  it('should validate the request method', () => {
    cy.api({ url, failOnStatusCode: false }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.METHOD_NOT_ALLOWED);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });
});
