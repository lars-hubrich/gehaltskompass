import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

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

Given("the AI backend returns an answer", () => {
  cy.intercept("POST", "/api/chat", {
    statusCode: 200,
    body: { answer: "42" },
  });
});

When("I visit the insights page", () => {
  cy.visit("/insights");
});

When("I submit a question", () => {
  cy.get("textarea").type("Was ist die Antwort?");
  cy.contains("button", "Frage stellen").click();
});

Then("I see the AI response", () => {
  cy.contains("42").should("be.visible");
});
