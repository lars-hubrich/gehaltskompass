Feature: Authentication

  Scenario: Redirect logged in user from home to dashboard
    Given I am logged in
    When I visit the home page
    Then I am redirected to the dashboard page

  Scenario: Allow logged in user to access dashboard
    Given I am logged in
    When I visit the dashboard page
    Then I stay on the dashboard page

  Scenario: Allow logged in user to access insights
    Given I am logged in
    When I visit the insights page
    Then I stay on the insights page

  Scenario: Allow logged in user to access statements
    Given I am logged in
    When I visit the statements page
    Then I stay on the statements page
