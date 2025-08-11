Feature: Insights page

  Scenario: Ask a question and receive an answer
    Given I am logged in
    And the AI backend returns an answer
    When I visit the insights page
    And I submit a question
    Then I see the AI response
