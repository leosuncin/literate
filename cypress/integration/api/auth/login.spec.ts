import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

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
    })
      .its('status')
      .should('equal', StatusCodes.OK);
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
      expect(body).to.have.keys(['message', 'statusCode', 'errors']);
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
    })
      .its('status')
      .should('equal', StatusCodes.UNAUTHORIZED);

    cy.api({
      url: '/api/auth/login',
      method: 'POST',
      body: {
        email: Cypress.env('USER_EMAIL') || 'john@doe.me',
        password: faker.internet.password(16),
      },
      failOnStatusCode: false,
    })
      .its('status')
      .should('equal', StatusCodes.UNAUTHORIZED);
  });
});
