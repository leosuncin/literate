import faker from 'faker';
import { CREATED } from 'http-status-codes';

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
});
