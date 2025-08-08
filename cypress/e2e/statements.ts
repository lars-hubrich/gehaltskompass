import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const sampleStatements = [
  {
    id: "1",
    month: 1,
    year: 2024,
    brutto_tax: 5000,
    payout_netto: 2700,
  },
];

/**
 * Mocks the authentication request to simulate a logged-in user.
 */
const loginIntercept = () => {
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: { name: "Test User", email: "test@example.com" },
      expires: "2099-12-31T23:59:59.999Z",
    },
  });
};

Given("I am logged in", () => {
  loginIntercept();
});

Given("there are statement overviews", () => {
  cy.intercept("GET", "/api/statement", {
    statusCode: 200,
    body: sampleStatements,
  });
});

When("I visit the statements page", () => {
  cy.visit("/statements");
});

Then("I see the statements grid", () => {
  cy.contains("Gehaltsabrechnungen").should("be.visible");
});

Then("the sample statement is shown", () => {
  cy.contains("5000.00 €").should("be.visible");
});
