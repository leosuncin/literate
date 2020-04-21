describe('Homepage', () => {
  before(() => {
    cy.visit('/');
  });

  it('should contains «Hello World»', () => {
    cy.findByText(/Hello World/i);
  });
});
