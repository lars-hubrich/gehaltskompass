import { When, Then, Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the home page", () => {
  cy.visit("/");
});

When("I type and submit a post", () => {
  const title = "Test Post Title";
  const content = "Test Post Content";

  cy.get("#title").type(title);
  cy.get("#content").type(content);
  cy.contains("button", "Erstellen").click();
});

Then("I should see the post in the list", () => {
  cy.get("ul li").should("exist");
  cy.get("h2.font-semibold").should("contain", "Test Post Title");
  cy.get("p.text-sm").should("contain", "Test Post Content");
});
