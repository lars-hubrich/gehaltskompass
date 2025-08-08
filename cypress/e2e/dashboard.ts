import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const sampleStatements = [
  {
    month: 1,
    year: 2024,
    incomes: [],
    brutto_tax: 5000,
    brutto_av: 0,
    brutto_pv: 0,
    brutto_rv: 0,
    brutto_kv: 0,
    deduction_tax_income: 1000,
    deduction_tax_church: 0,
    deduction_tax_solidarity: 0,
    deduction_tax_other: 0,
    social_av: 500,
    social_pv: 100,
    social_rv: 400,
    social_kv: 300,
    payout_netto: 2700,
    payout_transfer: 0,
    payout_vwl: 0,
    payout_other: 0,
  },
];

Given("I am logged in", () => {
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: { name: "Test User", email: "test@example.com" },
      expires: "2099-12-31T23:59:59.999Z",
    },
  });
});

Given("there are no statements", () => {
  cy.intercept("GET", "/api/statement", { statusCode: 200, body: [] });
});

Given("there are sample statements", () => {
  cy.intercept("GET", "/api/statement", {
    statusCode: 200,
    body: sampleStatements,
  });
});

When("I visit the dashboard page", () => {
  cy.visit("/dashboard");
});

Then("I see the empty dashboard message", () => {
  cy.contains("Noch keine Gehaltsabrechnungen").should("be.visible");
});

Then("I see the dashboard overview", () => {
  cy.contains("Übersicht").should("be.visible");
});
