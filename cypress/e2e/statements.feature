Feature: Statements page

  Scenario: Display statements grid with data
    Given I am logged in
    And there are statement overviews
    When I visit the statements page
    Then I see the statements grid
    And the sample statement is shown
