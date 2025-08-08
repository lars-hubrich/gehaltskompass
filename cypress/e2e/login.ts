import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I visit the login page", () => {
  cy.visit("/login");
});

Then("I see the GitHub sign in button", () => {
  cy.contains("button", "Mit Github Anmelden").should("be.visible");
});
