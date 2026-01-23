describe('Upload wizard', () => {
  it('renders the upload step', () => {
    cy.visit('/upload-wizard');
    cy.contains('1. Upload Files').should('be.visible');
  });

  it('walks through the upload flow', () => {
    cy.intercept('POST', '/api/validation/validate-row', {
      statusCode: 200,
      body: { errors: [] },
    }).as('validateRow');
    cy.intercept('POST', '/api/claims/upload', {
      statusCode: 200,
      body: { ok: true },
    }).as('uploadClaims');

    cy.visit('/upload-wizard', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'test-token');
      },
    });

    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample_claims.csv', { force: true });
    cy.contains('button', 'Next').click();
    cy.contains('2. Preview').should('be.visible');
    cy.contains('button', 'Next').click();
    cy.contains('3. Fix Errors').should('be.visible');
    cy.contains('button', 'Next').click();
    cy.contains('4. Confirm Tags').should('be.visible');
    cy.contains('button', 'Next').click();
    cy.contains('5. Submit').should('be.visible');
    cy.contains('button', 'Upload').click();
    cy.wait('@uploadClaims');
  });
});
