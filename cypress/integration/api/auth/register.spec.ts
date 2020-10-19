import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

describe('Register API', () => {
  const url = '/api/auth/register';

  it('should register a new user', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        fullName: faker.name.findName(),
        email: faker.internet.exampleEmail(),
        password: faker.internet.password(8, true),
      },
    })
      .its('status')
      .should('equal', StatusCodes.CREATED);
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
      expect(body).to.have.keys(['message', 'statusCode']);
      expect(body.message).to.equal('Email is already taken');
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
      expect(body).to.have.keys(['message', 'statusCode', 'errors']);
    });
  });

  it('should validate the request method', () => {
    cy.api({ url, failOnStatusCode: false })
      .its('status')
      .should('equal', StatusCodes.METHOD_NOT_ALLOWED);
  });
});
