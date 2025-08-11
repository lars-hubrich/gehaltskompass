Feature: Dashboard page
  Scenario: Display empty dashboard when there are no statements
    Given I am logged in
    And there are no statements
    When I visit the dashboard page
    Then I see the empty dashboard message

  Scenario: Display dashboard overview with statements
    Given I am logged in
    And there are sample statements
    When I visit the dashboard page
    Then I see the dashboard overview
