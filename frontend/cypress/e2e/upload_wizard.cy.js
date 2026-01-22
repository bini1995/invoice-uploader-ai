describe('Upload wizard', () => {
  it('renders the upload step', () => {
    cy.visit('/upload-wizard');
    cy.contains('1. Upload Files').should('be.visible');
  });
});
