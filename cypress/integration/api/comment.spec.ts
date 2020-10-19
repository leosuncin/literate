import { validate } from '@cypress/schema-tools';
import faker from 'faker';
import { StatusCodes } from 'http-status-codes';

import { formats, schemas } from '../../schemas';

const validateCommentSchema = validate(schemas, formats)('Comment', '1.0.0');
const validateErrorSchema = validate(schemas)('ApiError', '1.0.0');

function fakeObjectId(): string {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);

  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase()
  );
}

describe('Comment API', () => {
  const url = '/api/article/v-gordon-childe-rpl8kh/comment';
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

  it('should add a new comment to an article', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        body: faker.lorem.paragraph(),
      },
      headers: { authorization },
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.CREATED);
      expect(validateCommentSchema(body)).to.equal(true);
    });
  });

  it('should validate before add a comment to an article', () => {
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

  it('should list all the comments from an article', () => {
    cy.api({
      url,
      method: 'GET',
    }).then(({ status, body }) => {
      expect(status).to.equal(StatusCodes.OK);
      expect(Array.isArray(body)).to.equal(true);
      expect(
        body.every(comment => validateCommentSchema(comment) === true),
      ).to.equal(true);
    });
  });

  it('should get one comment from an article', () => {
    cy.api({
      url,
      method: 'GET',
    })
      .its('body')
      .then((comments: Record<string, any>[]) => {
        const comment = faker.random.arrayElement(comments);

        return cy.api({
          url: `${url}/${comment.id}`,
        });
      })
      .then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.OK);
        expect(validateCommentSchema(body)).to.equal(true);
      });
  });

  it('should update a comment from an article', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        body: faker.lorem.paragraph(),
      },
      headers: { authorization },
    })
      .its('body')
      .then(comment => {
        return cy.api({
          url: `${url}/${comment.id}`,
          method: 'PUT',
          body: {
            body: faker.lorem.sentences(),
          },
          headers: { authorization },
        });
      })
      .then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.OK);
        expect(validateCommentSchema(body)).to.equal(true);
      });
  });

  it('should remove a comment from an article', () => {
    cy.api({
      url,
      method: 'POST',
      body: {
        body: faker.lorem.paragraph(),
      },
      headers: { authorization },
    })
      .its('body')
      .then(comment => {
        return cy.api({
          url: `${url}/${comment.id}`,
          method: 'DELETE',
          headers: { authorization },
        });
      })
      .its('status')
      .should('equal', StatusCodes.NO_CONTENT);
  });

  it('should validate the request method', () => {
    cy.api({
      url,
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
      url: `${url}/${faker.random.uuid()}`,
      method: 'POST',
      body: {
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
    it('should fail to add a comment', () => {
      cy.api({
        url,
        method: 'POST',
        body: {
          body: faker.lorem.paragraph(),
        },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.UNAUTHORIZED);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to update a comment', () => {
      cy.api({
        url,
        method: 'POST',
        body: {
          body: faker.lorem.paragraph(),
        },
        headers: { authorization },
      })
        .its('body')
        .then(comment => {
          return cy.api({
            url: `${url}/${comment.id}`,
            method: 'PUT',
            body: {
              body: faker.lorem.sentences(),
            },
            failOnStatusCode: false,
          });
        })
        .then(({ status, body }) => {
          expect(status).to.equal(StatusCodes.UNAUTHORIZED);
          expect(validateErrorSchema(body)).to.equal(true);
        });
    });
  });

  context('With different author', () => {
    let token: string;

    beforeEach(() => {
      const user = {
        _id: '5e9cd0178f8fa801aa70f56a',
        fullName: 'Jane Doe',
        displayName: 'Jane',
        email: 'jane@doe.me',
      };
      cy.task('signUser', user).then((jwt: string) => {
        token = jwt;
      });
    });

    it('should forbid to update a comment', () => {
      cy.api({
        url,
        method: 'POST',
        body: {
          body: faker.lorem.paragraph(),
        },
        headers: { authorization },
      })
        .its('body')
        .then(comment => {
          return cy.api({
            url: `${url}/${comment.id}`,
            method: 'PUT',
            body: {
              body: faker.lorem.sentences(),
            },
            headers: { authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        })
        .then(({ status, body }) => {
          expect(status).to.equal(StatusCodes.FORBIDDEN);
          expect(validateErrorSchema(body)).to.equal(true);
        });
    });

    it('should forbid to remove a comment', () => {
      cy.api({
        url,
        method: 'POST',
        body: {
          body: faker.lorem.paragraph(),
        },
        headers: { authorization },
      })
        .its('body')
        .then(comment => {
          return cy.api({
            url: `${url}/${comment.id}`,
            method: 'DELETE',
            headers: { authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        })
        .then(({ status, body }) => {
          expect(status).to.equal(StatusCodes.FORBIDDEN);
          expect(validateErrorSchema(body)).to.equal(true);
        });
    });
  });

  context('Article not exist', () => {
    const url = `/api/article/${faker.lorem.slug()}/comment`;

    it('should fail to add', () => {
      cy.api({
        url,
        method: 'POST',
        body: {
          body: faker.lorem.paragraph(),
        },
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to list', () => {
      cy.api({
        url,
        body: {
          body: faker.lorem.paragraph(),
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
        url: `/api/article/${faker.lorem.slug()}/comment/${fakeObjectId()}`,
        method: 'DELETE',
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });
  });

  context('Comment not exist', () => {
    const url = `/api/article/v-gordon-childe-rpl8kh/comment/${fakeObjectId()}`;

    it('should fail to get one', () => {
      cy.api({
        url,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to update one', () => {
      cy.api({
        url,
        method: 'PUT',
        body: {
          body: faker.lorem.sentence(),
        },
        headers: { authorization },
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.equal(StatusCodes.NOT_FOUND);
        expect(validateErrorSchema(body)).to.equal(true);
      });
    });

    it('should fail to remove one', () => {
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
