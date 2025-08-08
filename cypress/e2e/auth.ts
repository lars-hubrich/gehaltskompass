import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in", () => {
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: { name: "Test User", email: "test@example.com" },
      expires: "2099-12-31T23:59:59.999Z",
    },
  });
});

When("I visit the home page", () => {
  cy.intercept("GET", "/api/statement", { statusCode: 200, body: [] });
  cy.visit("/");
});

When("I visit the dashboard page", () => {
  cy.intercept("GET", "/api/statement", { statusCode: 200, body: [] });
  cy.visit("/dashboard");
});

When("I visit the insights page", () => {
  cy.visit("/insights");
});

When("I visit the statements page", () => {
  cy.intercept("GET", "/api/statement", { statusCode: 200, body: [] });
  cy.visit("/statements");
});

Then("I am redirected to the login page", () => {
  cy.location("pathname").should("eq", "/login");
  cy.contains("button", "Mit Github Anmelden").should("be.visible");
});

Then("I am redirected to the dashboard page", () => {
  cy.location("pathname").should("eq", "/dashboard");
});

Then("I stay on the dashboard page", () => {
  cy.location("pathname").should("eq", "/dashboard");
});

Then("I stay on the insights page", () => {
  cy.location("pathname").should("eq", "/insights");
});

Then("I stay on the statements page", () => {
  cy.location("pathname").should("eq", "/statements");
});
