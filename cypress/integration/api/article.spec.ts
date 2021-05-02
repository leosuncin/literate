import { validate } from '@cypress/schema-tools';
import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

import { formats, schemas } from '../../schemas';

const validateArticleSchema = validate(schemas, formats)('Article', '1.0.0');
const validateErrorSchema = validate(schemas)('ApiError', '1.0.0');

describe('Article API', () => {
  const url = '/api/article';
  let authorization: string;

  beforeEach(() => {
    const user = {
      _id: '5e9cce858f8fa801aa70f569',
      fullName: 'John Doe',
      displayName: 'John',
      email: 'john@doe.me',
    };
    cy.task('signUser', user).then((jwt: string) => {
      authorization = `Bearer ${jwt}`;
    });
  });

  it('should create a new article', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        title: faker.lorem.words(),
        subtitle: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        tags: faker.random.words(3).split(' '),
      },
      headers: { authorization },
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.CREATED);
      expect(validateArticleSchema(body)).to.equal(true);
    });
  });

  it('should validate before create an article', () => {
    cy.api({
      url,
      method: 'POST',
      body: {},
      headers: { authorization },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });

  it('should list all articles', () => {
    cy.api({
      url,
      method: 'GET',
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.OK);
      expect(Array.isArray(body)).to.equal(true);
      expect(
        body.every(article => validateArticleSchema(article) === true),
      ).to.equal(true);
    });
  });

  it('should get one article', () => {
    cy.api({
      url: `${url}/v-gordon-childe-rpl8kh`,
      method: 'GET',
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.OK);
      expect(validateArticleSchema(body)).to.equal(true);
    });
  });

  it('should update an article', () => {
    const payload = {
      title: faker.company.catchPhrase(),
      subtitle: faker.lorem.sentence(),
      body: faker.lorem.paragraph(),
    };
    cy.api({
      url:
        '/api/article/funneling-branding-in-order-to-disrupt-the-balance-h7bs3m',
      method: 'PUT',
      body: payload,
      headers: { authorization },
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.OK);
      expect(validateArticleSchema(body)).to.equal(true);
      expect(body.subtitle).to.equal(payload.subtitle);
    });
  });

  it('should publish an article', () => {
    cy.api({
      url: '/api/article/2020-nagorno-karabakh-conflict-nxg8n7',
      method: 'PATCH',
      body: {
        draft: false,
      },
      headers: { authorization },
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.OK);
      expect(body.draft).to.equal(false);
    });
  });

  it('should remove one article', () => {
    cy.api({
      url: '/api/article',
      method: 'POST',
      body: {
        title: faker.lorem.words(),
        subtitle: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        tags: faker.random.words(3).split(' '),
      },
      headers: { authorization },
    })
      .its('body')
      .then(article => {
        return cy.api({
          url: `/api/article/${article.slug}`,
          method: 'DELETE',
          headers: { authorization },
        });
      })
      .its('status')
      .should('equal', StatusCodes.NO_CONTENT);
  });

  it('should validate the request method', () => {
    cy.api({
      url: '/api/article',
      method: 'PUT',
      body: {
        body: faker.lorem.paragraph(),
      },
      headers: { authorization },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.METHOD_NOT_ALLOWED);
      expect(validateErrorSchema(body)).to.equal(true);
    });

    cy.api({
      url:
        '/api/article/funneling-branding-in-order-to-disrupt-the-balance-h7bs3m',
      method: 'POST',
      body: {
        subtitle: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
      },
      headers: { authorization },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.METHOD_NOT_ALLOWED);
      expect(validateErrorSchema(body)).to.equal(true);
    });
  });

  context('Without authorization', () => {
    it('should fail to create an article', () => {
      const body = {
        title: faker.lorem.words(),
        subtitle: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        tags: faker.random.words(3).split(' '),
      };

      cy.api({
        url,
        method: 'POST',
        body,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.UNAUTHORIZED);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to update an article', () => {
      cy.api({
        url:
          '/api/article/funneling-branding-in-order-to-disrupt-the-balance-h7bs3m',
        method: 'PUT',
        body: {
          body: faker.lorem.paragraphs(),
        },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.UNAUTHORIZED);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to publish an article', () => {
      cy.api({
        url: '/api/article/2020-nagorno-karabakh-conflict-nxg8n7',
        method: 'PATCH',
        body: {
          draft: faker.datatype.boolean(),
        },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.UNAUTHORIZED);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to remove an article', () => {
      cy.api({
        url: '/api/article/optio-et-voluptatibus-stv3jn',
        method: 'DELETE',
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.UNAUTHORIZED);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });
  });

  context('With different author', () => {
    let authorization: string;

    beforeEach(() => {
      const user = {
        _id: '5e9cd4548f8fa801aa70f56b',
        fullName: 'Lamarr Workman',
        displayName: 'Lamarr Workman',
        email: 'lamarr_workman@example.com',
      };
      cy.task('signUser', user).then((jwt: string) => {
        authorization = `Bearer ${jwt}`;
      });
    });

    it('should forbid to update an article', () => {
      cy.api({
        url: '/api/article/leverage-agile-frameworks-cdg7ud',
        method: 'PUT',
        body: {},
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.FORBIDDEN);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should forbid to publish an article', () => {
      cy.api({
        url: '/api/article/leverage-agile-frameworks-cdg7ud',
        method: 'PATCH',
        body: {
          draft: faker.datatype.boolean(),
        },
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.FORBIDDEN);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should forbid to remove an article', () => {
      cy.api({
        url: '/api/article/leverage-agile-frameworks-cdg7ud',
        method: 'DELETE',
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.FORBIDDEN);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });
  });

  context('Article not exist', () => {
    const url = `/api/article/${faker.lorem.slug()}`;

    it('should fail to get one', () => {
      cy.api({
        url,
        method: 'GET',
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to update', () => {
      cy.api({
        url,
        method: 'PUT',
        body: {
          body: faker.lorem.paragraphs(),
        },
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to publish', () => {
      cy.api({
        url,
        method: 'PATCH',
        body: {
          draft: faker.datatype.boolean(),
        },
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to remove', () => {
      cy.api({
        url,
        method: 'DELETE',
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });
  });
});
