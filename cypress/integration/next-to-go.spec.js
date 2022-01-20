const buttonLabels = ['All Races', 'Greyhounds', 'Harness', 'Thoroughbreds'];
const buttonColour = 'rgb(205, 0, 44)';

describe('Next to Go', () => {
  const eventLocator = '.item';
  const buttonLocator = '.buttonToggle';

  beforeEach(() => {
    cy.visit('/');
  });

  it('Renders 5 events by default',
    () => {
      cy.get(eventLocator).should('have.length', 5);
    });

  it('Renders all 5 buttons', () => {
    cy.get(buttonLocator).should('have.length', 4).as('button');
    cy.wrap(buttonLabels).each((label) => {
      cy.contains(buttonLocator, label).should('be.visible').should('have.css', 'background-color', buttonColour)
    });
  });
});
