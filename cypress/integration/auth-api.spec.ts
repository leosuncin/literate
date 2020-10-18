import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

describe('Auth api', () => {
  describe('Register', () => {
    it('should register a new user', () => {
      cy.request('POST', '/api/auth/register', {
        fullName: faker.name.findName(),
        email: faker.internet.exampleEmail(),
        password: faker.internet.password(8, true),
      })
        .get('status')
        .should('be', StatusCodes.CREATED);
    });

    it('should validate the payload', () => {
      cy.request({
        url: '/api/auth/register',
        method: 'POST',
        body: {
          fullName: 'no',
          email: 'john',
          password: 'short',
        },
        failOnStatusCode: false,
      })
        .get('status')
        .should('be', StatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe('Login', () => {
    it('should sign in', () => {
      cy.request('POST', '/api/auth/login', {
        email: Cypress.env('USER_EMAIL') || 'john@doe.me',
        password: Cypress.env('USER_PASSWORD') || 'Pa$$w0rd!',
      })
        .get('status')
        .should('be', StatusCodes.OK);
    });

    it('should validate the payload', () => {
      cy.request({
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: 'john',
          password: 'short',
        },
        failOnStatusCode: false,
      })
        .get('status')
        .should('be', StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('should fail to sign in', () => {
      cy.request({
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: faker.internet.email(),
          password: faker.internet.password(16),
        },
        failOnStatusCode: false,
      })
        .get('status')
        .should('be', StatusCodes.UNAUTHORIZED);
      cy.request({
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: Cypress.env('USER_EMAIL') || 'john@doe.me',
          password: faker.internet.password(16),
        },
        failOnStatusCode: false,
      })
        .get('status')
        .should('be', StatusCodes.UNAUTHORIZED);
    });
  });
});
