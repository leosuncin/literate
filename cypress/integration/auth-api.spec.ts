import faker from 'faker';
import { CREATED, OK } from 'http-status-codes';

describe('Auth api', () => {
  describe('Register', () => {
    it('should register a new user', () => {
      cy.request({
        url: '/api/auth/register',
        method: 'POST',
        body: {
          fullName: faker.name.findName(),
          email: faker.internet.exampleEmail(),
          password: faker.internet.password(8, true),
        },
      })
        .get('status')
        .should('be', CREATED);
    });
  });

  describe('Login', () => {
    it('should sign in', () => {
      cy.request({
        url: '/api/auth/login',
        method: 'POST',
        body: {
          email: Cypress.env('USER_EMAIL') || 'john@doe.me',
          password: Cypress.env('USER_PASSWORD') || 'Pa$$w0rd!',
        },
      })
        .get('status')
        .should('be', OK);
    });
  });
});
